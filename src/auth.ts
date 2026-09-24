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
            onboardingCompleted: user.onboardingCompleted ?? false,
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
    async jwt({ token, user, account, profile, trigger, session }) {
      if (trigger === "update" && session?.onboardingCompleted !== undefined) {
        token.onboardingCompleted = session.onboardingCompleted;
      }

      if (account?.provider === "google" && profile?.email) {
        try {
          await connectDB();
          let dbUser = await User.findOne({ email: profile.email });
          if (!dbUser) {
            dbUser = await User.create({
              name: profile.name || token.name,
              email: profile.email,
              onboardingCompleted: false,
            });
          }
          token.sub = dbUser._id.toString();
          token.onboardingCompleted = dbUser.onboardingCompleted ?? false;
        } catch (err) {
          console.error("Error linking Google account to DB:", err);
        }
      } else if (user) {
        token.sub = user.id;
        token.onboardingCompleted = (user as any).onboardingCompleted ?? false;
      }

      // Check DB if onboarding status is missing on token
      if (token.sub && token.onboardingCompleted === undefined) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.sub);
          if (dbUser) {
            token.onboardingCompleted = dbUser.onboardingCompleted ?? false;
          }
        } catch (err) {
          console.error("Error fetching onboarding status for token:", err);
        }
      }

      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token?.sub) {
        session.user.id = token.sub as string;
        session.user.onboardingCompleted = token.onboardingCompleted ?? false;
      }
      return session;
    },
  },
})
