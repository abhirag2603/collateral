import NextAuth from "next-auth"
import bcrypt from "bcryptjs"
import { User } from "@/models/User"
import { connectDB } from "@/lib/db"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // MongoDBAdapter removed — using JWT sessions (no DB needed for session storage)
  // Add adapter back once MongoDB Atlas IP is whitelisted
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          await connectDB()
          const user = await User.findOne({ email: credentials.email })

          if (!user || !user.password) return null

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) return null

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          }
        } catch (err) {
          console.error("Auth DB error:", err)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token?.sub) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
})
