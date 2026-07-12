# LOL AI Web - Deployment Guide

## Environment Variables Required

Before deploying, ensure these environment variables are set in your project:

### Core Authentication
```
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
GOOGLE_CLIENT_ID=<your Google OAuth Client ID>
GOOGLE_CLIENT_SECRET=<your Google OAuth Client Secret>
```

### Database
```
DATABASE_URL=<automatically set by Neon integration>
```

### Optional
```
BETTER_AUTH_URL=<only needed for custom domains>
```

## Development Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set environment variables**
   - Add `BETTER_AUTH_SECRET` to your `.env.local`
   - Add Google OAuth credentials to `.env.local`

3. **Run development server**
   ```bash
   pnpm dev
   ```
   
   Open `http://localhost:3000` in your browser

## Production Deployment

### To Vercel

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel project settings:
   - `BETTER_AUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `DATABASE_URL` (from Neon)

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

## Security Features Implemented

- **Rate Limiting**: 5 signup attempts/hour, 10 login attempts/15 mins per email
- **Password Security**: 8-128 chars, uppercase+lowercase+(numbers OR symbols)
- **Email Validation**: Disposable email detection, RFC 5322 compliance
- **Bot Detection**: User-Agent validation, request header checks
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **XSS Prevention**: Input validation and HTML escaping
- **Session Management**: HttpOnly secure cookies, 7-day expiry
- **CORS/Origin Protection**: `trustedOrigins` configured for dev/prod

## Database Schema

The application uses these tables:

- `user` - User accounts (Better Auth)
- `session` - User sessions (Better Auth)
- `account` - OAuth providers (Better Auth)
- `verification` - Email verification tokens (Better Auth)
- `chats` - Conversation history
- `messages` - Chat messages with token tracking
- `credits` - User credit balance
- `referrals` - Referral tracking
- `rateLimits` - Session-based rate limiting (10-second windows)

## Key Features

### Authentication
- Email/Password signup with strong validation
- Email verification (Better Auth)
- Google OAuth ready
- Session-based authentication

### AI Agents
- Dolphin (low-cost)
- GitHub Copilot (free)
- Claude (premium)
- Perplexity (mid-cost)
- GLM (mid-cost)
- HY3 (mid-cost)

### Credit System
- Per-token billing using js-tiktoken
- Model-specific pricing
- Real-time credit deduction
- Credit tracking and usage history

### Referral Program
- Auto-generated referral codes
- 50 credits reward per referral
- 100 bonus credits for new users
- Shareable referral links

### Anti-DDoS Protection
- Client fingerprinting (IP + User-Agent + Accept-Language)
- Rate limiting per fingerprint
- Suspicious activity detection
- SQL injection pattern detection
- Bot/Scanner detection

## Troubleshooting

### "Invalid origin" Error
- Ensure localhost:3000 is in `trustedOrigins` in `lib/auth.ts`
- Check that `sameSite: 'none'` and `secure: true` are set in development mode

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check Neon project is running
- Ensure all tables are created (see SECURITY.md)

### Sign-up Fails
- Check email is not disposable
- Verify password meets requirements (8+ chars, mixed case, numbers/symbols)
- Check rate limiting isn't triggered (max 5 attempts/hour)

### Session Not Persisting
- Clear browser cookies and localStorage
- Check `sameSite` cookie attributes in auth config
- Verify origin is in `trustedOrigins`

## Performance Tips

1. **Token Optimization**: Use GitHub Copilot (free) for simple queries
2. **Caching**: Messages are stored in database for quick retrieval
3. **Rate Limiting**: 10-second token windows prevent spam
4. **Database Indexing**: Indexes on userId, chatId, referrerId for fast queries

## Monitoring

### Important Metrics to Track
- Failed login attempts per IP
- Suspicious activity patterns
- Credit usage by model
- Referral conversion rate
- Session duration and retention

### Security Logs
Check server logs for:
- Rate limit violations
- SQL injection attempts
- Invalid email attempts
- Authentication failures

## Next Steps

1. Set up Google OAuth credentials
2. Configure environment variables
3. Test authentication flow
4. Connect AI model APIs (Dolphin, Claude, etc.)
5. Deploy to Vercel
6. Monitor security events

## Support

For security concerns or bugs, refer to `SECURITY.md` for implementation details.
