import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { headers } from 'next/headers'

// Helper to get client fingerprint in middleware context
function getClientFingerprintMiddleware(): string {
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || headersList.get('cf-connecting-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  const language = headersList.get('accept-language') || 'unknown'
  const fingerprint = `${ip}:${userAgent}:${language}`
  return crypto.createHash('sha256').update(fingerprint).digest('hex')
}

// Track suspicious activity
const suspiciousActivityMap = new Map<string, { count: number; resetTime: number }>()

const SUSPICIOUS_ACTIVITY_LIMIT = {
  maxAttempts: 20, // Max 20 suspicious activities
  windowMs: 60 * 60 * 1000, // Per hour
}

/**
 * Middleware to detect and block suspicious patterns
 */
export function detectSuspiciousActivity(
  fingerprint: string,
  pattern: 'rapid-requests' | 'invalid-input' | 'injection-attempt'
): boolean {
  const key = `${fingerprint}:${pattern}`
  const now = Date.now()
  const activity = suspiciousActivityMap.get(key) || { count: 0, resetTime: now + SUSPICIOUS_ACTIVITY_LIMIT.windowMs }

  if (now > activity.resetTime) {
    suspiciousActivityMap.set(key, { count: 1, resetTime: now + SUSPICIOUS_ACTIVITY_LIMIT.windowMs })
    return false
  }

  activity.count++
  if (activity.count > SUSPICIOUS_ACTIVITY_LIMIT.maxAttempts) {
    return true // Suspicious!
  }

  suspiciousActivityMap.set(key, activity)
  return false
}

/**
 * Check for common injection patterns
 */
export function hasInjectionPattern(input: string): boolean {
  const injectionPatterns = [
    /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\btruncate\b)/i,
    /(<script|javascript:|onerror=|onclick=|onload=)/i,
    /(%27|'|--|;|\/\*|\*\/)/,
    /(\.\.|\.\/|~\/|\/etc\/|\/proc\/|\/sys\/)/,
  ]

  return injectionPatterns.some((pattern) => pattern.test(input))
}

/**
 * Sanitize request headers to prevent header-based attacks
 */
export function validateRequestHeaders(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || ''
  const referer = req.headers.get('referer') || ''

  // Check for bot user agents
  const botPatterns = [
    /bot|crawler|scraper|spider|curl|wget|python|java(?!script)|perl|ruby|php/i,
    /masscan|nmap|nikto|sqlmap|metasploit/i,
  ]

  if (botPatterns.some((pattern) => pattern.test(userAgent))) {
    return false
  }

  // Check for suspicious referrers
  if (hasInjectionPattern(referer)) {
    return false
  }

  return true
}

/**
 * Validate request body for suspicious patterns
 */
export function validateRequestBody(body: Record<string, any>): { valid: boolean; error?: string } {
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      if (hasInjectionPattern(value)) {
        return { valid: false, error: `Suspicious pattern detected in ${key}` }
      }

      // Check for extremely long values (potential buffer overflow)
      if (value.length > 10000) {
        return { valid: false, error: `Input too long in ${key}` }
      }
    }
  }

  return { valid: true }
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  return response
}
