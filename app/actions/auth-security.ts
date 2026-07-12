'use server'

import { headers } from 'next/headers'
import {
  checkSignupRateLimit,
  checkLoginRateLimit,
  checkEmailValidationRateLimit,
  validateAndSanitizeEmail,
  validateAndSanitizeName,
  validatePasswordStrength,
  getClientIP,
  getClientFingerprint,
} from '@/lib/security'
import { validateRequestBody, detectSuspiciousActivity, hasInjectionPattern } from '@/lib/middleware'

/**
 * Validate signup request on server
 */
export async function validateSignupRequest(data: {
  email: string
  password: string
  name: string
}): Promise<{ valid: boolean; error?: string }> {
  // Check rate limiting
  const rateLimit = checkSignupRateLimit()
  if (!rateLimit.allowed) {
    return {
      valid: false,
      error: `Too many signup attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
    }
  }

  // Validate email
  const emailValidation = validateAndSanitizeEmail(data.email)
  if (!emailValidation.valid) {
    detectSuspiciousActivity(getClientFingerprint(), 'invalid-input')
    return { valid: false, error: emailValidation.error }
  }

  // Validate name
  const nameValidation = validateAndSanitizeName(data.name)
  if (!nameValidation.valid) {
    detectSuspiciousActivity(getClientFingerprint(), 'invalid-input')
    return { valid: false, error: nameValidation.error }
  }

  // Validate password
  const passwordValidation = validatePasswordStrength(data.password)
  if (!passwordValidation.valid) {
    return { valid: false, error: passwordValidation.error }
  }

  // Check for injection attempts
  if (hasInjectionPattern(data.email) || hasInjectionPattern(data.name)) {
    detectSuspiciousActivity(getClientFingerprint(), 'injection-attempt')
    return { valid: false, error: 'Invalid input detected' }
  }

  // Validate full request body
  const bodyValidation = validateRequestBody(data)
  if (!bodyValidation.valid) {
    detectSuspiciousActivity(getClientFingerprint(), 'injection-attempt')
    return { valid: false, error: bodyValidation.error }
  }

  return { valid: true }
}

/**
 * Validate login request on server
 */
export async function validateLoginRequest(data: {
  email: string
  password: string
}): Promise<{ valid: boolean; error?: string }> {
  // Check rate limiting per email
  const rateLimit = checkLoginRateLimit(data.email)
  if (!rateLimit.allowed) {
    return {
      valid: false,
      error: `Too many login attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
    }
  }

  // Validate email
  const emailValidation = validateAndSanitizeEmail(data.email)
  if (!emailValidation.valid) {
    detectSuspiciousActivity(getClientFingerprint(), 'invalid-input')
    return { valid: false, error: emailValidation.error }
  }

  // Check password length
  if (!data.password || data.password.length < 8 || data.password.length > 128) {
    return { valid: false, error: 'Invalid email or password' }
  }

  // Check for injection attempts
  if (hasInjectionPattern(data.email)) {
    detectSuspiciousActivity(getClientFingerprint(), 'injection-attempt')
    return { valid: false, error: 'Invalid input detected' }
  }

  return { valid: true }
}

/**
 * Get security info for client
 */
export async function getSecurityInfo(): Promise<{
  clientIP: string
  fingerprint: string
  timestamp: number
}> {
  return {
    clientIP: getClientIP(),
    fingerprint: getClientFingerprint(),
    timestamp: Date.now(),
  }
}

/**
 * Log suspicious activity for monitoring
 */
export async function logSuspiciousActivity(
  activity: 'failed-login' | 'failed-signup' | 'injection-attempt' | 'rate-limit-exceeded'
): Promise<void> {
  const headersList = headers()
  const timestamp = new Date().toISOString()
  const ip = getClientIP()
  const userAgent = headersList.get('user-agent')

  // In production, send this to a logging service (e.g., Sentry, LogRocket, etc.)
  console.warn(`[Security Alert] ${activity}`, {
    timestamp,
    ip,
    userAgent,
    fingerprint: getClientFingerprint(),
  })
}
