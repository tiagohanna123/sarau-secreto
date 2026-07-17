import { ArrowDown, Music, Sparkles, Palette, UtensilsCrossed } from 'lucide-react'
import { SectionTitle } from '@/components/SectionTitle'

const pilares = [
  { icon: Music, titulo: 'Música ao Vivo', desc: 'Jazz, soul, MPB e experimental. Artistas selecionados a dedo para cada edição.' },
  { icon: Sparkles, titulo: 'Poesia & Performance', desc: 'Declamações, slams e performances que transformam a noite em texto vivo.' },
  { icon: Palette, titulo: 'Artes Visuais', desc: 'Instalações site-specific, projeções mapeadas e galerias efêmeras.' },
  { icon: UtensilsCrossed, titulo: 'Gastronomia Afetiva', desc: 'Chefs parceiros criam menus exclusivos para cada encontro.' },
]

export function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute w-[800px] h-[800px] rounded-full bg-violet/4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gold/5 top-[30%] left-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-violet/3 bottom-[25%] right-[55%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="animate-fade-up">
            <span className="text-[0.6rem] tracking-[0.25em] uppercase text-gold font-medium">
              Festival Privado · Desde 2023
            </span>
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-7xl font-display font-light text-foreground leading-[1.1] tracking-tight animate-fade-up animate-fade-up-1">
            Onde a Noite
            <br />
            <span className="text-gold">Vira Arte</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed animate-fade-up animate-fade-up-2">
            Música, poesia, gastronomia e artes visuais em locais secretos revelados apenas 48 horas antes.
            Cada edição é única. Cada noite, um segredo.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 animate-fade-up animate-fade-up-3">
            <a href="#eventos" onClick={(e) => { e.preventDefault(); document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="sympla-btn text-sm">
              Próximos Eventos
            </a>
            <a href="#sobre" onClick={(e) => { e.preventDefault(); document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg border border-border hover:border-gold/30">
              Saber Mais
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown size={18} className="text-muted-foreground/40" />
        </div>
      </section>

      {/* ── Sobre ── */}
      <section id="sobre" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle
            label="Sobre"
            title="O Que é o Sarau Secreto?"
            subtitle="Um festival privado que acontece em locais não revelados até 48h antes. Cada edição tem personalidade própria — curadoria musical, visual, gastronômica e literária feita por um conselho rotativo de artistas."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {pilares.map((p, i) => (
              <div key={p.titulo} className={`glass-card p-6 text-center animate-fade-up animate-fade-up-${Math.min(i + 1, 6)}`}>
                <div className="w-11 h-11 rounded-xl bg-gold-glow border border-gold/15 flex items-center justify-center mx-auto mb-4">
                  <p.icon size={20} className="text-gold" />
                </div>
                <h3 className="text-sm font-display font-light text-foreground mb-2">{p.titulo}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA intermediário ── */}
      <section className="py-16 border-y border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
            Edição limitada · Próximo evento
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-light text-foreground mb-4">
            Sarau Secreto — Edição Inverno
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            15 de agosto de 2026 · Local revelado 48h antes
          </p>
          <a
            href="https://www.sympla.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="sympla-btn text-sm inline-block"
          >
            Garantir Meu Ingresso
          </a>
        </div>
      </section>

      {/* ── Números ── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '12+', label: 'Edições Realizadas' },
              { num: '87', label: 'Artistas Convidados' },
              { num: '5', label: 'Locais Secretos' },
              { num: '2000+', label: 'Participantes' },
            ].map((item, i) => (
              <div key={item.label} className={`text-center animate-fade-up animate-fade-up-${Math.min(i + 1, 6)}`}>
                <span className="text-3xl sm:text-4xl font-display font-light text-gold block">{item.num}</span>
                <span className="text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground mt-1 block">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
