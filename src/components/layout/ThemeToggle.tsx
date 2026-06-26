'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useMounted from '@/hooks/useMounted'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/60 text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-secondary hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer',
        className
      )}
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch */}
      {!mounted ? (
        <Sun className="h-4 w-4" />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'moon' : 'sun'}
            initial={{ y: -8, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 8, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <Moon className="h-4 w-4 text-amber-300" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  )
}
