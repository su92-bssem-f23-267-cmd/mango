import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    // Protect admin, profile, and orders routes
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
  ],
}
