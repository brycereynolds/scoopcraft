"use client"

import { useActionState } from "react"
import { requestPasswordResetAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return await requestPasswordResetAction(formData)
    },
    null
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle
          className="text-center text-[#D4536A]"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Reset Password
        </CardTitle>
      </CardHeader>
      {state?.success ? (
        <CardContent className="space-y-4 text-center">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600">
            If an account exists with that email, we&apos;ve sent password reset
            instructions. Please check your inbox.
          </p>
          <Link href="/login">
            <Button variant="outline" className="mt-2">
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      ) : (
        <form action={action}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
                {state.error}
              </div>
            )}
            <p className="text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending..." : "Send Reset Link"}
            </Button>
            <Link
              href="/login"
              className="text-center text-sm text-[#D4536A] hover:underline"
            >
              Back to Sign In
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
