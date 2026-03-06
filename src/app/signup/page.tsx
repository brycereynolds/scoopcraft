"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signupAction } from "@/actions/auth";
import { Loader2, IceCream } from "lucide-react";

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPasswordMismatch(false);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    startTransition(async () => {
      const result = await signupAction(formData);
      if (result.success) {
        setSuccess(result.message ?? "Account created! Please check your email to verify.");
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
              Create account
            </CardTitle>
            <CardDescription style={{ color: "var(--foreground-muted)" }}>
              Join ScoopCraft and start earning rewards
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div
                className="rounded-lg px-4 py-4 text-sm text-center"
                style={{
                  backgroundColor: "rgba(107,158,124,0.1)",
                  color: "var(--success)",
                  border: "1px solid rgba(107,158,124,0.25)",
                }}
              >
                <p className="font-medium mb-1">Account created!</p>
                <p>{success}</p>
                <Link
                  href="/login"
                  className="mt-3 inline-block font-medium hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  Go to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" style={{ color: "var(--foreground)" }}>
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      required
                      placeholder="Jane"
                      style={{ borderColor: "var(--input)", backgroundColor: "var(--background)" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" style={{ color: "var(--foreground)" }}>
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      placeholder="Doe"
                      style={{ borderColor: "var(--input)", backgroundColor: "var(--background)" }}
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password" style={{ color: "var(--foreground)" }}>
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    style={{ borderColor: "var(--input)", backgroundColor: "var(--background)" }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" style={{ color: "var(--foreground)" }}>
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    style={{
                      borderColor: passwordMismatch ? "var(--destructive)" : "var(--input)",
                      backgroundColor: "var(--background)",
                    }}
                  />
                  {passwordMismatch && (
                    <p className="text-xs" style={{ color: "var(--destructive)" }}>
                      Passwords do not match
                    </p>
                  )}
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
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          {!success && (
            <CardFooter className="flex justify-center">
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  Log in
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
