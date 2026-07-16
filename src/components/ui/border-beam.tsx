'use client'

import type { MotionStyle, Transition } from 'motion/react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

type FadeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const cornerPosition: Record<FadeCorner, string> = {
  'top-left': '0% 0%',
  'top-right': '100% 0%',
  'bottom-left': '0% 100%',
  'bottom-right': '100% 100%'
}

interface BorderBeamProps {
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  transition?: Transition
  className?: string
  style?: React.CSSProperties
  reverse?: boolean
  initialOffset?: number
  borderWidth?: number
  /** Esquina hacia la que el beam se apaga a opacidad 0 al pasar cerca. */
  fadeCorner?: FadeCorner
  /** Qué tan grande es el área de fundido, en % del perímetro. Default 45. */
  fadeSize?: number
}

function BorderBeam({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = 'var(--destructive)',
  colorTo = 'var(--primary)',
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
  fadeCorner,
  fadeSize = 45
}: BorderBeamProps) {
  return (
    <div
      className='pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]'
      style={
        {
          '--border-beam-width': `${borderWidth}px`
        } as React.CSSProperties
      }
    >
      <motion.div
        className={cn(
          'absolute aspect-square',
          'rounded-full bg-linear-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent',
          className
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            '--color-from': colorFrom,
            '--color-to': colorTo,
            ...style
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`]
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
          delay: -delay,
          ...transition
        }}
      />
      {fadeCorner && (
        <div
          className='absolute inset-0 rounded-[inherit]'
          style={{
            background: `radial-gradient(circle at ${cornerPosition[fadeCorner]}, var(--card) 0%, transparent ${fadeSize}%)`
          }}
        />
      )}
    </div>
  )
}

export { BorderBeam, type BorderBeamProps }
