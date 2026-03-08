/**
 * Edge-compatible auth configuration (no Node.js native dependencies).
 *
 * This file is intentionally kept free of any imports that can't run on the
 * Next.js Edge Runtime (e.g. @node-rs/argon2, postgres, drizzle-orm).
 * It is imported by middleware for JWT session checks, and merged into the
 * full auth config in auth.ts for credential verification on the server.
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
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
};
