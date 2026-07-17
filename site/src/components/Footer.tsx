export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-black">
      <div className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <img
              src="./sarau-logo-white.png"
              alt="Sarau Secreto"
              className="h-10 w-auto opacity-70 mb-4"
            />
            <p className="text-[0.65rem] text-muted-foreground leading-relaxed max-w-[200px]">
              De Brasília para o mundo. A experiência musical mais exclusiva do Brasil.
            </p>
          </div>
          <div>
            <h4 className="text-[0.5rem] tracking-[0.2em] uppercase text-muted-foreground mb-3">Navegar</h4>
            <div className="flex flex-col gap-1.5">
              {['O Sarau', 'Eventos', 'Loja', 'Artistas'].map(item => (
                <button key={item}
                  onClick={() => document.getElementById(item === 'O Sarau' ? 'sobre' : item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-[0.6rem] text-muted-foreground hover:text-foreground transition-colors text-left">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[0.5rem] tracking-[0.2em] uppercase text-muted-foreground mb-3">Redes</h4>
            <div className="flex flex-col gap-1.5">
              <a href="https://www.instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                className="text-[0.6rem] text-muted-foreground hover:text-crimson transition-colors">Instagram</a>
              <a href="https://www.sympla.com.br/produtor/sarausecreto" target="_blank" rel="noopener noreferrer"
                className="text-[0.6rem] text-muted-foreground hover:text-crimson transition-colors">Sympla</a>
              <a href="https://khem.app/sarau" target="_blank" rel="noopener noreferrer"
                className="text-[0.6rem] text-muted-foreground hover:text-crimson transition-colors">Khem</a>
            </div>
          </div>
          <div>
            <h4 className="text-[0.5rem] tracking-[0.2em] uppercase text-muted-foreground mb-3">Contato</h4>
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.6rem] text-muted-foreground">comercial@sarausecreto.com</span>
              <span className="text-[0.6rem] text-muted-foreground">curadoria@sarausecreto.com</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[0.5rem] text-muted-foreground tracking-wider">
            &copy; 2026 Sarau Secreto
          </span>
          <span className="text-[0.45rem] text-muted-foreground/50 tracking-[0.15em]">
            ONDE A MÚSICA ENCONTRA A ALMA
          </span>
        </div>
      </div>
    </footer>
  )
}
