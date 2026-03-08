import type { ReactNode } from "react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FFF5F6] to-white px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1
            className="text-4xl font-bold text-[#D4536A]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            ScoopCraft
          </h1>
          <p className="mt-1 text-sm text-[#C4883D]">
            Handcrafted happiness, delivered
          </p>
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
