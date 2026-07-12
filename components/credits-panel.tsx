'use client'

import { useEffect, useState } from 'react'
import { getUserCredits } from '@/app/actions/chat'

export function CreditsPanel() {
  const [credits, setCredits] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCredits() {
      try {
        const data = await getUserCredits()
        setCredits(data)
      } catch (error) {
        console.error('[v0] Error fetching credits:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCredits()
  }, [])

  if (loading) {
    return (
      <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-4 animate-pulse">
        <div className="h-20 bg-white/10 rounded"></div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-4">
      <h3 className="font-semibold mb-4 text-sm">Your Credits</h3>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-400">Balance</p>
          <p className="text-2xl font-bold">{parseFloat(credits?.balance || '0').toFixed(2)}</p>
        </div>
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs text-gray-400">Total Spent</p>
          <p className="text-lg">${parseFloat(credits?.totalSpent || '0').toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Total Earned</p>
          <p className="text-lg">${parseFloat(credits?.totalEarned || '0').toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
