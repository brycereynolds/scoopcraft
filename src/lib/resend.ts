import { Resend } from "resend"

// Warn at startup rather than throw — allows builds/tests without real API key
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY not set — email sending will be disabled")
}

// Use a placeholder key during build/test when env var is not set or empty.
// Use || (not ??) so empty-string values also fall back to the placeholder.
// email.ts guards all sends with a RESEND_API_KEY check so real sends still fail gracefully.
export const resend = new Resend(process.env.RESEND_API_KEY || "placeholder")
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@scoopcraft.com"
