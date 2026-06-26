import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatTone = 'green' | 'amber' | 'blue' | 'violet' | 'rose' | 'sky' | 'emerald'

const TONE: Record<StatTone, { chip: string; ring: string; accent: string }> = {
  green: { chip: 'bg-primary/10 text-primary', ring: 'hover:border-primary/30', accent: 'text-primary' },
  emerald: { chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', ring: 'hover:border-emerald-500/30', accent: 'text-emerald-600 dark:text-emerald-400' },
  amber: { chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', ring: 'hover:border-amber-500/30', accent: 'text-amber-600 dark:text-amber-400' },
  blue: { chip: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', ring: 'hover:border-blue-500/30', accent: 'text-blue-600 dark:text-blue-400' },
  violet: { chip: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', ring: 'hover:border-violet-500/30', accent: 'text-violet-600 dark:text-violet-400' },
  rose: { chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', ring: 'hover:border-rose-500/30', accent: 'text-rose-600 dark:text-rose-400' },
  sky: { chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', ring: 'hover:border-sky-500/30', accent: 'text-sky-600 dark:text-sky-400' },
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  tone?: StatTone
  /** Optional trend label e.g. "Today" */
  badge?: string
  /** Optional highlight style with a soft gradient background */
  highlight?: boolean
  /** Animation order for the staggered reveal */
  index?: number
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'green',
  badge,
  highlight = false,
  index = 0,
}: StatCardProps) {
  const t = TONE[tone]
  return (
    <div
      className={cn(
        'group reveal-up rounded-2xl border border-border/50 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        highlight ? 'bg-gradient-to-br from-card to-secondary/30' : 'bg-card',
        t.ring
      )}
      style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110', t.chip)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">{value}</p>
        {badge && (
          <span className={cn('rounded-full bg-secondary/70 px-2 py-0.5 text-[10px] font-bold', t.accent)}>
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
