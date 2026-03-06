import { Resend } from "resend"

// Warn at startup rather than throw — allows builds/tests without real API key
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY not set — email sending will be disabled")
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? "")
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@scoopcraft.com"
