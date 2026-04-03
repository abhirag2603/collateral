import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicRoute = ["/login", "/register", "/api/register"].some(path => nextUrl.pathname.startsWith(path))
      
      if (!isLoggedIn && !isPublicRoute) {
        return false // Redirect to login
      }
      
      if (isLoggedIn && isPublicRoute && !nextUrl.pathname.startsWith("/api")) {
        return Response.redirect(new URL("/", nextUrl))
      }
      
      return true
    },
  },
} satisfies NextAuthConfig
