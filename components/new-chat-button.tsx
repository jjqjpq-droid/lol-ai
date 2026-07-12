'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createChat } from '@/app/actions/chat'
import { useRouter } from 'next/navigation'

const AGENTS = [
  { id: 'dolphin', name: 'Dolphin', icon: '🐬' },
  { id: 'github', name: 'GitHub Copilot', icon: '🐙' },
  { id: 'claude', name: 'Claude', icon: '🤖' },
  { id: 'perplexity', name: 'Perplexity', icon: '🔍' },
  { id: 'glm', name: 'GLM', icon: '✨' },
  { id: 'hy3', name: 'HY3', icon: '🎯' },
]

export function NewChatButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCreateChat(agent: string) {
    setLoading(true)
    try {
      const chatId = await createChat(agent, `Chat with ${agent}`)
      router.push(`/dashboard/chat/${chatId}`)
    } catch (error) {
      console.error('[v0] Error creating chat:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        + New Chat
      </Button>
    )
  }

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-4 space-y-3">
      <h3 className="font-semibold text-sm">Select an AI Agent:</h3>
      {AGENTS.map((agent) => (
        <Button
          key={agent.id}
          onClick={() => handleCreateChat(agent.id)}
          disabled={loading}
          className="w-full justify-start text-left bg-white/10 hover:bg-white/20 border border-white/20"
        >
          <span className="mr-2">{agent.icon}</span>
          {agent.name}
        </Button>
      ))}
      <Button
        onClick={() => setOpen(false)}
        variant="ghost"
        className="w-full text-gray-400 hover:text-white hover:bg-white/10"
      >
        Cancel
      </Button>
    </div>
  )
}
