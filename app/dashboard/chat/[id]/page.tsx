import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getChat } from '@/app/actions/chat'
import { ChatInterface } from '@/components/chat-interface'

export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  let chat
  try {
    const data = await getChat(params.id)
    chat = data
  } catch (error) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                  ← Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{chat.chat.title}</h1>
                <p className="text-sm text-gray-400">Agent: {chat.chat.agent}</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">Agent: {chat.chat.agent}</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <ChatInterface chatId={params.id} agent={chat.chat.agent} messages={chat.messages} />
        </div>
      </div>

    </main>
  )
}
