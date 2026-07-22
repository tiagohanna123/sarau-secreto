export function Footer({ onScrollTo }: { onScrollTo?: (id: string) => void }) {
  const handleNav = (label: string) => {
    const id = label === 'O Sarau' ? 'sobre' : label === 'Loja' ? 'loja' : label === 'Anuncie' ? 'anuncie' : label.toLowerCase();
    if (onScrollTo) { onScrollTo(id); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <footer className="border-t border-border/50 bg-black">
      <div className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="ss-emblem"><span>SS</span></div>
              <span className="text-xs tracking-[0.25em] uppercase text-muted-foreground">2026</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              A experiência musical mais exclusiva do Brasil. De Brasília para o mundo.
            </p>
          </div>
          <div>
            <h4 className="text-[0.55rem] tracking-[0.2em] uppercase text-muted-foreground mb-3">Navegar</h4>
            <div className="flex flex-col gap-1.5">
              {['O Sarau', 'Eventos', 'Artistas', 'Loja', 'Anuncie'].map(item => (
                <button key={item}
                  onClick={() => handleNav(item)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[0.55rem] tracking-[0.2em] uppercase text-muted-foreground mb-3">Redes</h4>
            <div className="flex flex-col gap-1.5">
              <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-crimson transition-colors">Instagram</a>
              <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-crimson transition-colors">Sympla</a>
              <a href="https://khem.app/sarau" target="_blank" rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-crimson transition-colors">Khem</a>
            </div>
          </div>
          <div>
            <h4 className="text-[0.55rem] tracking-[0.2em] uppercase text-muted-foreground mb-3">Contato</h4>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">comercial@sarausecreto.com</span>
              <span className="text-xs text-muted-foreground">curadoria@sarausecreto.com</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[0.55rem] text-muted-foreground tracking-wider">
            &copy; 2026 Sarau Secreto
          </span>
          <span className="text-[0.5rem] text-muted-foreground/50 tracking-[0.15em]">
            ONDE A MÚSICA ENCONTRA A ALMA
          </span>
        </div>
      </div>
    </footer>
  )
}
