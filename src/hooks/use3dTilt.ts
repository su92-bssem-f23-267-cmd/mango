'use client'

import { useState, useRef, MouseEvent } from 'react'

export function use3dTilt(maxTilt = 12) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [boxShadow, setBoxShadow] = useState('')

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!ref.current) return
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    
    // Relative coordinates of cursor from the center of the card
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Normalize coordinates (range: -1 to 1)
    const normX = x / (rect.width / 2)
    const normY = y / (rect.height / 2)
    
    // Calculate rotation angles
    // Moving mouse UP (negative y) tilts card forward/up (positive rotateX)
    // Moving mouse RIGHT (positive x) tilts card right (positive rotateY)
    const rotateX = -(normY * maxTilt).toFixed(2)
    const rotateY = (normX * maxTilt).toFixed(2)
    
    // Set 3D transform style
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`)
    
    // Dynamic shadow depending on direction of mouse
    const shadowX = -(normX * 12).toFixed(1)
    const shadowY = -(normY * 12).toFixed(1)
    setBoxShadow(
      `${shadowX}px ${shadowY}px 25px rgba(0, 0, 0, 0.12), 
       0 8px 16px -4px rgba(245, 158, 11, 0.15)`
    )
  }

  const handleMouseLeave = () => {
    // Reset transform smoothly
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    setBoxShadow('')
  }

  return {
    ref,
    style: {
      transform,
      boxShadow,
      transition: transform ? 'transform 0.05s ease-out, box-shadow 0.05s ease-out' : 'transform 0.5s ease, box-shadow 0.5s ease',
      transformStyle: 'preserve-3d' as const
    },
    handleMouseMove,
    handleMouseLeave
  }
}
