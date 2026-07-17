import { motion } from 'framer-motion'

export function SectionTitle({
  label,
  title,
  subtitle,
  mode = 'default',
}: {
  label?: string
  title: string
  subtitle?: string
  mode?: 'default' | 'minimal' | 'cinematic'
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
        className={`text-2xl sm:text-3xl lg:text-4xl font-display font-light text-foreground leading-[1.1] tracking-tight ${
          mode === 'cinematic' ? 'sm:text-4xl lg:text-5xl' : ''
        }`}
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
          opacity: 0.15,
        }}
      />
    </div>
  )
}
