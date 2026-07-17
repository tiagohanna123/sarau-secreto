import { motion } from 'framer-motion'
import { Instagram, Mail, Music, ArrowUp } from 'lucide-react'

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
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
              <div className="ss-logo w-8 h-8 rounded-full bg-gradient-to-br from-crimson to-wine flex items-center justify-center shadow-[0_0_16px_rgba(220,38,38,0.12)] distressed">
                <span className="text-[0.5rem] font-heading text-foreground font-bold tracking-wide">SS</span>
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
                className="text-muted-foreground hover:text-crimson transition-all p-2.5 rounded-xl hover:bg-crimson-subtle border border-transparent hover:border-crimson/10">
                <Instagram size={16} />
              </a>
              <a href="mailto:contato@osarausecreto.com"
                className="text-muted-foreground hover:text-crimson transition-all p-2.5 rounded-xl hover:bg-crimson-subtle border border-transparent hover:border-crimson/10">
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
                    className="text-sm text-foreground/50 hover:text-crimson transition-colors duration-300">
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
                  className="text-xs text-crimson hover:text-crimson-dim transition-colors inline-flex items-center gap-1">
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
            className="text-muted-foreground/30 hover:text-crimson transition-colors p-1.5 rounded-lg hover:bg-crimson-subtle">
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  )
}
