import Stripe from "stripe"

// The Stripe key is required at runtime but must not be validated at module-load
// time — doing so would cause `next build` to fail in CI where the secret is
// not present in the build environment.  Any actual Stripe API call made with
// a missing or invalid key will throw at request time with a clear error.
const key = process.env.STRIPE_SECRET_KEY ?? "sk_test_build_placeholder_not_real"

export const stripe = new Stripe(key, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
})
