'use client'

import { useState, useRef, KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (content: string) => void
  isLoading: boolean
}

export default function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  return (
    <div className="border-t border-gray-800 bg-dark p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 bg-gray-800 rounded-xl border border-gray-700 p-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none max-h-[200px] placeholder-gray-500 disabled:opacity-50"
            style={{ minHeight: '24px' }}
          />

          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors"
            title="Send message (Enter)"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">Enter</kbd> to send,
          <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded ml-1">Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  )
}
