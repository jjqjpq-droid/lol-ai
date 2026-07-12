import { pgTable, text, timestamp, boolean, numeric, integer } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables: LOL AI Web -----------------------------------------------

export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  agent: text('agent').notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  chatId: text('chatId')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  tokensUsed: integer('tokensUsed').default(0),
  creditsDeducted: numeric('creditsDeducted', { precision: 10, scale: 4 }).default('0'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const credits = pgTable('credits', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  balance: numeric('balance', { precision: 15, scale: 4 }).default('0'),
  totalSpent: numeric('totalSpent', { precision: 15, scale: 4 }).default('0'),
  totalEarned: numeric('totalEarned', { precision: 15, scale: 4 }).default('0'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const referrals = pgTable('referrals', {
  id: text('id').primaryKey(),
  referrerId: text('referrerId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  referredUserId: text('referredUserId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(),
  creditsEarned: numeric('creditsEarned', { precision: 10, scale: 4 }).default('0'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const rateLimits = pgTable('rateLimits', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  sessionId: text('sessionId').notNull(),
  tokensUsedInWindow: integer('tokensUsedInWindow').default(0),
  windowResetAt: timestamp('windowResetAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
