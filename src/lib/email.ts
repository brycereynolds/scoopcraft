import { resend, FROM_EMAIL } from "./resend"
import type { ReactElement } from "react"

/**
 * Send a transactional email using Resend.
 * Returns true on success, false on failure (never throws).
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: ReactElement
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[email] Skipping send to ${to} — RESEND_API_KEY not configured`)
    return false
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
    })

    if (error) {
      console.error(`[email] Failed to send "${subject}" to ${to}:`, error)
      return false
    }

    console.log(`[email] Sent "${subject}" to ${to}`)
    return true
  } catch (err) {
    console.error(`[email] Exception sending "${subject}" to ${to}:`, err)
    return false
  }
}

/**
 * Send email verification email.
 */
export async function sendVerificationEmail(to: string, token: string): Promise<boolean> {
  const { VerifyEmailTemplate } = await import("@/emails/verify-email")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const verifyUrl = `${appUrl}/verify-email?token=${token}`
  return sendEmail({
    to,
    subject: "Verify your ScoopCraft account",
    react: VerifyEmailTemplate({ verifyUrl, email: to }),
  })
}

/**
 * Send password reset email.
 */
export async function sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
  const { PasswordResetTemplate } = await import("@/emails/password-reset")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const resetUrl = `${appUrl}/reset-password?token=${token}`
  return sendEmail({
    to,
    subject: "Reset your ScoopCraft password",
    react: PasswordResetTemplate({ resetUrl, email: to }),
  })
}

/**
 * Send order confirmation email.
 */
export async function sendOrderConfirmationEmail(to: string, orderId: number): Promise<boolean> {
  const { OrderConfirmationTemplate } = await import("@/emails/order-confirmation")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const orderUrl = `${appUrl}/orders/${orderId}`
  return sendEmail({
    to,
    subject: "Your ScoopCraft order is confirmed! 🍦",
    react: OrderConfirmationTemplate({ orderId, orderUrl }),
  })
}
