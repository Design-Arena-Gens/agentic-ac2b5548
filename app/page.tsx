'use client'

import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import MessageInput from './components/MessageInput'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('openwebui_chats')
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt' || key === 'timestamp') {
          return new Date(value)
        }
        return value
      })
      setChats(parsedChats)
      if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id)
      }
    }
  }, [])

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('openwebui_chats', JSON.stringify(chats))
    }
  }, [chats])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chats, currentChatId])

  const createNewChat = () => {
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
  }

  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId)
    setChats(updatedChats)
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
  }

  const renameChat = (chatId: string, newTitle: string) => {
    setChats(chats.map(chat =>
      chat.id === chatId
        ? { ...chat, title: newTitle, updatedAt: new Date() }
        : chat
    ))
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    let chatId = currentChatId

    // Create new chat if none exists
    if (!chatId) {
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setChats([newChat, ...chats])
      chatId = newChat.id
      setCurrentChatId(chatId)
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }

    // Add user message
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, userMessage]
        const updatedTitle = chat.messages.length === 0
          ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
          : chat.title
        return {
          ...chat,
          messages: updatedMessages,
          title: updatedTitle,
          updatedAt: new Date(),
        }
      }
      return chat
    }))

    setIsLoading(true)

    try {
      // Get current chat messages for context
      const currentChat = chats.find(c => c.id === chatId)
      const messageHistory = currentChat?.messages || []

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messageHistory, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      }

      setChats(prevChats => prevChats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, assistantMessage],
              updatedAt: new Date(),
            }
          : chat
      ))
    } catch (error) {
      console.error('Error sending message:', error)

      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure you have set up the API correctly.',
        timestamp: new Date(),
      }

      setChats(prevChats => prevChats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, errorMessage],
              updatedAt: new Date(),
            }
          : chat
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const currentChat = chats.find(chat => chat.id === currentChatId)

  return (
    <div className="flex h-screen bg-darker text-white overflow-hidden">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-dark border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-bold">
              {currentChat?.title || 'Open WebUI'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Powered by Claude
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {currentChat && currentChat.messages.length > 0 ? (
            <ChatArea messages={currentChat.messages} isLoading={isLoading} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                <div className="mb-8">
                  <svg className="w-20 h-20 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h2 className="text-3xl font-bold mb-4">Welcome to Open WebUI</h2>
                  <p className="text-gray-400 text-lg mb-8">
                    Start a conversation with AI. Ask questions, get help with coding, or just chat!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Get Answers
                    </h3>
                    <p className="text-sm text-gray-400">Ask questions and get detailed, accurate responses</p>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Code Help
                    </h3>
                    <p className="text-sm text-gray-400">Debug, explain, or generate code in any language</p>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Creative Writing
                    </h3>
                    <p className="text-sm text-gray-400">Draft content, brainstorm ideas, or get feedback</p>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Learn & Explore
                    </h3>
                    <p className="text-sm text-gray-400">Dive deep into topics and expand your knowledge</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <MessageInput onSend={sendMessage} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}
