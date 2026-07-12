'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { referrals, credits, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function generateReferralCode() {
  const userId = await getUserId()
  const code = `ref_${userId.substring(0, 8)}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  return code
}

export async function applyReferralCode(code: string) {
  const userId = await getUserId()
  
  // Check if code exists and who referred
  const referralRecord = await db
    .select()
    .from(referrals)
    .where(eq(referrals.code, code))
  
  if (!referralRecord.length) {
    throw new Error('Invalid referral code')
  }
  
  const referral = referralRecord[0]
  
  // Check if user already has a referrer
  const existingReferral = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredUserId, userId))
  
  if (existingReferral.length > 0) {
    throw new Error('You already have a referrer')
  }
  
  // Create new referral relationship
  await db.insert(referrals).values({
    id: uuidv4(),
    referrerId: referral.referrerId,
    referredUserId: userId,
    code: code,
    creditsEarned: '0',
  })
  
  // Give referred user 100 bonus credits
  let userCredits = await db
    .select()
    .from(credits)
    .where(eq(credits.userId, userId))
  
  if (!userCredits.length) {
    await db.insert(credits).values({
      id: uuidv4(),
      userId,
      balance: '100',
      totalEarned: '100',
    })
  } else {
    const newBalance = (parseFloat(userCredits[0].balance || '0') + 100).toFixed(4)
    const newEarned = (parseFloat(userCredits[0].totalEarned || '0') + 100).toFixed(4)
    await db
      .update(credits)
      .set({
        balance: newBalance,
        totalEarned: newEarned,
      })
      .where(eq(credits.userId, userId))
  }
  
  // Give referrer 50 credits
  let referrerCredits = await db
    .select()
    .from(credits)
    .where(eq(credits.userId, referral.referrerId))
  
  if (!referrerCredits.length) {
    await db.insert(credits).values({
      id: uuidv4(),
      userId: referral.referrerId,
      balance: '50',
      totalEarned: '50',
    })
  } else {
    const newBalance = (parseFloat(referrerCredits[0].balance || '0') + 50).toFixed(4)
    const newEarned = (parseFloat(referrerCredits[0].totalEarned || '0') + 50).toFixed(4)
    await db
      .update(credits)
      .set({
        balance: newBalance,
        totalEarned: newEarned,
      })
      .where(eq(credits.userId, referral.referrerId))
  }
  
  return { success: true }
}

export async function getReferralStats() {
  const userId = await getUserId()
  
  const myReferrals = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, userId))
  
  const totalEarned = myReferrals.reduce((sum, ref) => {
    return sum + parseFloat(ref.creditsEarned || '0')
  }, 0)
  
  return {
    totalReferrals: myReferrals.length,
    totalEarned,
    referrals: myReferrals,
  }
}
