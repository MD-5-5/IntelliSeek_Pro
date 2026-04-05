import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY
})

const searchInternetTool = tool(
  searchInternet,
  {
    name: "searchInternet",
    description: "Use this tool to get the latest information from the internet.",
    schema: z.object({
      query: z.string().describe("The search query to look up on the internet.")
    })
  }
)

const agent = createAgent({
  model: mistralModel,
  tools: [searchInternetTool],
})

function getLatestUserMessage(messages) {
  for (let index = messages.length - 1; index >= 0; index--) {
    if (messages[index].role === "user") {
      return messages[index].content;
    }
  }
  return "";
}

function shouldUseInternetSearch(query) {
  if (!query) return false;
  const lowerQuery = query.toLowerCase();
  return [
    "latest", "current", "today", "now", "recent", "as of",
    "update", "news", "price", "prices", "rate", "rates",
    "cost", "stock", "market", "petrol", "diesel", "lpg",
    "gas cylinder", "gold rate", "weather",
  ].some((keyword) => lowerQuery.includes(keyword));
}

function buildMessages(messages, freshSearchResults) {
  const today = new Date().toISOString().split("T")[0];

  return [
    new SystemMessage(`
      You are a helpful and precise assistant for answering questions.
      If you don't know the answer, say you don't know.
      Today's date is ${today}.
      If the user asks for current, latest, recent, or price-sensitive information, do not rely on stale model memory.
      Use the "searchInternet" tool for up-to-date information, and prefer the freshest dates you can find.
      If search results are provided in the conversation, prioritize them over your internal memory and mention the date clearly in your answer.
    `),
    ...(freshSearchResults ? [
      new SystemMessage(`
        Fresh internet search results were retrieved for the user's latest question.
        Base your answer primarily on these results and clearly state the date/timeframe you are using.
        Search results:
        ${freshSearchResults}
      `)
    ] : []),
    ...messages.map(msg => {
      if (msg.role === "user") return new HumanMessage(msg.content)
      if (msg.role === "ai") return new AIMessage(msg.content)
    })
  ]
}

export async function generateResponse(messages) {
  const latestUserMessage = getLatestUserMessage(messages)
  const shouldForceFreshSearch = shouldUseInternetSearch(latestUserMessage)
  let freshSearchResults = null

  if (shouldForceFreshSearch) {
    try {
      freshSearchResults = await searchInternet({ query: latestUserMessage })
    } catch (error) {
      console.error("Internet search failed:", error)
    }
  }

  const response = await agent.invoke({
    messages: buildMessages(messages, freshSearchResults)
  })

  return response.messages[response.messages.length - 1].text
}

// ── NEW: Hybrid response with NeuroVault vault context ──
export async function generateHybridResponse(messages, vaultContext) {

  // If no vault context, fall back to normal response
  if (!vaultContext) {
    return generateResponse(messages)
  }

  const latestUserMessage = getLatestUserMessage(messages)
  const shouldForceFreshSearch = shouldUseInternetSearch(latestUserMessage)
  let freshSearchResults = null

  if (shouldForceFreshSearch) {
    try {
      freshSearchResults = await searchInternet({ query: latestUserMessage })
    } catch (error) {
      console.error("Internet search failed:", error)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  const response = await agent.invoke({
    messages: [
      new SystemMessage(`
        You are IntelliSeek, an intelligent research assistant with access to both the web and the user's personal NeuroVault knowledge base.
        Today's date is ${today}.
        If the user asks for current, latest, recent, or price-sensitive information, use the "searchInternet" tool.
      `),

      // ── Vault context injected here ──
      new SystemMessage(`
        The user has these relevant items saved in their personal NeuroVault knowledge base that are related to their question:

        ${vaultContext}

        Instructions:
        - If vault items are clearly relevant, reference them in your answer under "🧠 From your vault:"
        - Then add fresh web knowledge under "🌐 From the web:" (use searchInternet tool if needed)
        - End with a "💡 Key insight:" that synthesizes both sources
        - If vault items are NOT relevant to the question, ignore them and answer normally without mentioning the vault
        - Never fabricate vault content — only reference what's provided above
      `),

      ...(freshSearchResults ? [
        new SystemMessage(`
          Fresh internet search results:
          ${freshSearchResults}
        `)
      ] : []),

      ...messages.map(msg => {
        if (msg.role === "user") return new HumanMessage(msg.content)
        if (msg.role === "ai") return new AIMessage(msg.content)
      })
    ]
  })

  return response.messages[response.messages.length - 1].text
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
      You are a helpful assistant that generates concise and descriptive titles for chat conversations.
      User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.
    `),
    new HumanMessage(`
      Generate a title for a chat conversation based on the following first message:
      "${message}"
    `)
  ])
  return response.text
}