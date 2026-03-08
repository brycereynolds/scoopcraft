import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use the edge-compatible auth config (no Node.js native packages) so that
// middleware can run on the Next.js Edge Runtime without bundling argon2.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Protect admin routes — require admin role
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Protect customer-only routes
  const protectedCustomerRoutes = ["/profile", "/orders", "/cart", "/checkout"]
  const isProtectedRoute = protectedCustomerRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === "/login" || pathname === "/signup") && session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/cart",
    "/checkout/:path*",
    "/login",
    "/signup",
  ],
}
