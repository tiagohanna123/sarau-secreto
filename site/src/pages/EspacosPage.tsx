import { SectionTitle } from '@/components/SectionTitle'
import { AdCard } from '@/components/AdCard'
import { anuncios } from '@/data/ads'
import { Building2, TrendingUp, Users, BarChart3 } from 'lucide-react'

export function EspacosPage() {
  return (
    <section id="espacos" className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SectionTitle
          label="Espaços Publicitários"
          title="Sua Marca no Sarau"
          subtitle="O Sarau Secreto reúne um público seleto de +200 pessoas por edição. Marque presença onde a noite vira arte."
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Users, label: 'Público por Edição', value: '200+' },
            { icon: TrendingUp, label: 'Taxa de Engajamento', value: '94%' },
            { icon: Building2, label: 'Edições por Ano', value: '4' },
            { icon: BarChart3, label: 'Retorno Médio', value: '3.2x' },
          ].map((stat, i) => (
            <div key={stat.label} className={`glass-card p-4 text-center animate-fade-up animate-fade-up-${Math.min(i + 1, 6)}`}>
              <stat.icon size={16} className="text-gold-dim mx-auto mb-2" />
              <span className="text-lg font-display font-light text-gold block">{stat.value}</span>
              <span className="text-[0.5rem] tracking-wider uppercase text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Anúncios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {anuncios.map((anuncio, i) => (
            <AdCard key={anuncio.id} anuncio={anuncio} index={i} />
          ))}
        </div>

        {/* Perfil do público */}
        <div className="glass-card p-6 sm:p-8">
          <h3 className="text-sm font-display font-light text-foreground mb-4">Perfil do Público</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="text-xs tracking-wider uppercase text-gold-dim block mb-1">Faixa Etária</span>
              25-45 anos (80%)
            </div>
            <div>
              <span className="text-xs tracking-wider uppercase text-gold-dim block mb-1">Poder Aquisitivo</span>
              Classes A e B
            </div>
            <div>
              <span className="text-xs tracking-wider uppercase text-gold-dim block mb-1">Interesses</span>
              Música, arte, gastronomia, cultura
            </div>
          </div>
          <div className="gold-line my-4" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Interessado em patrocinar ou anunciar? Entre em contato pelo email comercial e montamos uma proposta personalizada para sua marca.
          </p>
          <a
            href="mailto:comercial@osarausecreto.com"
            className="inline-block mt-4 text-xs text-violet hover:text-violet-dim transition-colors"
          >
            comercial@osarausecreto.com
          </a>
        </div>
      </div>
    </section>
  )
}
