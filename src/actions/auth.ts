"use server"

import { signIn, signOut } from "@/lib/auth"
import { db } from "@/db"
import { users, emailVerificationTokens, passwordResetTokens } from "@/db/schema"
import { eq } from "drizzle-orm"
import { hash } from "@node-rs/argon2"
import { nanoid } from "nanoid"
import { z } from "zod"
import { redirect } from "next/navigation"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"

const signupSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().optional(),
})

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const { email, password, firstName, lastName } = parsed.data

  // Check if email already exists
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase()))
  if (existing) {
    return { success: false, error: "An account with this email already exists" }
  }

  // Hash password with argon2id
  const passwordHash = await hash(password, {
    algorithm: 1, // argon2id
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })

  // Generate referral code
  const referralCode = nanoid(8).toUpperCase()

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      referralCode,
      role: "customer",
    })
    .returning({ id: users.id })

  // Create email verification token (expires in 24h)
  const token = nanoid(32)
  await db.insert(emailVerificationTokens).values({
    userId: newUser.id,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })

  await sendVerificationEmail(email, token)

  return { success: true, message: "Account created! Please check your email to verify your account." }
}

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    })
    return { success: true }
  } catch (error: any) {
    if (error?.message === "RateLimited") {
      return { success: false, error: "Too many failed attempts. Please try again in 15 minutes." }
    }
    if (error?.message === "EmailNotVerified") {
      return { success: false, error: "Please verify your email before logging in." }
    }
    return { success: false, error: "Invalid email or password" }
  }
}

export async function logoutAction() {
  await signOut({ redirect: false })
  redirect("/")
}

export async function verifyEmailAction(token: string) {
  const [tokenRecord] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token))

  if (!tokenRecord) return { success: false, error: "Invalid or expired verification link" }
  if (tokenRecord.usedAt) return { success: false, error: "This verification link has already been used" }
  if (tokenRecord.expiresAt < new Date()) return { success: false, error: "Verification link has expired" }

  // Mark email as verified
  await db
    .update(users)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(users.id, tokenRecord.userId))

  // Mark token as used
  await db
    .update(emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(emailVerificationTokens.id, tokenRecord.id))

  return { success: true }
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"))
  if (!email.success) return { success: false, error: "Valid email required" }

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.data.toLowerCase()))

  // Always return success to prevent email enumeration
  if (!user) return { success: true }

  const token = nanoid(32)
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  })

  await sendPasswordResetEmail(email.data, token)

  return { success: true }
}
