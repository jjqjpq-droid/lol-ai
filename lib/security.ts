import crypto from 'crypto'
import { headers } from 'next/headers'
import validator from 'validator'

// In-memory rate limiting (can be replaced with Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const SIGNUP_RATE_LIMIT = {
  maxAttempts: 5, // Max 5 signup attempts
  windowMs: 60 * 60 * 1000, // Per hour
}

const LOGIN_RATE_LIMIT = {
  maxAttempts: 10, // Max 10 login attempts
  windowMs: 15 * 60 * 1000, // Per 15 minutes
}

const EMAIL_VALIDATION_RATE_LIMIT = {
  maxAttempts: 3, // Max 3 validations per email
  windowMs: 60 * 60 * 1000, // Per hour
}

/**
 * Get client IP address from request headers
 * Supports X-Forwarded-For, CF-Connecting-IP, and other proxies
 */
export function getClientIP(): string {
  const headersList = headers()
  const forwarded = headersList.get('x-forwarded-for')
  const cfIP = headersList.get('cf-connecting-ip')
  const ip =
    (forwarded ? forwarded.split(',')[0].trim() : null) ||
    cfIP ||
    headersList.get('x-real-ip') ||
    'unknown'
  return ip
}

/**
 * Get unique client fingerprint combining IP, User-Agent, and Accept-Language
 */
export function getClientFingerprint(): string {
  const headersList = headers()
  const ip = getClientIP()
  const userAgent = headersList.get('user-agent') || 'unknown'
  const language = headersList.get('accept-language') || 'unknown'

  const fingerprint = `${ip}:${userAgent}:${language}`
  return crypto.createHash('sha256').update(fingerprint).digest('hex')
}

/**
 * Check rate limit for signup attempts
 */
export function checkSignupRateLimit(): { allowed: boolean; retryAfter?: number } {
  const fingerprint = getClientFingerprint()
  const now = Date.now()
  const limit = rateLimitMap.get(fingerprint) || { count: 0, resetTime: now + SIGNUP_RATE_LIMIT.windowMs }

  if (now > limit.resetTime) {
    // Reset window
    rateLimitMap.set(fingerprint, { count: 1, resetTime: now + SIGNUP_RATE_LIMIT.windowMs })
    return { allowed: true }
  }

  if (limit.count >= SIGNUP_RATE_LIMIT.maxAttempts) {
    const retryAfter = Math.ceil((limit.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  limit.count++
  rateLimitMap.set(fingerprint, limit)
  return { allowed: true }
}

/**
 * Check rate limit for login attempts
 */
export function checkLoginRateLimit(email: string): { allowed: boolean; retryAfter?: number } {
  const key = `login:${email}`
  const now = Date.now()
  const limit = rateLimitMap.get(key) || { count: 0, resetTime: now + LOGIN_RATE_LIMIT.windowMs }

  if (now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + LOGIN_RATE_LIMIT.windowMs })
    return { allowed: true }
  }

  if (limit.count >= LOGIN_RATE_LIMIT.maxAttempts) {
    const retryAfter = Math.ceil((limit.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  limit.count++
  rateLimitMap.set(key, limit)
  return { allowed: true }
}

/**
 * Check rate limit for email validation
 */
export function checkEmailValidationRateLimit(email: string): { allowed: boolean; retryAfter?: number } {
  const key = `email-validation:${email}`
  const now = Date.now()
  const limit = rateLimitMap.get(key) || { count: 0, resetTime: now + EMAIL_VALIDATION_RATE_LIMIT.windowMs }

  if (now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + EMAIL_VALIDATION_RATE_LIMIT.windowMs })
    return { allowed: true }
  }

  if (limit.count >= EMAIL_VALIDATION_RATE_LIMIT.maxAttempts) {
    const retryAfter = Math.ceil((limit.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  limit.count++
  rateLimitMap.set(key, limit)
  return { allowed: true }
}

/**
 * Validate and sanitize email
 */
export function validateAndSanitizeEmail(email: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!email || email.length > 254) {
    return { valid: false, error: 'Invalid email format' }
  }

  const sanitized = validator.trim(validator.toLowerCase(email))

  if (!validator.isEmail(sanitized)) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Prevent disposable email addresses
  const disposableDomains = [
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'throwaway.email',
    'mailinator.com',
  ]
  const domain = sanitized.split('@')[1]
  if (disposableDomains.includes(domain)) {
    return { valid: false, error: 'Disposable email addresses are not allowed' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate and sanitize name
 */
export function validateAndSanitizeName(name: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!name || name.length < 2 || name.length > 100) {
    return { valid: false, error: 'Name must be between 2 and 100 characters' }
  }

  const sanitized = validator.trim(validator.escape(name))

  // Check for SQL injection patterns
  if (/['";\\]/i.test(sanitized)) {
    return { valid: false, error: 'Invalid characters in name' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' }
  }

  // Check for minimum complexity
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

/**
 * Hash sensitive data
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Encrypt data (for storing sensitive information)
 */
export function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt data
 */
export function decryptData(data: string, key: string): string {
  const parts = data.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv)
  let decrypted = decipher.update(parts[1], 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Create HMAC signature for API requests
 */
export function createSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}

/**
 * Verify HMAC signature
 */
export function verifySignature(data: string, signature: string, secret: string): boolean {
  const expectedSignature = createSignature(data, secret)
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}
