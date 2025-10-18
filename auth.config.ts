import Google from 'next-auth/providers/google'
import { NextAuthOptions } from 'next-auth'

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2 hours
  },
  pages: {
    signIn: '/auth/login',
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      }
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
} satisfies NextAuthOptions


