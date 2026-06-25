'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Lock, Mail, ArrowRight, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (res?.error) {
        toast.error('Invalid credentials. Please try again.')
      } else {
        toast.success('Successfully logged in! Welcome back.')
        
        // Instant redirect depending on email to avoid slow session fetch API call
        if (email.trim().toLowerCase() === 'jamsubhasadiq125@gmail.com') {
          router.push('/admin/dashboard')
        } else {
          router.push(callbackUrl)
        }
        router.refresh()
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-secondary/35 via-background to-secondary/15">
      <Card className="w-full max-w-md shadow-lg border-border/80">
        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center text-primary">
              <Leaf className="h-5 w-5 fill-accent text-accent animate-spin-slow" />
            </div>
          </div>
          <CardTitle className="text-2xl font-black text-primary tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-xs">
            Sign in with email and password to place orders and view history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="you@fruitgala.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="pl-9 text-xs"
                  required
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Password</label>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-9 text-xs"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full font-bold cursor-pointer h-10 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>


        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground border-t border-border pt-4">
          <p>
            New to Fruit Gala?{' '}
            <Link href="/register" className="font-bold text-accent hover:underline flex inline-flex items-center gap-0.5">
              Create an Account
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-secondary/35 via-background to-secondary/15">
        <div className="w-full max-w-md p-8 bg-background rounded-2xl shadow-lg border border-border flex flex-col items-center justify-center min-h-[400px]">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Leaf className="h-5 w-5 fill-accent text-accent animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">Preparing login...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
