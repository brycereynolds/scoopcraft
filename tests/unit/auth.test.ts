import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock @node-rs/argon2
vi.mock("@node-rs/argon2", () => ({
  hash: vi.fn().mockResolvedValue("hashed_password"),
  verify: vi.fn().mockResolvedValue(true),
}))

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("test-nanoid-token-value"),
}))

// Mock @/lib/auth
vi.mock("@/lib/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  auth: vi.fn(),
}))

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  gte: vi.fn(),
  count: vi.fn(),
  relations: vi.fn().mockReturnValue({}),
}))

const mockInsertValues = vi.fn().mockReturnValue({
  returning: vi.fn().mockResolvedValue([{ id: 1 }]),
})
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues })
const mockSelectWhere = vi.fn().mockResolvedValue([])
const mockSelectFrom = vi.fn().mockReturnValue({ where: mockSelectWhere })
const mockSelect = vi.fn().mockReturnValue({ from: mockSelectFrom })
const mockUpdateSet = vi.fn().mockReturnValue({
  where: vi.fn().mockResolvedValue([]),
})
const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet })

vi.mock("@/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}))

describe("Auth Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset default: no existing user
    mockSelectWhere.mockResolvedValue([])
    mockInsertValues.mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 1 }]),
    })
  })

  describe("signupAction", () => {
    it("returns error for invalid email", async () => {
      const { signupAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "not-an-email")
      formData.set("password", "validpassword123")
      formData.set("firstName", "Test")

      const result = await signupAction(formData)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it("returns error for short password", async () => {
      const { signupAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "test@example.com")
      formData.set("password", "short")
      formData.set("firstName", "Test")

      const result = await signupAction(formData)
      expect(result.success).toBe(false)
      expect(result.error).toContain("8 characters")
    })

    it("returns error for missing first name", async () => {
      const { signupAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "test@example.com")
      formData.set("password", "validpassword123")
      formData.set("firstName", "")

      const result = await signupAction(formData)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it("returns error for duplicate email", async () => {
      mockSelectWhere.mockResolvedValue([{ id: 99 }])

      const { signupAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "existing@example.com")
      formData.set("password", "validpassword123")
      formData.set("firstName", "Test")
      formData.set("lastName", "User")

      const result = await signupAction(formData)
      expect(result.success).toBe(false)
      expect(result.error).toContain("already exists")
    })

    it("creates user successfully with valid input", async () => {
      const { signupAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "new@example.com")
      formData.set("password", "validpassword123")
      formData.set("firstName", "Jane")
      formData.set("lastName", "Doe")

      const result = await signupAction(formData)
      expect(result.success).toBe(true)
      expect(result.message).toContain("check your email")
    })
  })

  describe("loginAction", () => {
    it("handles login errors gracefully", async () => {
      const { signIn } = await import("@/lib/auth")
      vi.mocked(signIn).mockRejectedValue(new Error("CredentialsSignin"))

      const { loginAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "test@example.com")
      formData.set("password", "wrongpassword")

      const result = await loginAction(formData)
      expect(result.success).toBe(false)
    })

    it("returns rate limit error when rate limited", async () => {
      const { signIn } = await import("@/lib/auth")
      vi.mocked(signIn).mockRejectedValue(new Error("RateLimited"))

      const { loginAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "test@example.com")
      formData.set("password", "password123")

      const result = await loginAction(formData)
      expect(result.success).toBe(false)
      expect(result.error).toContain("Too many")
    })

    it("returns email not verified error", async () => {
      const { signIn } = await import("@/lib/auth")
      vi.mocked(signIn).mockRejectedValue(new Error("EmailNotVerified"))

      const { loginAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "unverified@example.com")
      formData.set("password", "password123")

      const result = await loginAction(formData)
      expect(result.success).toBe(false)
      expect(result.error).toContain("verify your email")
    })
  })

  describe("requestPasswordResetAction", () => {
    it("returns error for invalid email", async () => {
      const { requestPasswordResetAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "not-valid")

      const result = await requestPasswordResetAction(formData)
      expect(result.success).toBe(false)
      expect(result.error).toContain("email")
    })

    it("returns success even for non-existent email (prevents enumeration)", async () => {
      mockSelectWhere.mockResolvedValue([])

      const { requestPasswordResetAction } = await import("@/actions/auth")
      const formData = new FormData()
      formData.set("email", "nobody@example.com")

      const result = await requestPasswordResetAction(formData)
      expect(result.success).toBe(true)
    })
  })

  describe("verifyEmailAction", () => {
    it("returns error for invalid token", async () => {
      mockSelectWhere.mockResolvedValue([])

      const { verifyEmailAction } = await import("@/actions/auth")
      const result = await verifyEmailAction("invalid-token")
      expect(result.success).toBe(false)
      expect(result.error).toContain("Invalid")
    })

    it("returns error for already-used token", async () => {
      mockSelectWhere.mockResolvedValue([
        {
          id: 1,
          userId: 1,
          token: "used-token",
          usedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
          createdAt: new Date(),
        },
      ])

      const { verifyEmailAction } = await import("@/actions/auth")
      const result = await verifyEmailAction("used-token")
      expect(result.success).toBe(false)
      expect(result.error).toContain("already been used")
    })

    it("returns error for expired token", async () => {
      mockSelectWhere.mockResolvedValue([
        {
          id: 1,
          userId: 1,
          token: "expired-token",
          usedAt: null,
          expiresAt: new Date(Date.now() - 86400000), // expired yesterday
          createdAt: new Date(),
        },
      ])

      const { verifyEmailAction } = await import("@/actions/auth")
      const result = await verifyEmailAction("expired-token")
      expect(result.success).toBe(false)
      expect(result.error).toContain("expired")
    })
  })
})
