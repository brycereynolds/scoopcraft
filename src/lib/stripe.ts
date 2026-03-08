import Stripe from "stripe"

// Lazily initialised so Next.js can build without env vars present.
// The instance will throw at runtime if the key is missing.
let _stripe: Stripe | undefined

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Missing STRIPE_SECRET_KEY environment variable")
      }
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia",
        typescript: true,
      })
    }
    return (_stripe as any)[prop]
  },
})
