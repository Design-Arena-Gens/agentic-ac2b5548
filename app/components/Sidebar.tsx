'use client'

import { Chat } from '../page'
import { useState } from 'react'

interface SidebarProps {
  chats: Chat[]
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const handleStartEdit = (chat: Chat) => {
    setEditingId(chat.id)
    setEditTitle(chat.title)
    setMenuOpenId(null)
  }

  const handleSaveEdit = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim())
    }
    setEditingId(null)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="w-80 bg-dark border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Chats
        </h2>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          title="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 py-8 px-4">
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1">Click "New Chat" to start</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative rounded-lg transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800/50'
                }`}
              >
                {editingId === chat.id ? (
                  <div className="p-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(chat.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className="w-full text-left p-3 pr-10"
                    >
                      <div className="font-medium text-sm truncate mb-1">
                        {chat.title}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{formatDate(chat.updatedAt)}</span>
                        <span>•</span>
                        <span>{chat.messages.length} messages</span>
                      </div>
                    </button>

                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpenId(menuOpenId === chat.id ? null : chat.id)
                        }}
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>

                      {menuOpenId === chat.id && (
                        <div className="absolute right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 z-10 min-w-[150px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartEdit(chat)
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Are you sure you want to delete this chat?')) {
                                onDeleteChat(chat.id)
                              }
                              setMenuOpenId(null)
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 text-red-400 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          <p>Open WebUI Clone</p>
          <p className="mt-1">Built with Next.js & Claude</p>
        </div>
      </div>
    </div>
  )
}
