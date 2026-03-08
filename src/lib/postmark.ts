import * as postmark from "postmark"

// Warn at startup rather than throw — allows builds/tests without real API token
if (!process.env.POSTMARK_SERVER_TOKEN) {
  console.warn("POSTMARK_SERVER_TOKEN not set — email sending will be disabled")
}

// Use a placeholder token during build/test when env var is not set or empty.
// email.ts guards all sends with a POSTMARK_SERVER_TOKEN check so real sends still fail gracefully.
export const postmarkClient = new postmark.ServerClient(
  process.env.POSTMARK_SERVER_TOKEN || "placeholder"
)
export const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL ?? "noreply@scoopcraft.com"
