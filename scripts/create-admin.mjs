/**
 * Create/update admin user in production database
 * Usage: DATABASE_URL=... node scripts/create-admin.mjs
 */

import postgres from "postgres"
import { hashSync } from "@node-rs/argon2"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required")
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { ssl: "require" })

const password = "ScoopAdmin2026!"
const hash = hashSync(password)

console.log("Creating admin user...")
console.log("Email: admin@scoopcraft.com")
console.log("Password:", password)

const result = await sql`
  INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified_at, created_at, updated_at)
  VALUES (
    'admin@scoopcraft.com',
    ${hash},
    'admin',
    'Admin',
    'ScoopCraft',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    email_verified_at = COALESCE(users.email_verified_at, NOW()),
    updated_at = NOW()
  RETURNING id, email, role, email_verified_at
`

console.log("Result:", JSON.stringify(result, null, 2))
await sql.end()
console.log("Admin user created successfully!")
