import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth, auto-verify email and create user if doesn't exist
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user with verified email
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "User",
                image: user.image,
                emailVerified: new Date(),
                stamina: 10.0,
                role: "ATHLETE",
              }
            })
          } else if (!existingUser.emailVerified) {
            // Auto-verify email for existing users who login with Google
            await prisma.user.update({
              where: { email: user.email! },
              data: { 
                emailVerified: new Date(),
                image: user.image // Update profile picture
              }
            })
          } else if (user.image && existingUser.image !== user.image) {
            // Update profile picture if changed
            await prisma.user.update({
              where: { email: user.email! },
              data: { image: user.image }
            })
          }
        } catch (error) {
          console.error("Error in Google OAuth signIn callback:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.emailVerified = user.emailVerified
      } else if (token.email) {
        // Refresh user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        })
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
          token.emailVerified = dbUser.emailVerified
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.emailVerified = token.emailVerified as Date | null
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
