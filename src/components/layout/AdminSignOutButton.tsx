'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSignOutButtonProps {
  className?: string
  showText?: boolean
}

export default function AdminSignOutButton({ className, showText = true }: AdminSignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className={cn(
        "flex items-center text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors cursor-pointer w-full text-left",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      {showText && <span className="ml-3">Sign Out</span>}
    </button>
  )
}
