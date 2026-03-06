"use client"

import { useActionState } from "react"
import { loginAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const [state, action, pending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      const result = await loginAction(formData)
      if (result.success) {
        window.location.href = "/"
      }
      return result
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
          Welcome Back
        </CardTitle>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
              {state.error}
            </div>
          )}
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              required
              autoComplete="current-password"
              minLength={8}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#D4536A] focus:ring-[#D4536A]"
            />
            <Label htmlFor="remember" className="text-sm font-normal">
              Remember me
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign In"}
          </Button>
          <div className="flex w-full justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-[#D4536A] hover:underline"
            >
              Forgot password?
            </Link>
            <Link href="/signup" className="text-[#D4536A] hover:underline">
              Create account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
