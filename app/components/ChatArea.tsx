'use client'

import { Message } from '../page'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
}

export default function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              message.role === 'user'
                ? 'bg-blue-600'
                : 'bg-gradient-to-br from-purple-600 to-blue-600'
            }`}>
              {message.role === 'user' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            <div className={`flex-1 ${
              message.role === 'user' ? 'text-right' : ''
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-semibold text-sm ${
                  message.role === 'user' ? 'order-2' : ''
                }`}>
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
                <span className={`text-xs text-gray-500 ${
                  message.role === 'user' ? 'order-1' : ''
                }`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>

              <div className={`inline-block ${
                message.role === 'user'
                  ? 'bg-blue-600 rounded-2xl rounded-tr-sm px-4 py-3 text-left'
                  : 'bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-700'
              }`}>
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code(props: any) {
                          const {node, inline, className, children, ...rest} = props
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...rest}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...rest}>
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">Assistant</div>
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-700">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
