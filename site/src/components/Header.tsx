<<<<<<< Updated upstream
import { useEffect, useState } from 'react'
=======
import { useEffect, useState, useRef } from 'react'
import { Menu, X, Instagram, Ticket } from 'lucide-react'
>>>>>>> Stashed changes
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'O Sarau', href: 'sobre' },
  { label: 'Eventos', href: 'eventos' },
<<<<<<< Updated upstream
  { label: 'Loja', href: 'loja' },
  { label: 'Artistas', href: 'artistas' },
=======
  { label: 'Artistas', href: 'artistas' },
  { label: 'Marketplace', href: 'marketplace' },
  { label: 'Espacos', href: 'espacos' },
>>>>>>> Stashed changes
]

export function Header({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
<<<<<<< Updated upstream

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const ids = ['hero', ...NAV_ITEMS.map(i => i.href)]
      for (const id of ids.reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 200) {
=======
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = NAV_ITEMS.map(i => i.href).concat('hero')
      for (const id of sections.reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 250) {
>>>>>>> Stashed changes
          setActiveSection(id)
          break
        }
      }
    }
<<<<<<< Updated upstream
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
=======
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Magnetic effect on desktop nav
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const handleMouse = (e: MouseEvent) => {
      const rect = header.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      })
    }
    header.addEventListener('mousemove', handleMouse)
    return () => header.removeEventListener('mousemove', handleMouse)
>>>>>>> Stashed changes
  }, [])

  return (
    <motion.header
<<<<<<< Updated upstream
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
          className="flex items-center gap-3 group">
          <img
            src="./sarau-logo-white.png"
            alt="Sarau Secreto"
            className="h-7 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
          <span className="hidden sm:inline text-[0.5rem] text-muted-foreground tracking-[0.25em] uppercase"
            style={{ opacity: scrolled ? 0.5 : 0.25 }}>
            2026
          </span>
=======
      ref={headerRef}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-2xl border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-18">
        {/* Logo */}
        <button onClick={() => { onScrollTo('hero'); setOpen(false) }}
          className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-[0_0_16px_rgba(201,155,90,0.15)] group-hover:shadow-[0_0_24px_rgba(201,155,90,0.25)] transition-shadow duration-500">
            <span className="text-[0.55rem] font-heading text-background font-bold tracking-wide">SS</span>
          </div>
          <motion.span
            className="hidden sm:inline text-[0.5rem] font-sans text-muted-foreground tracking-[0.3em] uppercase"
            animate={{ opacity: scrolled ? 0.6 : 0.3 }}
          >
            2026
          </motion.span>
>>>>>>> Stashed changes
        </button>

        <nav className="hidden md:flex items-center gap-0.5">
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
<<<<<<< Updated upstream
                  className="absolute inset-0 rounded-lg bg-crimson-subtle border border-crimson-glow"
=======
                  className="absolute inset-0 rounded-lg bg-gold-subtle"
>>>>>>> Stashed changes
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <motion.div
<<<<<<< Updated upstream
                className="absolute -bottom-px left-3 right-3 h-px bg-crimson/20"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
=======
                className="absolute -bottom-px left-3 right-3 h-px bg-gold/40"
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
>>>>>>> Stashed changes
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
            </button>
          ))}
<<<<<<< Updated upstream
          <div className="w-px h-4 bg-border mx-2" />
          <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-crimson transition-colors rounded-lg hover:bg-crimson-subtle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1"/></svg>
          </a>
          <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
            className="ml-1 btn-sympla text-[0.55rem]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
=======
          <div className="w-px h-4 bg-border mx-1.5" />
          <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-gold-subtle">
            <Instagram size={14} />
          </a>
          <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
            className="ml-1 sympla-btn text-[0.55rem] flex items-center gap-1.5">
            <Ticket size={13} />
>>>>>>> Stashed changes
            Ingressos
          </a>
        </nav>

<<<<<<< Updated upstream
        <button onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-crimson-subtle"
          aria-label="Menu">
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
=======
        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)}
          className="md:hidden text-muted-foreground hover:text-foreground p-2 rounded-lg transition-all duration-200 hover:bg-gold-subtle"
          aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
>>>>>>> Stashed changes
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
<<<<<<< Updated upstream
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
=======
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-2xl overflow-hidden"
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
                      ? 'text-gold bg-gold-subtle'
>>>>>>> Stashed changes
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.02]'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
<<<<<<< Updated upstream
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center text-[0.55rem] tracking-wider text-muted-foreground hover:text-crimson px-3 py-2.5 border border-border rounded-lg transition-colors hover:border-crimson/30">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline mr-1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1"/></svg>
                  Instagram
                </a>
                <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center btn-sympla text-[0.55rem] justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                  Ingressos
=======
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center text-[0.55rem] tracking-wider text-muted-foreground hover:text-gold px-3 py-2.5 border border-border rounded-lg transition-colors hover:border-gold/30">
                  <Instagram size={14} className="inline mr-1.5" /> Instagram
                </a>
                <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center sympla-btn text-[0.55rem]">
                  <Ticket size={14} className="inline mr-1.5" /> Ingressos
>>>>>>> Stashed changes
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
