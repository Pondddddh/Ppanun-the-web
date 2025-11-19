import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, getTokenFromCookies } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const token = getTokenFromCookies(request.headers.get("cookie"))
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")
  const isProtectedPage =
    request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/games")
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")

  // Verify token
  const user = token ? await verifyToken(token) : null

  if (isAuthPage && user) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users to login
  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAdminPage) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/games/:path*", "/admin/:path*", "/login", "/register"],
}
