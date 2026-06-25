'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** Animation direction the content travels from. */
  from?: 'up' | 'down' | 'left' | 'right' | 'none'
  as?: 'div' | 'section' | 'span'
}

const OFFSET = 28

export function Reveal({
  children,
  className,
  delay = 0,
  from = 'up',
  as = 'div',
}: RevealProps) {
  const reduceMotion = useReducedMotion()

  const offsets = {
    up: { y: OFFSET, x: 0 },
    down: { y: -OFFSET, x: 0 },
    left: { x: OFFSET, y: 0 },
    right: { x: -OFFSET, y: 0 },
    none: { x: 0, y: 0 },
  }[from]

  const MotionTag = motion[as]

  if (reduceMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offsets }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}

export default Reveal
