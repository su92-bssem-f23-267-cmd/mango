import { auth } from "@/lib/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isProtectedRoute = nextUrl.pathname.startsWith('/profile') || 
                           nextUrl.pathname.startsWith('/orders') || 
                           nextUrl.pathname === '/checkout'

  if (isAdminRoute) {
    if (!isLoggedIn || role !== 'ADMIN') {
      return Response.redirect(new URL('/', nextUrl))
    }
  }

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl)
      // Save original URL as callbackUrl
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
      return Response.redirect(loginUrl)
    }
  }

  return
})

export const config = {
  matcher: [
    // Protect admin, profile, orders, and checkout routes
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/checkout',
  ],
}
