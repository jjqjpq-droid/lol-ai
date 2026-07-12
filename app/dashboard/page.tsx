import { auth } from '@/lib/auth'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChatList } from '@/components/chat-list'
import { CreditsPanel } from '@/components/credits-panel'
import { ReferralPanel } from '@/components/referral-panel'
import { NewChatButton } from '@/components/new-chat-button'

export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
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
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              LOL AI
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Welcome, {session.user.name || session.user.email}</span>
              <form
                action={async () => {
                  'use server'
                  await auth.api.signOut({ headers: await headers() })
                  redirect('/sign-in')
                }}
              >
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <NewChatButton />
              <CreditsPanel />
              <ReferralPanel />
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to LOL AI</h1>
                <p className="text-gray-300 mb-8">
                  Select an AI agent and start a new conversation, or continue with an existing chat.
                </p>
                <NewChatButton />
              </div>

              {/* Recent Chats */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Your Chats</h2>
                <ChatList />
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
