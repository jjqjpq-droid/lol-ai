# LOL AI Web - Security Implementation

## Overview

LOL AI Web implements enterprise-grade security measures to protect user accounts from DDoS attacks, brute force attempts, injection attacks, and scraping. All authentication flows include multi-layer validation and rate limiting.

---

## Security Features

### 1. **Rate Limiting & DDoS Protection**

#### Signup Rate Limiting
- **Max Attempts**: 5 signup attempts per hour
- **Method**: Client fingerprinting (IP + User-Agent + Accept-Language)
- **Implementation**: `lib/security.ts` → `checkSignupRateLimit()`

#### Login Rate Limiting
- **Max Attempts**: 10 attempts per 15 minutes per email
- **Method**: Email-based rate limiting with client fingerprint backup
- **Implementation**: `lib/security.ts` → `checkLoginRateLimit()`

#### Rate Limit Window
- Tracked in-memory with automatic reset after window expires
- In production: Migrate to Redis for distributed rate limiting

### 2. **Password Security**

#### Requirements
- **Minimum Length**: 8 characters (max 128)
- **Complexity**: Must contain:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9) OR Special characters (!@#$%^&*)
- **Hashing**: Better Auth handles bcrypt hashing server-side
- **No Plaintext Storage**: Passwords never stored or logged

#### Client-Side Validation
```typescript
// Password strength indicator
- Weak: < 8 chars or missing uppercase/lowercase
- Medium: Has uppercase + lowercase + (number OR symbol)
- Strong: All complexity requirements met
```

### 3. **Email Validation**

#### Validation Rules
- **Format**: RFC 5322 compliant regex validation
- **Length**: Max 254 characters
- **Disposable Email Detection**: Blocks temporary email services
  - tempmail.com, guerrillamail.com, 10minutemail.com, throwaway.email, mailinator.com
- **Normalization**: Trimmed and lowercased before storage

### 4. **Input Sanitization & Injection Prevention**

#### SQL Injection Protection
- **Method**: Drizzle ORM with parameterized queries
- **Validation**: `lib/middleware.ts` → `hasInjectionPattern()`
- **Patterns Detected**:
  - SQL keywords: UNION, SELECT, INSERT, UPDATE, DELETE, DROP, TRUNCATE
  - Script tags: `<script>`, `javascript:`, `onerror=`, `onclick=`
  - Special characters: `'`, `"`, `-`, `;`, `/*`, `*/`
  - Path traversal: `..`, `./`, `~/`, `/etc/`, `/proc/`

#### XSS Protection
- Input escaping using `validator.escape()`
- Content Security Policy headers
- X-XSS-Protection header set to `1; mode=block`

#### Name Validation
- **Length**: 2-100 characters
- **Allowed Characters**: Alphanumeric, spaces, hyphens, apostrophes
- **Blocked Characters**: `<>'"%;()&+`
- **Sanitization**: HTML escape applied

### 5. **Request Validation**

#### Headers Validation
- **User-Agent Check**: Blocks known bots, crawlers, scanners
  - Blocks: bot, crawler, scraper, spider, curl, wget, python, sqlmap, metasploit
- **Referrer Validation**: Checks for injection patterns
- **Method Validation**: Only POST/GET allowed

#### Body Validation
- **Size Limits**: Max 10KB per field
- **Type Checking**: Validates data types
- **Pattern Checking**: Scans for SQL/XSS patterns
- **Completeness**: Required fields must be present

### 6. **Session Security**

#### Session Management
- **Duration**: 7 days
- **Update Frequency**: Updated every 24 hours
- **Secure Cookies**: HttpOnly, Secure, SameSite=None (dev), SameSite=Strict (prod)
- **No Caching**: Session tokens never cached

#### Client Fingerprinting
```typescript
Fingerprint = SHA256(IP + User-Agent + Accept-Language)
- Prevents session hijacking
- Detects suspicious activity
- Used for rate limiting
```

### 7. **Error Handling**

#### Security Through Obscurity
- **Login Failures**: Generic "Invalid email or password" (no user enumeration)
- **Rate Limits**: Specific retry-after message without revealing attempts
- **Validation**: Generic error messages to attackers
- **Logging**: Detailed errors logged server-side only

### 8. **Response Headers Security**

All responses include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000
```

---

## Implementation Files

### Core Security Modules

| File | Purpose |
|------|---------|
| `lib/security.ts` | Rate limiting, validation, encryption utilities |
| `lib/middleware.ts` | Request validation, injection detection |
| `app/actions/auth-security.ts` | Server-side auth validation |
| `components/auth-form.tsx` | Client-side validation, sanitization |

### Key Functions

```typescript
// Rate Limiting
checkSignupRateLimit()          // 5 attempts/hour
checkLoginRateLimit(email)      // 10 attempts/15min
checkEmailValidationRateLimit() // 3 attempts/hour

// Validation
validateAndSanitizeEmail()      // RFC 5322 + disposable check
validateAndSanitizeName()       // XSS prevention
validatePasswordStrength()      // Complexity requirements

// Injection Detection
hasInjectionPattern()           // SQL/XSS pattern detection
validateRequestBody()           // Full request validation
validateRequestHeaders()        // Bot/scanner detection

// Encryption & Hashing
hashData()                      // SHA256 hashing
encryptData()                   // AES-256-CBC encryption
generateSecureToken()           // Cryptographically secure tokens
createSignature()               // HMAC signing
```

---

## Testing Security

### Test Scenarios

#### 1. Brute Force Prevention
```bash
# Attempt 6 signups in rapid succession
# Expected: 5th succeeds, 6th blocked with rate limit error
```

#### 2. SQL Injection Prevention
```bash
# Email: test@test.com' OR '1'='1
# Expected: Input validation error
```

#### 3. XSS Prevention
```bash
# Name: <script>alert('XSS')</script>
# Expected: Invalid character error
```

#### 4. Password Requirements
```bash
# Password: weak123    # Blocked: missing uppercase
# Password: Weak123    # Blocked: missing special char/number
# Password: Strong@123 # Allowed: meets all requirements
```

#### 5. Disposable Email
```bash
# Email: test@tempmail.com
# Expected: Disposable email error
```

---

## Monitoring & Alerts

### Suspicious Activity Tracking

Events logged server-side:
- Failed login attempts (email + IP)
- Failed signup attempts (IP + fingerprint)
- Injection attempt detection
- Rate limit exceeded
- Bot/scanner detection

### Logging Output
```
[Security Alert] failed-login
  - timestamp: 2026-07-12T13:00:00Z
  - ip: 192.168.1.1
  - email: attacker@example.com
  - fingerprint: sha256hash...

[Security Alert] injection-attempt
  - input: SELECT * FROM users...
  - pattern: SQL injection
  - ip: 192.168.1.2
```

---

## Production Deployment Checklist

- [ ] Set strong `BETTER_AUTH_SECRET` (32+ chars)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set secure cookie attributes (SameSite=Strict, Secure=true)
- [ ] Migrate rate limiting to Redis for distributed systems
- [ ] Set up centralized logging (Sentry, DataDog, etc.)
- [ ] Enable database encryption at rest
- [ ] Configure WAF (Web Application Firewall)
- [ ] Set up DDoS protection (Cloudflare, AWS Shield)
- [ ] Regular security audits
- [ ] Implement CAPTCHA for repeated failures

---

## Encryption Keys

### Password Hashing
- Algorithm: bcrypt (via Better Auth)
- Cost Factor: 12 (default)
- Salt: Automatically generated per password

### Session Encryption
- Algorithm: AES-256-CBC
- Key Derivation: SHA256 of `BETTER_AUTH_SECRET`
- IV: Random 16 bytes per session

### Data Encryption (Optional)
```typescript
// Example: Encrypting sensitive data
const encrypted = encryptData(sensitiveData, encryptionKey)
const decrypted = decryptData(encrypted, encryptionKey)
```

---

## Common Vulnerabilities Prevented

| Vulnerability | Prevention Method |
|---|---|
| Brute Force | Rate limiting + account lockout |
| DDoS | Client fingerprinting + request limits |
| SQL Injection | Parameterized queries (Drizzle ORM) |
| XSS | Input sanitization + CSP headers |
| CSRF | Session tokens + SameSite cookies |
| Weak Passwords | Complexity requirements + validation |
| Session Hijacking | Client fingerprinting + secure cookies |
| Credential Stuffing | Rate limiting per email |
| Bot/Scanner Attacks | User-Agent & header validation |
| Disposable Emails | Domain blacklist |

---

## Resources

- Better Auth Documentation: https://better-auth.com
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Validator.js: https://github.com/validatorjs/validator.js

---

## Security Issues

To report security vulnerabilities, please email security@lolai.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if applicable)

Please do not publicly disclose security issues until they are fixed.
