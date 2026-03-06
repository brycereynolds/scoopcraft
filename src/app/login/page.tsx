"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction } from "@/actions/auth";
import { Loader2, IceCream } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success) {
        router.push("/account");
        router.refresh();
      } else {
        setError(result.error ?? "An error occurred");
      }
    });
  }

  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <IceCream className="h-7 w-7" style={{ color: "var(--primary)" }} />
          <span
            className="text-2xl font-semibold"
            style={{ fontFamily: "'DM Serif Display', serif", color: "var(--primary)" }}
          >
            ScoopCraft
          </span>
        </div>

        <Card style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <CardHeader className="space-y-1">
            <CardTitle
              className="text-2xl"
              style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
            >
              Welcome back
            </CardTitle>
            <CardDescription style={{ color: "var(--foreground-muted)" }}>
              Sign in to your ScoopCraft account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: "var(--foreground)" }}>
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  style={{ borderColor: "var(--input)", backgroundColor: "var(--background)" }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" style={{ color: "var(--foreground)" }}>
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  style={{ borderColor: "var(--input)", backgroundColor: "var(--background)" }}
                />
              </div>

              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{
                    backgroundColor: "rgba(201,65,58,0.08)",
                    color: "var(--destructive)",
                    border: "1px solid rgba(201,65,58,0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
