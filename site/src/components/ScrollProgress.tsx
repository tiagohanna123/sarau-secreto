import { motion, useScroll, useTransform } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.03, 0.97, 1], [0, 0.5, 0.5, 0])

  return (
    <>
      <motion.div
        className="scroll-progress"
        style={{ scaleX, opacity }}
      />
      {/* Side progress line */}
      <motion.div
        style={{
          position: 'fixed',
          right: 14,
          top: 0,
          bottom: 0,
          width: 1,
          zIndex: 100,
          background: 'linear-gradient(to bottom, transparent, var(--color-crimson), transparent)',
          opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 0.08, 0.08, 0]),
          scaleY: scrollYProgress,
          transformOrigin: '0 0',
        }}
      />
      {/* Left side accent line */}
      <motion.div
        style={{
          position: 'fixed',
          left: 14,
          top: 0,
          bottom: 0,
          width: 1,
          zIndex: 100,
          background: 'linear-gradient(to bottom, transparent, var(--color-crimson), transparent)',
          opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 0.04, 0.04, 0]),
          scaleY: scrollYProgress,
          transformOrigin: '0 0',
        }}
      />
    </>
  )
}
