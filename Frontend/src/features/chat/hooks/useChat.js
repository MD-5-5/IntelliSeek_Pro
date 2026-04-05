import { initializeSocketConnection } from "../services/chat.socket";
import { sendMessage, getChats, getMessages } from "../services/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, setSending, createNewChat, addNewMessage, addMessages,setLastVaultSources } from "../chat.slice";
import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";


export const useChat = () => {

    const dispatch = useDispatch()
    const activeRequestRef = useRef(null)
    const neuroVaultUserId = useSelector(state => state.chat.neuroVaultUserId)

    async function handleSendMessage({ message, chatId }) {
        dispatch(setSending(true))
        dispatch(setError(null))
        dispatch(setLastVaultSources([]))
        const controller = new AbortController()
        activeRequestRef.current = controller
        
        // If starting a new chat, create a temporary chat first
        let workingChatId = chatId
        if (!workingChatId) {
            workingChatId = 'new_' + Date.now()
            // Use placeholder title - will be updated when AI response arrives
            dispatch(createNewChat({
                chatId: workingChatId,
                title: '...',
            }))
            // Set as current chat immediately
            dispatch(setCurrentChatId(workingChatId))
        }
        
        // Add user message to UI immediately
        dispatch(addNewMessage({
            chatId: workingChatId,
            content: message,
            role: "user",
            animate: false,
        }))
        
        // Then send to server and await response
        try {
            const data = await sendMessage({
                message,
                chatId: chatId || undefined,
                neuroVaultUserId,
                signal: controller.signal,
            })
            const { chat, aiMessage, vaultSources = [] } = data
                if (vaultSources.length > 0) {
                dispatch(setLastVaultSources(vaultSources))
                }
            // If this was a new chat, replace temp with real
            if (!chatId) {
                // Create real chat
                dispatch(createNewChat({
                    chatId: chat._id,
                    title: chat.title,
                }))
                
                // Copy messages from temp to real
                dispatch(addNewMessage({
                    chatId: chat._id,
                    content: message,
                    role: "user",
                    animate: false,
                }))
                
                // Update current to real
                dispatch(setCurrentChatId(chat._id))
            }
            
            // Add AI response to final chat
            dispatch(addNewMessage({
                chatId: chatId || chat._id,
                content: aiMessage.content,
                role: aiMessage.role,
                animate: true,
                vaultSources,
            }))
        } catch (error) {
            if (error.code === "ERR_CANCELED") {
                dispatch(setError("Response stopped"))
            } else {
                console.error('Send message error:', error)
                dispatch(setError(error.response?.data?.message || error.message))
            }
        } finally {
            activeRequestRef.current = null
            dispatch(setSending(false))
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        dispatch(setError(null))

        try {
            const data = await getChats()
            const { chats } = data
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[ chat._id ] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt,
                }
                return acc
            }, {})))
        } catch (error) {
            console.error('Get chats error:', error)
            dispatch(setError(error.response?.data?.message || error.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleOpenChat(chatId, chats) {
        dispatch(setLoading(true))
        dispatch(setError(null))

        try {
            if (chats[ chatId ]?.messages.length === 0) {
                const data = await getMessages(chatId)
                const { messages } = data

                const formattedMessages = messages.map(msg => ({
                    content: msg.content,
                    role: msg.role,
                    animate: false,
                }))

                dispatch(addMessages({
                    chatId,
                    messages: formattedMessages,
                }))
            }
            dispatch(setCurrentChatId(chatId))
        } catch (error) {
            console.error('Open chat error:', error)
            dispatch(setError(error.response?.data?.message || error.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    function handleNewChat() {
        dispatch(setCurrentChatId(null))
    }

    function handleStopResponse() {
        if (activeRequestRef.current) {
            activeRequestRef.current.abort()
            activeRequestRef.current = null
        }
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleNewChat,
        handleStopResponse,
    }

}
