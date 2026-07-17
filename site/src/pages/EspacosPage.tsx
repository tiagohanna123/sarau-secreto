import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/SectionTitle'
import { ScrollReveal } from '@/components/ScrollReveal'
import { AdCard } from '@/components/AdCard'
import { anuncios } from '@/data/ads'
import { Users, TrendingUp, Building2, BarChart3, Mail, Instagram, ArrowUpRight } from 'lucide-react'

const stats = [
  { icon: Users, label: 'Publico', value: '700+' },
  { icon: Building2, label: 'Edicoes 2025', value: '4' },
  { icon: TrendingUp, label: 'Engajamento', value: '92%' },
  { icon: BarChart3, label: 'Cidades', value: '3' },
]

export function EspacosPage() {
  return (
    <section id="espacos" className="section-chapter">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionTitle
          label="Espacos Publicitarios"
          title="Sua Marca no Sarau"
          subtitle="O Sarau Secreto reune um publico seleto de 700+ pessoas por edicao em Brasilia, Rio e Lisboa."
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} mode="scale-in" delay={i * 0.08} margin="-30px">
              <div className="glass-premium p-5 text-center group">
                <stat.icon size={16} className="text-gold-dim mx-auto mb-2 group-hover:text-gold transition-colors duration-300" />
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="stat-num block"
                >
                  {stat.value}
                </motion.span>
                <span className="text-[0.45rem] tracking-wider uppercase text-muted-foreground">{stat.label}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Anuncios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {anuncios.map((anuncio, i) => (
            <AdCard key={anuncio.id} anuncio={anuncio} index={i} />
          ))}
        </div>

        {/* Perfil do publico */}
        <ScrollReveal mode="clip-left" delay={0.2}>
          <div className="glass-premium p-6 sm:p-8">
            <h3 className="text-sm font-display font-light text-foreground mb-5">Perfil do Publico</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground mb-5">
              {[
                { label: 'Faixa Etaria', value: '22-40 anos (85%)' },
                { label: 'Interesses', value: 'Musica, arte, cultura, gastronomia' },
                { label: 'Cidades', value: 'Brasilia · Rio · Lisboa' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                  className="p-3 rounded-xl bg-gold-subtle/50 border border-gold/5"
                >
                  <span className="text-[0.45rem] tracking-[0.2em] uppercase text-gold-dim block mb-1.5">{item.label}</span>
                  <span className="text-xs text-foreground/80">{item.value}</span>
                </motion.div>
              ))}
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4 opacity-50" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interessado em patrocinar ou anunciar? Entre em contato.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <a href="mailto:comercial@osarausecreto.com"
                className="inline-flex items-center gap-1.5 text-xs text-violet hover:text-violet-dim transition-colors group">
                <Mail size={12} className="group-hover:scale-110 transition-transform" />
                comercial@osarausecreto.com
              </a>
              <a href="https://instagram.com/osarausecreto" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-violet hover:text-violet-dim transition-colors group">
                <Instagram size={12} className="group-hover:scale-110 transition-transform" />
                @osarausecreto
                <ArrowUpRight size={10} />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
