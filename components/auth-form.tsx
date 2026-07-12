'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

// Client-side validation
function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.length > 254) {
    return { valid: false, error: 'Invalid email format' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Check for disposable emails
  const disposableDomains = [
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'throwaway.email',
    'mailinator.com',
  ]
  const domain = email.split('@')[1].toLowerCase()
  if (disposableDomains.includes(domain)) {
    return { valid: false, error: 'Disposable email addresses are not allowed' }
  }

  return { valid: true }
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (!(hasUpperCase && hasLowerCase && (hasNumber || hasSpecialChar))) {
    return {
      valid: false,
      error: 'Password must contain uppercase, lowercase, and numbers or special characters',
    }
  }

  return { valid: true }
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

  const isSignUp = mode === 'sign-up'

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value
    setPassword(pwd)

    if (isSignUp && pwd) {
      const hasUpperCase = /[A-Z]/.test(pwd)
      const hasLowerCase = /[a-z]/.test(pwd)
      const hasNumber = /[0-9]/.test(pwd)
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)

      let strength: 'weak' | 'medium' | 'strong'
      if (pwd.length < 8) {
        strength = 'weak'
      } else if (
        (hasUpperCase && hasLowerCase && hasNumber) ||
        (hasUpperCase && hasLowerCase && hasSpecialChar)
      ) {
        strength = 'strong'
      } else {
        strength = 'medium'
      }

      setPasswordStrength(strength)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Client-side validation
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.error)
      setLoading(false)
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error)
      setLoading(false)
      return
    }

    if (isSignUp) {
      if (!name || name.trim().length < 2) {
        setError('Name must be at least 2 characters')
        setLoading(false)
        return
      }

      if (name.length > 100) {
        setError('Name must be less than 100 characters')
        setLoading(false)
        return
      }

      // Check for suspicious patterns
      if (/[<>'"%;()&+]/.test(name)) {
        setError('Name contains invalid characters')
        setLoading(false)
        return
      }
    }

    // Call auth API with validation
    try {
      const { error } = isSignUp
        ? await authClient.signUp.email({ email: email.toLowerCase().trim(), password, name: name.trim() })
        : await authClient.signIn.email({ email: email.toLowerCase().trim(), password })

      setLoading(false)

      if (error) {
        setError(error.message ?? 'Something went wrong')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setLoading(false)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-sm p-6 backdrop-blur-md bg-white/10 border-white/20">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
              L
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {isSignUp
              ? 'Join thousands using LOL AI Web'
              : 'Sign in to continue chatting'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-white/90">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="John Doe"
                maxLength={100}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:bg-white/10"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-white/90">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:bg-white/10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-white/90">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              minLength={8}
              maxLength={128}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              placeholder={isSignUp ? '8+ chars, mixed case, numbers/symbols' : 'Enter your password'}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:bg-white/10"
            />
            {isSignUp && password && passwordStrength && (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength === 'weak'
                        ? 'w-1/3 bg-red-500'
                        : passwordStrength === 'medium'
                          ? 'w-2/3 bg-yellow-500'
                          : 'w-full bg-green-500'
                    }`}
                  />
                </div>
                <span className="text-xs font-medium text-gray-300">
                  {passwordStrength === 'weak'
                    ? 'Weak'
                    : passwordStrength === 'medium'
                      ? 'Medium'
                      : 'Strong'}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50" role="alert">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
          >
            {loading
              ? 'Processing...'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </Button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="text-purple-400 font-medium underline-offset-4 hover:text-pink-400 transition"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>

        {isSignUp && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
