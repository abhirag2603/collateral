import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// Use lightweight authConfig (no mongoose/bcrypt) — safe for Edge Runtime
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
