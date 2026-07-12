'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getUserCredits } from '@/app/actions/chat'

interface Message {
  id: string
  role: string
  content: string
  createdAt: Date
}

interface ChatInterfaceProps {
  chatId: string
  agent: string
  messages: Message[]
}

export function ChatInterface({ chatId, agent, messages: initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    async function fetchCredits() {
      try {
        const data = await getUserCredits()
        setCredits(data)
      } catch (error) {
        console.error('[v0] Error fetching credits:', error)
      }
    }
    fetchCredits()
  }, [])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          message: input,
          agent,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: data.assistantMessageId,
        role: 'assistant',
        content: data.response,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Refresh credits
      const updatedCredits = await getUserCredits()
      setCredits(updatedCredits)
    } catch (error) {
      console.error('[v0] Error sending message:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to send message'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] backdrop-blur-md bg-white/10 rounded-lg border border-white/20 overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Start a conversation with {agent}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-white/10 border border-white/20'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/20 p-4 bg-white/5">
        <div className="flex items-center gap-2 mb-2">
          {agent !== 'github' && credits && (
            <span className="text-xs text-gray-400">
              Credits: {parseFloat(credits.balance).toFixed(2)}
            </span>
          )}
          {agent === 'github' && (
            <span className="text-xs text-green-400">🟢 Free Model</span>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleSendMessage(e as any)
              }
            }}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
