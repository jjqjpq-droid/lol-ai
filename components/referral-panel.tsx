'use client'

import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function ReferralPanel() {
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Generate or fetch referral code
    const code = `ref_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    setReferralCode(code)
  }, [])

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/sign-up?ref=${referralCode}`

  function copyToClipboard() {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-4">
      <h3 className="font-semibold mb-4 text-sm">Referral Program</h3>
      <p className="text-xs text-gray-400 mb-4">
        Earn 50 credits per referral + give friends 100 bonus credits
      </p>
      <div className="bg-white/5 rounded p-2 mb-3 text-xs text-gray-300 break-all">
        {referralUrl}
      </div>
      <Button
        onClick={copyToClipboard}
        className="w-full bg-white/10 hover:bg-white/20 text-sm"
      >
        {copied ? '✓ Copied!' : 'Copy Link'}
      </Button>
    </div>
  )
}
