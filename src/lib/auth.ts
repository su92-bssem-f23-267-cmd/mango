import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = String(credentials.email).toLowerCase()
        
        // Dynamically import db and bcryptjs to keep them out of edge bundles
        const { default: db } = await import('@/lib/db')
        const bcrypt = await import('bcryptjs')

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(String(credentials.password), user.password)

        if (!isPasswordValid) {
          return null
        }

        // Restrict admin access to jamsubhasadiq125@gmail.com only
        let userRole = user.role
        if (userRole === 'ADMIN' && email !== 'jamsubhasadiq125@gmail.com') {
          userRole = 'USER'
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRole
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
})
