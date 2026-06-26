import { cn } from '@/lib/utils'

export type DonutSegment = {
  label: string
  value: number
  /** Tailwind text-* class for the legend dot + a matching stroke color */
  color: string
  stroke: string
}

interface OrdersDonutProps {
  segments: DonutSegment[]
  centerLabel?: string
  className?: string
}

const SIZE = 180
const STROKE = 22
const R = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * R
const CENTER = SIZE / 2

export default function OrdersDonut({ segments, centerLabel = 'Orders', className }: OrdersDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  let accumulated = 0

  return (
    <div className={cn('flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8', className)}>
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" role="img" aria-label="Orders breakdown by status">
          {/* Track */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={R}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-secondary"
          />
          {total > 0 &&
            segments.map((seg) => {
              if (seg.value <= 0) return null
              const fraction = seg.value / total
              const dash = fraction * CIRCUMFERENCE
              const offset = -accumulated * CIRCUMFERENCE
              accumulated += fraction
              return (
                <circle
                  key={seg.label}
                  cx={CENTER}
                  cy={CENTER}
                  r={R}
                  fill="none"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  stroke={seg.stroke}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={offset}
                  className="transition-all duration-500"
                />
              )
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tight text-foreground">{total}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{centerLabel}</span>
        </div>
      </div>

      {/* Legend */}
      <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0
          return (
            <li key={seg.label} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className={cn('h-2.5 w-2.5 rounded-full', seg.color)} />
                {seg.label}
              </span>
              <span className="text-xs font-bold text-muted-foreground tabular-nums">
                {seg.value} <span className="text-muted-foreground/60">· {pct}%</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
