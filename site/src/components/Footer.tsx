<<<<<<< Updated upstream
=======
import { motion } from 'framer-motion'
import { Instagram, Mail, Music, ArrowUp } from 'lucide-react'

>>>>>>> Stashed changes
export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
<<<<<<< Updated upstream
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
=======
    <footer className="border-t border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-1"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-[0_0_16px_rgba(201,155,90,0.12)]">
                <span className="text-[0.5rem] font-heading text-background font-bold tracking-wide">SS</span>
              </div>
              <span className="text-[0.5rem] font-sans text-muted-foreground tracking-[0.3em] uppercase">
                Sarau Secreto
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Festival sociocultural nascido em Brasilia em 2022. 25+ artistas por edicao, banda sem ensaio,
              local revelado dias antes. A experiencia musical mais exclusiva do Brasil.
            </p>
            <p className="text-xs text-muted-foreground/50 mt-3">
              Idealizado por Marvyn, JM e Thiago Jamelao.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <a href="https://instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-all p-2.5 rounded-xl hover:bg-gold-subtle border border-transparent hover:border-gold/10">
                <Instagram size={16} />
              </a>
              <a href="mailto:contato@osarausecreto.com"
                className="text-muted-foreground hover:text-gold transition-all p-2.5 rounded-xl hover:bg-gold-subtle border border-transparent hover:border-gold/10">
                <Mail size={16} />
              </a>
            </div>
          </motion.div>

          {/* Navegacao */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <h4 className="text-[0.5rem] tracking-[0.3em] uppercase text-muted-foreground mb-4">Navegacao</h4>
            <ul className="space-y-2">
              {[
                { label: 'O Sarau', href: '#sobre' },
                { label: 'Eventos', href: '#eventos' },
                { label: 'Artistas', href: '#artistas' },
                { label: 'Marketplace', href: '#marketplace' },
                { label: 'Espacos Publicitarios', href: '#espacos' },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href}
                    className="text-sm text-foreground/50 hover:text-gold transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <h4 className="text-[0.5rem] tracking-[0.3em] uppercase text-muted-foreground mb-4">Info</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-muted-foreground/70">contato@osarausecreto.com</span></li>
              <li><span className="text-sm text-muted-foreground/70">@osarausecreto</span></li>
              <li><span className="text-sm text-muted-foreground/70">Brasilia · Rio · Lisboa</span></li>
              <li className="pt-2">
                <a href="https://khem.app/sarau" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-violet hover:text-violet-dim transition-colors inline-flex items-center gap-1">
                  Perfil no Khem
                  <span className="text-[0.6rem]">→</span>
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-10 opacity-50"
        />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} Sarau Secreto.
          </p>
          <p className="text-xs text-muted-foreground/30 flex items-center gap-1.5">
            <Music size={11} /> Brasilia — onde a musica encontra a alma.
          </p>
          <button onClick={scrollToTop}
            className="text-muted-foreground/30 hover:text-gold transition-colors p-1.5 rounded-lg hover:bg-gold-subtle">
            <ArrowUp size={14} />
          </button>
>>>>>>> Stashed changes
        </div>
      </div>
    </footer>
  )
}
