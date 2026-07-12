# LOL AI Web - Multi-Agent AI Chat Platform

A production-ready Next.js application featuring multiple AI agents with enterprise-grade security, credit-based billing, and referral rewards.

**Repository**: https://github.com/jjqjpq-droid/lol-ai

## Features

### AI Agents
- **Dolphin** - Efficient & affordable model
- **GitHub Copilot** - FREE unlimited usage
- **Claude** - Premium AI model
- **Perplexity** - Web-aware AI assistant
- **GLM** - Alternative powerful model
- **HY3** - Research-focused AI

### Security Features
- **Rate Limiting**: 5 signup attempts/hour, 10 login attempts/15 minutes
- **DDoS Protection**: Client fingerprinting + session-based tracking
- **Password Security**: Complex requirements (8+ chars, mixed case, numbers/symbols)
- **Input Validation**: SQL injection prevention, XSS protection, bot detection
- **Disposable Email Detection**: Blocks temporary email addresses
- **Security Headers**: CORS, CSP, X-Frame-Options configured
- **Session Management**: HttpOnly, Secure cookies with 7-day duration

### Monetization
- **Per-Token Billing**: Fair pricing based on actual token usage
- **Credit System**: User credit balance with real-time tracking
- **Referral Program**: 
  - 100 credits bonus for referred users
  - 50 credits reward for referrer
  - Unique referral codes

### Technology Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth + Google OAuth ready
- **Styling**: Tailwind CSS v4 with glassmorphic design
- **Security**: bcryptjs, helmet, validator.js
- **Token Counting**: js-tiktoken for accurate billing

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- Neon PostgreSQL database
- Google OAuth credentials (optional)

### Installation

```bash
git clone https://github.com/jjqjpq-droid/lol-ai.git
cd lol-ai
pnpm install
```

### Environment Setup

Create `.env.local`:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication
BETTER_AUTH_SECRET=your-secret-here (generate with: openssl rand -base64 32)
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Database Setup

Tables will be automatically created by Better Auth and Drizzle:
- `user` - User accounts
- `session` - Session management
- `account` - OAuth accounts
- `verification` - Email verification
- `chats` - Conversation history
- `messages` - Chat messages with token tracking
- `credits` - User credit balance
- `referrals` - Referral tracking
- `rateLimits` - Rate limiting windows

### Running Locally

```bash
pnpm dev
```

Visit `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth handler
│   │   └── chat/                # AI chat endpoint
│   ├── actions/
│   │   ├── chat.ts              # Chat operations
│   │   ├── referral.ts          # Referral management
│   │   └── auth-security.ts     # Auth validation
│   ├── dashboard/               # User dashboard
│   ├── sign-in/                 # Sign-in page
│   ├── sign-up/                 # Sign-up page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── lib/
│   ├── auth.ts                  # Better Auth config
│   ├── auth-client.ts           # Auth client
│   ├── db/
│   │   ├── index.ts             # Drizzle client
│   │   └── schema.ts            # Database schema
│   ├── security.ts              # Security utilities
│   ├── middleware.ts            # Request validation
│   └── tokenCounter.ts          # Token counting
├── components/
│   ├── auth-form.tsx            # Auth forms
│   ├── chat-interface.tsx       # Chat UI
│   ├── chat-list.tsx            # Chat history
│   ├── credits-panel.tsx        # Credits display
│   ├── referral-panel.tsx       # Referral UI
│   └── new-chat-button.tsx      # New chat
└── public/                      # Static assets
```

## Security Features

### Password Requirements
- Minimum 8 characters
- Must contain uppercase & lowercase letters
- Must contain numbers OR special characters
- Maximum 128 characters

### Rate Limiting
- **Sign-up**: 5 attempts per hour (per fingerprint)
- **Login**: 10 attempts per 15 minutes (per email)
- **API**: Per-session token windows (10 seconds)

### Anti-Bot Protection
- User-Agent validation (blocks curl, wget, sqlmap, etc.)
- Request header validation
- Body size limits (max 10KB per field)
- IP-based fingerprinting

### Data Protection
- Parameterized SQL queries via Drizzle ORM
- Bcryptjs password hashing
- Input sanitization & validation
- CORS configured
- Security headers enabled

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

Set environment variables in Vercel Project Settings:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)

### Environment Variables

All environment variables can be configured in the Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required `.env.local` variables
3. Deploy!

See `DEPLOYMENT.md` for detailed instructions.

## Credit Pricing

| Model | Cost per 1000 tokens |
|-------|---------------------|
| GitHub Copilot | FREE |
| Dolphin | $0.0015 |
| GLM | $0.003 |
| HY3 | $0.004 |
| Perplexity | $0.005 |
| Claude | $0.015 |

## API Endpoints

### Chat
- `POST /api/chat` - Send message to AI agent
  - Request: `{ chatId, agent, message }`
  - Response: `{ reply, tokensUsed, creditsCost }`

### Authentication
- `POST /api/auth/sign-up` - Create account
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

## Documentation

- `SECURITY.md` - Detailed security implementation
- `DEPLOYMENT.md` - Production deployment guide
- `SECURITY.md` - Security features and best practices

## Contributing

Contributions are welcome! Please ensure:
- All tests pass
- Security best practices are followed
- Code is properly formatted
- Environment variables are documented

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed reproduction steps
3. Include environment and error logs

## Roadmap

- [ ] Voice chat support
- [ ] Custom AI model integration
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] API rate limiting tier system
- [ ] Team workspaces
- [ ] Prompt templates library

## Author

Built with ❤️ by the LOL AI team

---

**Live Demo**: (Coming soon)
**GitHub**: https://github.com/jjqjpq-droid/lol-ai
**Docs**: See documentation files in repository
