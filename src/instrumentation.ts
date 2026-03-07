/**
 * Next.js Instrumentation Hook
 *
 * This file runs once on server startup (Node.js runtime only).
 * It automatically applies any pending Drizzle migrations so the
 * database schema is always in sync when the service boots.
 *
 * Railway deployment: this runs inside Railway's private network,
 * where the Postgres service is accessible via the internal DATABASE_URL.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { migrate } = await import("drizzle-orm/postgres-js/migrator")
      const { db } = await import("./db")

      console.log("[startup] Running database migrations...")
      await migrate(db, { migrationsFolder: "src/db/migrations" })
      console.log("[startup] Migrations complete.")
    } catch (err) {
      // Log but don't crash — allows the app to start even if DB is temporarily unavailable.
      // The app will show errors on pages that require DB access until the DB is reachable.
      console.error("[startup] Migration error (non-fatal):", err)
    }
  }
}
