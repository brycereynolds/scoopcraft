import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

// Rate limiting helper using login_attempts table
async function checkLoginRateLimit(email: string): Promise<{ limited: boolean; retryAfter?: number }> {
  // Dynamic import to avoid circular deps
  const { db } = await import("@/db")
  const { loginAttempts } = await import("@/db/schema")
  const { and, gte, eq, count } = await import("drizzle-orm")

  const windowStart = new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago

  const [result] = await db
    .select({ total: count() })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, email),
        eq(loginAttempts.success, false),
        gte(loginAttempts.attemptedAt, windowStart)
      )
    )

  if ((result?.total ?? 0) >= 5) {
    return { limited: true, retryAfter: 15 * 60 }
  }
  return { limited: false }
}

async function recordLoginAttempt(email: string, success: boolean, ipAddress?: string) {
  const { db } = await import("@/db")
  const { loginAttempts } = await import("@/db/schema")
  await db.insert(loginAttempts).values({ email, success, ipAddress })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }).safeParse(credentials)

        if (!parsed.success) return null

        const { email, password } = parsed.data
        const ipAddress = (req as any)?.headers?.["x-forwarded-for"] ?? undefined

        // Check rate limit
        const rateLimit = await checkLoginRateLimit(email)
        if (rateLimit.limited) {
          throw new Error("RateLimited")
        }

        // Look up user
        const { db } = await import("@/db")
        const { users } = await import("@/db/schema")
        const { eq } = await import("drizzle-orm")
        const { verify } = await import("@node-rs/argon2")

        const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()))

        if (!user) {
          await recordLoginAttempt(email, false, ipAddress)
          return null
        }

        const valid = await verify(user.passwordHash, password)
        if (!valid) {
          await recordLoginAttempt(email, false, ipAddress)
          return null
        }

        // Require email verification
        if (!user.emailVerifiedAt) {
          throw new Error("EmailNotVerified")
        }

        // Clear failed attempts on successful login
        await recordLoginAttempt(email, true, ipAddress)

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
    }
  }
  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}
