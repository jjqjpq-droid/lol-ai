'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { chats, messages, credits, rateLimits, user } from '@/lib/db/schema'
import { and, eq, desc, gt } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { countTokens, calculateCredits, CREDIT_COSTS } from '@/lib/tokenCounter'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function createChat(agent: string, title: string) {
  const userId = await getUserId()
  const chatId = uuidv4()
  
  await db.insert(chats).values({
    id: chatId,
    userId,
    agent,
    title,
  })
  
  revalidatePath('/dashboard')
  return chatId
}

export async function getChats() {
  const userId = await getUserId()
  return db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt))
}

export async function getChat(chatId: string) {
  const userId = await getUserId()
  const chatData = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
  
  if (!chatData.length) throw new Error('Chat not found')
  
  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt)
  
  return { chat: chatData[0], messages: chatMessages }
}

export async function sendMessage(
  chatId: string,
  content: string,
  agent: string,
  response: string
) {
  const userId = await getUserId()
  
  // Verify chat ownership
  const chatData = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
  
  if (!chatData.length) throw new Error('Chat not found or unauthorized')
  
  // Check rate limiting (10 tokens per 10 seconds)
  const now = new Date()
  const sessionId = `${userId}-session`
  
  let rateLimitRecord = await db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.userId, userId), eq(rateLimits.sessionId, sessionId)))
  
  if (rateLimitRecord.length > 0) {
    const record = rateLimitRecord[0]
    if (record.windowResetAt! > now) {
      if (record.tokensUsedInWindow! >= 10) {
        throw new Error('Rate limit exceeded: 10 tokens per 10 seconds')
      }
    } else {
      // Reset window
      await db
        .delete(rateLimits)
        .where(and(eq(rateLimits.userId, userId), eq(rateLimits.sessionId, sessionId)))
    }
  }
  
  // Count tokens
  const userTokens = countTokens(content, agent)
  const assistantTokens = countTokens(response, agent)
  const totalTokens = userTokens + assistantTokens
  
  // Get user credits
  let userCredits = await db
    .select()
    .from(credits)
    .where(eq(credits.userId, userId))
  
  if (!userCredits.length) {
    // Create credits record
    await db.insert(credits).values({
      id: uuidv4(),
      userId,
      balance: '0',
    })
    userCredits = await db
      .select()
      .from(credits)
      .where(eq(credits.userId, userId))
  }
  
  const creditsNeeded = calculateCredits(agent, totalTokens)
  const currentBalance = parseFloat(userCredits[0].balance || '0')
  
  if (agent !== 'github' && currentBalance < creditsNeeded) {
    throw new Error('Insufficient credits')
  }
  
  // Save messages
  const userMessageId = uuidv4()
  const assistantMessageId = uuidv4()
  
  await db.insert(messages).values([
    {
      id: userMessageId,
      chatId,
      userId,
      role: 'user',
      content,
      tokensUsed: userTokens,
      creditsDeducted: '0',
    },
    {
      id: assistantMessageId,
      chatId,
      userId,
      role: 'assistant',
      content: response,
      tokensUsed: assistantTokens,
      creditsDeducted: creditsNeeded.toString(),
    },
  ])
  
  // Deduct credits
  if (agent !== 'github') {
    const newBalance = (currentBalance - creditsNeeded).toFixed(4)
    await db
      .update(credits)
      .set({
        balance: newBalance,
        totalSpent: (parseFloat(userCredits[0].totalSpent || '0') + creditsNeeded).toFixed(4),
      })
      .where(eq(credits.userId, userId))
  }
  
  // Update rate limit
  const newTokensInWindow = (rateLimitRecord[0]?.tokensUsedInWindow || 0) + totalTokens
  const newWindowResetAt = new Date(now.getTime() + 10000)
  
  if (rateLimitRecord.length > 0) {
    await db
      .update(rateLimits)
      .set({
        tokensUsedInWindow: newTokensInWindow,
        windowResetAt: newWindowResetAt,
      })
      .where(and(eq(rateLimits.userId, userId), eq(rateLimits.sessionId, sessionId)))
  } else {
    await db.insert(rateLimits).values({
      id: uuidv4(),
      userId,
      sessionId,
      tokensUsedInWindow: totalTokens,
      windowResetAt: newWindowResetAt,
    })
  }
  
  revalidatePath(`/dashboard/chat/${chatId}`)
  return { userMessageId, assistantMessageId }
}

export async function deleteChat(chatId: string) {
  const userId = await getUserId()
  const chatData = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
  
  if (!chatData.length) throw new Error('Chat not found or unauthorized')
  
  await db.delete(chats).where(eq(chats.id, chatId))
  
  revalidatePath('/dashboard')
}

export async function getUserCredits() {
  const userId = await getUserId()
  const userCredits = await db
    .select()
    .from(credits)
    .where(eq(credits.userId, userId))
  
  if (!userCredits.length) {
    return { balance: '0', totalSpent: '0', totalEarned: '0' }
  }
  
  return userCredits[0]
}
