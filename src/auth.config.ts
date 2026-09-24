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
      const isOnboardingRoute = nextUrl.pathname.startsWith("/onboarding")
      
      if (!isLoggedIn && !isPublicRoute) {
        return false // Redirect to login
      }
      
      if (isLoggedIn) {
        const onboardingCompleted = (auth.user as any)?.onboardingCompleted

        // If user has not completed onboarding and is not already on /onboarding
        if (onboardingCompleted === false && !isOnboardingRoute && !nextUrl.pathname.startsWith("/api")) {
          return Response.redirect(new URL("/onboarding", nextUrl))
        }

        // If user has completed onboarding and attempts to visit /onboarding or public auth routes
        if (onboardingCompleted === true && (isOnboardingRoute || isPublicRoute) && !nextUrl.pathname.startsWith("/api")) {
          return Response.redirect(new URL("/", nextUrl))
        }

        // If logged in on public route
        if (isPublicRoute && !nextUrl.pathname.startsWith("/api")) {
          return Response.redirect(new URL(onboardingCompleted === false ? "/onboarding" : "/", nextUrl))
        }
      }
      
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.onboardingCompleted = (user as any).onboardingCompleted ?? false
      }
      if (trigger === "update" && session?.onboardingCompleted !== undefined) {
        token.onboardingCompleted = session.onboardingCompleted
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token?.sub) {
        session.user.id = token.sub as string
        session.user.onboardingCompleted = token.onboardingCompleted ?? false
      }
      return session
    },
  },
} satisfies NextAuthConfig
