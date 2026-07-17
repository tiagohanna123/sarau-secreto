import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

type RevealMode = 'fade-up' | 'clip-left' | 'clip-right' | 'scale-in' | 'perspective'

interface ScrollRevealProps {
  children: React.ReactNode
  mode?: RevealMode
  delay?: number
  className?: string
  once?: boolean
  margin?: string
}

const modeVariants: Record<RevealMode, object> = {
  'fade-up': {
    initial: { opacity: 0, y: 40 },
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
    initial: { opacity: 0, scale: 0.92 },
    whileInView: { opacity: 1, scale: 1 },
  },
  'perspective': {
    initial: { opacity: 0, rotateX: 8, y: 30 },
    whileInView: { opacity: 1, rotateX: 0, y: 0 },
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
      whileInView={{ ...(base as any).whileInView, transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] } }}
      viewport={{ once, margin }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Magnetic hover button ─── */
export function MagneticButton({
  children,
  className = '',
  as = 'button',
  href,
  target,
  rel,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
  onClick?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) * 0.15
      const y = (e.clientY - rect.top - rect.height / 2) * 0.15
      setPos({ x, y })
    }
    const onLeave = () => setPos({ x: 0, y: 0 })
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const Tag = as as any

  return (
    <div ref={ref} style={{ display: 'inline-block' }}>
      <Tag
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={className}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {children}
      </Tag>
    </div>
  )
}

/* ─── Parallax layer ─── */
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
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100])
  const springY = useSpring(y, { stiffness: 80, damping: 25 })

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
