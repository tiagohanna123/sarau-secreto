import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX }}
    />
  )
}

export function SectionTitle({ label, title, description }: { label: string; title: string; description?: string }) {
  return (
    <div className="text-center mb-8 md:mb-10">
      <span className="text-[0.5rem] tracking-[0.25em] uppercase text-crimson-dim font-semibold">{label}</span>
      <h2 className="text-2xl md:text-4xl mt-2 text-foreground">{title}</h2>
      {description && (
        <p className="text-[0.75rem] text-muted-foreground mt-2 max-w-xl mx-auto leading-relaxed">{description}</p>
      )}
      <div className="divider" />
    </div>
  )
}

export function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ParallaxSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}
