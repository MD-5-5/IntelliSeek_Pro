import { generateResponse, generateChatTitle, generateHybridResponse } from "../services/ai.service.js";
import { getVaultContext, formatVaultContext } from "../services/neuroVault.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
  console.log('🔍 req.body:', req.body)
  const { message, chat: chatId } = req.body

  // neuroVaultUserId is sent from frontend when user has connected their vault
  const neuroVaultUserId = req.body.neuroVaultUserId || null
    console.log('🧠 neuroVaultUserId:', neuroVaultUserId) 

  let chat = null

  if (!chatId) {
    chat = await chatModel.create({
      user: req.user.id,
      title: "New Chat"
    })
  } else {
    chat = await chatModel.findOne({
      _id: chatId,
      user: req.user.id
    })
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" })
    }
  }

  const activeChatId = chat._id

  await messageModel.create({
    chat: activeChatId,
    content: message,
    role: "user"
  })

  const messages = await messageModel.find({ chat: activeChatId })

  // ── NeuroVault Integration ──
  // Fetch vault context in parallel with nothing — adds ~0 latency
  let vaultResults = []
  let result = null

  if (neuroVaultUserId) {
    // Fetch vault context and generate response simultaneously
    const [vaultData] = await Promise.allSettled([
      getVaultContext(message, neuroVaultUserId)
    ])

    vaultResults = vaultData.status === 'fulfilled' ? vaultData.value : []
    const vaultContext = formatVaultContext(vaultResults)

    // Use hybrid response if vault has relevant results
    result = await generateHybridResponse(messages, vaultContext)
  } else {
    // Normal response — no vault connected
    result = await generateResponse(messages)
  }
  // ── End NeuroVault Integration ──

  const aiMessage = await messageModel.create({
    chat: activeChatId,
    content: result,
    role: "ai"
  })

  let title = null
  if (!chatId) {
    title = await generateChatTitle(result)
    await chatModel.updateOne({ _id: chat._id }, { title })
    chat.title = title
  }

  res.status(201).json({
    title: title || chat.title,
    chat,
    aiMessage,
    // Send vault sources back to frontend for display
    vaultSources: vaultResults.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      category: item.category,
      url: item.url,
      summary: item.summary,
      tags: item.tags
    }))
  })
}

export async function getChats(req, res) {
  const user = req.user
  const chats = await chatModel.find({ user: user.id })
  res.status(200).json({
    message: "Chats retrieved successfully",
    chats
  })
}

export async function getMessages(req, res) {
  const { chatId } = req.params
  const chat = await chatModel.findOne({ _id: chatId, user: req.user.id })
  if (!chat) return res.status(404).json({ message: "Chat not found" })
  const messages = await messageModel.find({ chat: chatId })
  res.status(200).json({
    message: "Messages retrieved successfully",
    messages
  })
}

export async function deleteChat(req, res) {
  const { chatId } = req.params
  const chat = await chatModel.findOneAndDelete({ _id: chatId, user: req.user.id })
  await messageModel.deleteMany({ chat: chatId })
  if (!chat) return res.status(404).json({ message: "Chat not found" })
  res.status(200).json({ message: "Chat deleted successfully" })
}