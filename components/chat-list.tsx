'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getChats } from '@/app/actions/chat'
import { Button } from '@/components/ui/button'

export function ChatList() {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChats() {
      try {
        const data = await getChats()
        setChats(data)
      } catch (error) {
        console.error('[v0] Error fetching chats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-4 animate-pulse h-12"
          ></div>
        ))}
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-8 text-center text-gray-400">
        <p>No chats yet. Start a new conversation!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <Link key={chat.id} href={`/dashboard/chat/${chat.id}`}>
          <Button
            className="w-full justify-start text-left bg-white/10 hover:bg-white/20 border border-white/20 h-auto py-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{chat.title}</p>
              <p className="text-xs text-gray-400">Agent: {chat.agent}</p>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(chat.updatedAt).toLocaleDateString()}
            </span>
          </Button>
        </Link>
      ))}
    </div>
  )
}
