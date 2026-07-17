import { FadeUp, SectionTitle } from '@/components/Shared'

const ADS = [
  { id: 1, name: 'Destaque no Site', price: 400, type: 'Digital', desc: 'Logo + link na página inicial do Sarau.', spots: 6 },
  { id: 2, name: 'Post Patrocinado', price: 800, type: 'Redes', desc: 'Post dedicado no Instagram do Sarau (35k+ seguidores).', spots: 4 },
  { id: 3, name: 'Apoio Cultural', price: 1500, type: 'Presencial', desc: 'Logo no telão + menção em palco + post dedicado.', spots: 3 },
  { id: 4, name: 'Patrocínio Oficial', price: 3000, type: 'Completo', desc: 'Logo em todo material + telão + redes + presença no evento.', spots: 2 },
  { id: 5, name: 'Patrocínio Master', price: 5000, type: 'Master', desc: 'Exclusividade de categoria. Todo o pacote anterior + ativação no local.', spots: 1 },
  { id: 6, name: 'Bar Personalizado', price: 2500, type: 'Experiência', desc: 'Seu produto/serviço como experiência exclusiva durante o evento.', spots: 2 },
]

const AUDIENCE_STATS = [
  { value: '700+', label: 'Público por edição' },
  { value: '25-40', label: 'Faixa etária' },
  { value: '60%', label: 'Público feminino' },
  { value: '85%', label: 'Classe A/B' },
]

export function EspacosPage() {
  return (
    <section id="anuncie" className="section relative">
      <div className="max-w-7xl mx-auto px-5">
        <SectionTitle
          label="Espaços Publicitários"
          title="O Próximo Pode Ser o Seu"
          description="Posicione sua marca no palco do festival cultural mais exclusivo de Brasília."
        />

        {/* Audience stats */}
        <div className="max-w-3xl mx-auto mb-8">
          <FadeUp>
            <div className="card p-6">
              <span className="text-[0.45rem] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Perfil do Público</span>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {AUDIENCE_STATS.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="stat-num text-xl">{stat.value}</div>
                    <p className="text-[0.45rem] text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Ad cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {ADS.map((ad, i) => (
            <FadeUp key={ad.id} delay={i * 0.08}>
              <div className="card p-5 h-full flex flex-col hover:border-crimson/20 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[0.4rem] tracking-[0.2em] uppercase border border-crimson/20 text-crimson px-2 py-0.5 rounded-full">
                    {ad.type}
                  </span>
                  <span className="text-[0.4rem] text-muted-foreground">{ad.spots} vaga{ad.spots > 1 ? 's' : ''}</span>
                </div>
                <h3 className="text-sm font-display text-foreground mb-2 leading-snug">{ad.name}</h3>
                <p className="text-[0.6rem] text-muted-foreground mb-3 flex-1 leading-relaxed">{ad.desc}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                  <span className="text-lg font-display text-crimson group-hover:opacity-80 transition-opacity">
                    R$ {ad.price.toLocaleString('pt-BR')}
                  </span>
                  <span className="tag text-[0.4rem]">{ad.type}</span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Contact CTA */}
        <FadeUp delay={0.5}>
          <div className="max-w-xl mx-auto mt-8 text-center card p-6">
            <span className="text-lg font-display text-crimson">⊡</span>
            <h3 className="text-sm font-heading text-foreground mt-2">Quer anunciar?</h3>
            <p className="text-[0.65rem] text-muted-foreground mt-1 leading-relaxed">
              Entre em contato para criar o pacote ideal para sua marca.
            </p>
            <a href="mailto:comercial@sarausecreto.com"
              className="btn-sympla text-xs mt-4">
              comercial@sarausecreto.com
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
