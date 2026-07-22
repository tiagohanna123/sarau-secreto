import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'O Sarau', href: 'sobre' },
  { label: 'Eventos', href: 'eventos' },
  { label: 'Artistas', href: 'artistas' },
  { label: 'Loja', href: 'loja' },
]

export function Header({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const ids = ['hero', ...NAV_ITEMS.map(i => i.href)]
      for (const id of ids.reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-crimson-glow'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">
        <button onClick={() => { onScrollTo('hero'); setOpen(false) }}
          className="flex items-center gap-2.5 group">
          <img
            src="/site/sarau-logo-white.png"
            alt="Sarau Secreto"
            className="h-7 w-auto object-contain opacity-60 hidden sm:block"
          />
          <span className="hidden sm:inline text-[0.8rem] text-muted-foreground tracking-[0.25em] uppercase"
            style={{ opacity: scrolled ? 0.5 : 0.25 }}>
            2026
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.href}
              onClick={() => onScrollTo(item.href)}
              className="relative px-3 py-2 text-[0.7rem] tracking-[0.2em] uppercase transition-colors duration-300 rounded-lg"
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
                  className="absolute inset-0 rounded-lg bg-crimson-subtle border border-crimson-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <motion.div
                className="absolute -bottom-px left-3 right-3 h-px bg-crimson/20"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-2" />
          <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-crimson transition-colors rounded-lg hover:bg-crimson-subtle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1"/></svg>
          </a>
          <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
            className="ml-1 btn-sympla text-[0.7rem]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Ingressos
          </a>
        </nav>

        <button onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-crimson-subtle"
          aria-label="Menu">
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-border bg-black/90 overflow-hidden"
          >
            <nav className="px-5 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
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
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center text-[0.7rem] tracking-wider text-muted-foreground hover:text-crimson px-3 py-2.5 border border-border rounded-lg transition-colors hover:border-crimson/30">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline mr-1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1"/></svg>
                  Instagram
                </a>
                <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center btn-sympla text-[0.7rem] justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                  Ingressos
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
