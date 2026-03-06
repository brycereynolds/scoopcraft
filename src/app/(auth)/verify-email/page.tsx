"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { verifyEmailAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  )
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) return

    let cancelled = false
    async function verify() {
      const result = await verifyEmailAction(token!)
      if (cancelled) return
      if (result.success) {
        setStatus("success")
      } else {
        setStatus("error")
        setErrorMessage(result.error ?? "Verification failed")
      }
    }
    verify()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <Card>
      <CardHeader>
        <CardTitle
          className="text-center text-[#D4536A]"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          {status === "success" ? "Email Verified!" : "Check Your Email"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {status === "idle" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D4536A]/10">
              <svg
                className="h-8 w-8 text-[#D4536A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              We sent a verification link to your email address. Please check
              your inbox and click the link to verify your account.
            </p>
            <p className="text-sm text-gray-400">
              Didn&apos;t receive an email? Check your spam folder or try signing
              up again.
            </p>
          </>
        )}

        {status === "verifying" && (
          <p className="text-gray-600">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7DBBA2]/20">
              <svg
                className="h-8 w-8 text-[#7DBBA2]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              Your email has been verified. You can now sign in to your account.
            </p>
            <Link href="/login">
              <Button className="mt-2">Sign In</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-600">{errorMessage}</p>
            <Link href="/signup">
              <Button variant="outline" className="mt-2">
                Try Again
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
