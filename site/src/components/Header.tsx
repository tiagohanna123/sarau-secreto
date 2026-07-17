import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Início', href: '/' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Curadoria', href: '/curadoria' },
  { label: 'Espaços', href: '/espacos' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  const scrollTo = (href: string) => {
    setOpen(false)
    if (href === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(href.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-b border-border" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="flex items-center gap-3 group">
          <img src="/sarau-logo-white.png" alt="Sarau Secreto" className="h-8 opacity-90 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => { e.preventDefault(); scrollTo(item.href) }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/[0.04]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#eventos"
            onClick={(e) => { e.preventDefault(); scrollTo('/eventos') }}
            className="ml-3 sympla-btn text-sm"
          >
            Garantir Ingresso
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-muted-foreground hover:text-foreground p-2 transition-colors"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollTo(item.href) }}
                className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#eventos"
              onClick={(e) => { e.preventDefault(); scrollTo('/eventos'); }}
              className="mt-2 sympla-btn text-sm text-center"
            >
              Garantir Ingresso
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
