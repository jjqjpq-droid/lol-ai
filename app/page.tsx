import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
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
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            LOL AI
          </div>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Chat with Multiple AI Agents
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Access powerful AI models including Dolphin, GitHub Copilot, Claude, and more. Earn credits through referrals and get free access.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Start Chatting Free
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Learn More
              </Button>
            </a>
          </div>

          {/* Feature Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-6 py-20">
            {[
              {
                title: 'Multiple AI Agents',
                description: 'Choose from Dolphin, GitHub Copilot, Claude, Perplexity, GLM, and HY3 models.',
                icon: '🤖',
              },
              {
                title: 'Credit System',
                description: 'Per-token billing for fair pricing. GitHub Copilot completely free to use.',
                icon: '💳',
              },
              {
                title: 'Referral Rewards',
                description: 'Earn 50 credits per referral + give new users 100 bonus credits.',
                icon: '🎁',
              },
              {
                title: 'Session Security',
                description: '10-second token windows with session-based rate limiting for anti-scrape protection.',
                icon: '🔒',
              },
              {
                title: 'Instant Token Refresh',
                description: 'Fresh tokens generated every 10 seconds to ensure your account security.',
                icon: '⚡',
              },
              {
                title: 'Multi-Chat Support',
                description: 'Manage multiple conversations with different AI agents simultaneously.',
                icon: '💬',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="backdrop-blur-md bg-white/10 p-6 rounded-lg border border-white/20 hover:border-purple-500/50 transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Agents Showcase */}
          <div className="py-20">
            <h2 className="text-3xl font-bold mb-12">Supported AI Models</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Dolphin', cost: 'Low Cost', color: 'from-blue-500' },
                { name: 'GitHub Copilot', cost: 'Free ⭐', color: 'from-gray-500' },
                { name: 'Claude', cost: 'Premium', color: 'from-orange-500' },
                { name: 'Perplexity', cost: 'Mid Cost', color: 'from-cyan-500' },
                { name: 'GLM', cost: 'Mid Cost', color: 'from-green-500' },
                { name: 'HY3', cost: 'Mid Cost', color: 'from-indigo-500' },
              ].map((agent) => (
                <div
                  key={agent.name}
                  className={`backdrop-blur-md bg-gradient-to-br ${agent.color} bg-opacity-20 p-6 rounded-lg border border-white/20 hover:border-white/40 transition`}
                >
                  <h3 className="font-semibold text-lg mb-2">{agent.name}</h3>
                  <p className="text-sm text-gray-300">{agent.cost}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-md border-t border-white/10 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-gray-300 mb-8">Join thousands of users leveraging AI for productivity and creativity.</p>
            <Link href="/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Create Your Account
              </Button>
            </Link>
          </div>
        </section>
      </div>

    </main>
  )
}
