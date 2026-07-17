import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

type RevealMode =
  | 'fade-up'
  | 'clip-left'
  | 'clip-right'
  | 'scale-in'
  | 'perspective'
  | 'ink-drip'
  | 'splatter'
  | 'slide-up'
  | 'rotate-in'
  | 'stagger-words'

interface ScrollRevealProps {
  children: React.ReactNode
  mode?: RevealMode
  delay?: number
  className?: string
  once?: boolean
  margin?: string
}

const modeVariants: Record<string, object> = {
  'fade-up': {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
  },
  'clip-left': {
    initial: { clipPath: 'inset(0 100% 0 0)' },
    whileInView: { clipPath: 'inset(0 0% 0 0)' },
  },
  'clip-right': {
    initial: { clipPath: 'inset(0 0% 0 0)' },
    whileInView: { clipPath: 'inset(0 100% 0 0)' },
  },
  'scale-in': {
    initial: { opacity: 0, scale: 0.88 },
    whileInView: { opacity: 1, scale: 1 },
  },
  'perspective': {
    initial: { opacity: 0, rotateX: 12, y: 40 },
    whileInView: { opacity: 1, rotateX: 0, y: 0 },
  },
  'ink-drip': {
    initial: { clipPath: 'inset(100% 0 0 0)' },
    whileInView: { clipPath: 'inset(0% 0 0 0)' },
  },
  'splatter': {
    initial: { opacity: 0, scale: 0.7, rotate: -5 },
    whileInView: { opacity: 1, scale: 1, rotate: 0 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 60, filter: 'blur(4px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  'rotate-in': {
    initial: { opacity: 0, rotateY: 15, x: -20 },
    whileInView: { opacity: 1, rotateY: 0, x: 0 },
  },
}

export function ScrollReveal({
  children,
  mode = 'fade-up',
  delay = 0,
  className = '',
  once = true,
  margin = '-60px',
}: ScrollRevealProps) {
  const base = modeVariants[mode]
  return (
    <motion.div
      {...base}
      whileInView={{
        ...(base as any).whileInView,
        transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
      }}
      viewport={{ once, margin }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── ParallaxLayer ─── */
export function ParallaxLayer({
  children,
  speed = 0.3,
  className = '',
}: {
  children: React.ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [speed * 120, -speed * 120])
  const springY = useSpring(y, { stiffness: 60, damping: 20 })

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: springY }}>
        {children}
      </motion.div>
    </div>
  )
}

/* ─── Section wrapper ─── */
export function SectionChapter({
  children,
  id,
  className = '',
}: {
  children: React.ReactNode
  id: string
  className?: string
}) {
  return (
    <section id={id} className={`section-chapter chapter ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  )
}

/* ─── SectionTitle ─── */
export function SectionTitle({
  label,
  title,
  subtitle,
}: {
  label?: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="text-center mb-16 sm:mb-20">
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-[0.5rem] tracking-[0.3em] uppercase text-crimson-dim font-medium inline-block relative">
            <span className="absolute -left-6 top-1/2 w-4 h-px bg-crimson/30" />
            {label}
            <span className="absolute -right-6 top-1/2 w-4 h-px bg-crimson/30" />
          </span>
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="text-2xl sm:text-3xl lg:text-4xl font-display font-light text-foreground leading-[1.1] tracking-tight"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: 80, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3, ease: [0, 0, 0.2, 1] }}
        className="h-px mx-auto mt-6"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--color-crimson), transparent)',
          opacity: 0.12,
        }}
      />
    </div>
  )
}
