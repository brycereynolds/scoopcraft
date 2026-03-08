import { render as renderEmail } from "@react-email/render"
import { postmarkClient, FROM_EMAIL } from "./postmark"
import type { ReactElement } from "react"

/**
 * Send a transactional email using Postmark.
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
  if (!process.env.POSTMARK_SERVER_TOKEN) {
    console.warn(`[email] Skipping send to ${to} — POSTMARK_SERVER_TOKEN not configured`)
    return false
  }

  try {
    const html = await renderEmail(react)
    const text = await renderEmail(react, { plainText: true })

    await postmarkClient.sendEmail({
      From: FROM_EMAIL,
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
      MessageStream: "outbound",
    })

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
