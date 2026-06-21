import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Leaf, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-br from-secondary/30 via-background to-secondary/10 text-center">
      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Leaf className="h-10 w-10 text-primary fill-primary/20" />
      </div>
      <h1 className="text-6xl font-black text-primary tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-foreground mt-2">Page Not Found</h2>
      <p className="text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back to browsing fresh mangoes.
      </p>
      <div className="flex items-center gap-4 mt-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'font-bold cursor-pointer flex items-center gap-2'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/shop"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'font-bold cursor-pointer'
          )}
        >
          Browse Shop
        </Link>
      </div>
    </div>
  )
}
