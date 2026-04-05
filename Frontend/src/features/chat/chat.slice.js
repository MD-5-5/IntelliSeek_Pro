import { createSlice } from '@reduxjs/toolkit';


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        isSending: false,
        error: null,
        neuroVaultUserId: localStorage.getItem('neurovault_user_id') || null,
        lastVaultSources: [],
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            state.chats[ chatId ] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString(),
            }
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role, animate = false } = action.payload
            state.chats[ chatId ].messages.push({ content, role, animate })
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            state.chats[ chatId ].messages.push(
                ...messages.map((message) => ({
                    ...message,
                    animate: false,
                }))
            )
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setSending: (state, action) => {
            state.isSending = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        setNeuroVaultUserId: (state, action) => {
        state.neuroVaultUserId = action.payload
        if (action.payload) {
        localStorage.setItem('neurovault_user_id', action.payload)
        } else {
          localStorage.removeItem('neurovault_user_id')
        }
        },
        setLastVaultSources: (state, action) => {
        state.lastVaultSources = action.payload
        },
    }
})

export const { setChats, setCurrentChatId, setLoading, setSending, setError, createNewChat, addNewMessage, addMessages, setLastVaultSources, setNeuroVaultUserId } = chatSlice.actions
export default chatSlice.reducer


// chats = {
//     "docker and AWS": {
//         messages: [
//             {
//                 role: "user",
//                 content: "What is docker?"
//             },
//             {
//                 role: "ai",
//                 content: "Docker is a platform that allows developers to automate the deployment of applications inside lightweight, portable containers. It provides an efficient way to package and distribute software, ensuring consistency across different environments."
//             }
//         ],
//         id: "docker and AWS",
//         lastUpdated: "2024-06-20T12:34:56Z",
//     }

// }
