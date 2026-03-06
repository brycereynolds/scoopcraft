import { vi } from "vitest"

// Stub environment variables for tests
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"
process.env.AUTH_SECRET = "test-secret-key-minimum-32-chars-long"
process.env.NEXTAUTH_URL = "http://localhost:3000"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => "/"),
}))

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}))
