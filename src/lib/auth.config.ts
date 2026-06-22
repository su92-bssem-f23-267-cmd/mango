import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as import("next-auth").User).role
      }
      if (token.role === 'ADMIN' && token.email?.toLowerCase() !== 'jamsubhasadiq125@gmail.com') {
        token.role = 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as import("@prisma/client").Role
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role

      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      const isProtectedRoute =
        nextUrl.pathname.startsWith('/profile') ||
        nextUrl.pathname.startsWith('/orders') ||
        nextUrl.pathname === '/checkout'

      if (isAdminRoute) {
        if (!isLoggedIn || role !== 'ADMIN') return false
        return true
      }

      if (isProtectedRoute) {
        if (!isLoggedIn) return false
        return true
      }

      return true
    },
  },
  providers: [], // providers are added in the full auth.ts
} satisfies NextAuthConfig
