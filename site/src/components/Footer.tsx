import { Instagram, Mail, Music, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/sarau-logo-white.png" alt="Sarau Secreto" className="h-8 opacity-80 mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              O Sarau Secreto é um festival privado que reúne música, poesia, artes visuais e gastronomia em locais revelados apenas 48h antes. Cada edição é uma experiência única.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors p-2 rounded-lg hover:bg-gold-glow">
                <Instagram size={18} />
              </a>
              <a href="mailto:ola@osarausecreto.com"
                className="text-muted-foreground hover:text-gold transition-colors p-2 rounded-lg hover:bg-gold-glow">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-xs font-heading tracking-[0.15em] uppercase text-muted-foreground mb-4">Navegação</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Eventos', href: '#eventos' },
                { label: 'Marketplace', href: '#marketplace' },
                { label: 'Curadoria', href: '#curadoria' },
                { label: 'Espaços Publicitários', href: '#espacos' },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href}
                    className="text-sm text-foreground/70 hover:text-gold transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-heading tracking-[0.15em] uppercase text-muted-foreground mb-4">Info</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-muted-foreground">contato@osarausecreto.com</span></li>
              <li><span className="text-sm text-muted-foreground">Brasília · DF</span></li>
              <li className="pt-2">
                <span className="text-xs text-muted-foreground/60">
                  Feito com <Heart size={10} className="inline text-gold" /> por quem vive a noite.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="gold-line mt-10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} Sarau Secreto. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground/40 flex items-center gap-1">
            <Music size={11} /> Onde a noite vira arte.
          </p>
        </div>
      </div>
    </footer>
  )
}
