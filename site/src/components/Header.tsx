import { useEffect, useState } from 'react'
import { Menu, X, Instagram, Ticket } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'O Sarau', href: 'sobre' },
  { label: 'Eventos', href: 'eventos' },
  { label: 'Artistas', href: 'artistas' },
  { label: 'Marketplace', href: 'marketplace' },
  { label: 'Espacos', href: 'espacos' },
]

export function Header({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = NAV_ITEMS.map(i => i.href).concat('hero')
      for (const id of sections.reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 250) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-2xl border-b border-[rgba(220,38,38,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-18">
        {/* Logo */}
        <button onClick={() => { onScrollTo('hero'); setOpen(false) }}
          className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crimson to-wine flex items-center justify-center shadow-[0_0_16px_rgba(220,38,38,0.12)] group-hover:shadow-[0_0_24px_rgba(220,38,38,0.2)] transition-shadow duration-500 distressed">
            <span className="text-[0.55rem] font-heading text-foreground font-bold tracking-wide">SS</span>
          </div>
          <motion.span
            className="hidden sm:inline text-[0.5rem] font-sans text-muted-foreground tracking-[0.3em] uppercase"
            animate={{ opacity: scrolled ? 0.5 : 0.25 }}
          >
            2026
          </motion.span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.href}
              onClick={() => onScrollTo(item.href)}
              className="relative px-3 py-2 text-[0.55rem] tracking-[0.2em] uppercase transition-colors duration-300 rounded-lg"
              style={{
                color: activeSection === item.href
                  ? 'var(--color-foreground)'
                  : 'var(--color-muted-foreground)',
              }}
            >
              <span className="relative z-10">{item.label}</span>
              {activeSection === item.href && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg bg-crimson-subtle"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <motion.div
                className="absolute -bottom-px left-3 right-3 h-px bg-crimson/30"
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-1.5" />
          <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-crimson transition-colors rounded-lg hover:bg-crimson-subtle">
            <Instagram size={14} />
          </a>
          <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
            className="ml-1 sympla-btn text-[0.55rem] flex items-center gap-1.5">
            <Ticket size={13} />
            Ingressos
          </a>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)}
          className="md:hidden text-muted-foreground hover:text-foreground p-2 rounded-lg transition-all duration-200 hover:bg-crimson-subtle"
          aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-border bg-black/95 backdrop-blur-2xl overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => { onScrollTo(item.href); setOpen(false) }}
                  className={`px-3 py-3 text-sm text-left rounded-lg transition-colors ${
                    activeSection === item.href
                      ? 'text-crimson bg-crimson-subtle'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.02]'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center text-[0.55rem] tracking-wider text-muted-foreground hover:text-crimson px-3 py-2.5 border border-border rounded-lg transition-colors hover:border-crimson/30">
                  <Instagram size={14} className="inline mr-1.5" /> Instagram
                </a>
                <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center sympla-btn text-[0.55rem]">
                  <Ticket size={14} className="inline mr-1.5" /> Ingressos
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
