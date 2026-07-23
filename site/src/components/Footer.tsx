export function Footer({ onScrollTo }: { onScrollTo?: (id: string) => void }) {
  const handleNav = (label: string) => {
    const id = label === 'O Sarau' ? 'sobre' : label === 'Loja' ? 'loja' : label.toLowerCase();
    if (onScrollTo) { onScrollTo(id); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <footer className="border-t border-border/50 bg-black relative">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-crimson/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <img
              src="/site/sarau-logo-white.png"
              alt="Sarau Secreto"
              className="h-24 w-auto object-contain opacity-60 mb-4"
            />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              A experiência musical mais exclusiva do Brasil. De Brasília para o mundo.
            </p>
          </div>

          {/* Navegar */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Navegar</h4>
            <div className="flex flex-col gap-1.5">
              {['O Sarau', 'Eventos', 'Artistas', 'Loja'].map(item => (
                <button key={item}
                  onClick={() => handleNav(item)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Redes */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Redes</h4>
            <div className="flex flex-col gap-1.5">
              <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-crimson transition-colors">Instagram</a>
              <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-crimson transition-colors">Sympla</a>
              <a href="https://khem.app/sarau" target="_blank" rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-crimson transition-colors">Khem</a>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Contato</h4>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">comercial@sarausecreto.com</span>
              <span className="text-sm text-muted-foreground">curadoria@sarausecreto.com</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground tracking-wider">
            &copy; 2026 Sarau Secreto
          </span>
          <span className="text-xs text-muted-foreground/50 tracking-[0.15em]">
            ONDE A MÚSICA ENCONTRA A ALMA
          </span>
        </div>
      </div>
    </footer>
  )
}
