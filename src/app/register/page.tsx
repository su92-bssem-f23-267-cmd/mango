'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { registerUser } from '@/actions/authActions'
import { Lock, Mail, User, ArrowRight, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      // 1. Call Register Server Action
      const result = await registerUser({ name, email, password })

      if (result.error) {
        throw new Error(result.error)
      }

      // 2. Automatically log in user after successful signup
      toast.success('Account created successfully! Logging you in...')
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (res?.error) {
        toast.error('Account created, but automatic sign-in failed. Please login manually.')
        router.push('/login')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.')
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
          <CardTitle className="text-2xl font-black text-primary tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-xs">
            Join Mango Mart to track orders and save your delivery details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="pl-9 text-xs"
                  required
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
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
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-9 text-xs"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Confirm Password</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="pl-9 text-xs"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full font-bold cursor-pointer h-10 mt-2">
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground border-t border-border pt-4">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-accent hover:underline flex inline-flex items-center gap-0.5">
              Sign In
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
