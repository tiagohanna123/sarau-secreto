import { motion } from 'framer-motion'

const ADS = [
  {
    id: 'dona-santa',
    brand: 'Dona Santa',
    tagline: 'Cerveja Artesanal de Brasília',
    category: 'Bebidas',
    cta: 'Conhecer',
    bg: 'linear-gradient(135deg, #1a0a0a, #2d1515, #1a0a0a)',
    accent: '#dc2626',
    logo: 'DS',
    position: 'hero' as const,
  },
  {
    id: 'bsb-moto',
    brand: 'Brasília Moto Club',
    tagline: 'Duas Rodas, Uma Tribo',
    category: 'Estilo de Vida',
    cta: 'Fazer Parte',
    bg: 'linear-gradient(135deg, #0a0a1a, #15152d, #0a0a1a)',
    accent: '#6366f1',
    logo: 'BMC',
    position: 'middle' as const,
  },
  {
    id: 'casa-pedra',
    brand: 'Casa de Pedra',
    tagline: 'Gastronomia Afetiva no Plano Piloto',
    category: 'Gastronomia',
    cta: 'Reservar',
    bg: 'linear-gradient(135deg, #0a1210, #15201a, #0a1210)',
    accent: '#22c55e',
    logo: 'CP',
    position: 'middle' as const,
  },
  {
    id: 'mestre-cuca',
    brand: 'Mestre Cuca',
    tagline: 'Culinária que Aquece a Alma',
    category: 'Delivery',
    cta: 'Pedir',
    bg: 'linear-gradient(135deg, #120a0a, #201515, #120a0a)',
    accent: '#f59e0b',
    logo: 'MC',
    position: 'footer' as const,
  },
  {
    id: 'violeta-cos',
    brand: 'Violeta Cosméticos',
    tagline: 'Beleza com Consciência',
    category: 'Cosméticos',
    cta: 'Ver Linha',
    bg: 'linear-gradient(135deg, #100a12, #1a1520, #100a12)',
    accent: '#a855f7',
    logo: 'VC',
    position: 'sidebar' as const,
  },
]

export function AdBannerHero() {
  const ad = ADS.find(a => a.position === 'hero')
  if (!ad) return null
  return <AdCard ad={ad} variant="hero" />
}

export function AdBannerMiddle({ index = 0 }: { index?: number }) {
  const middleAds = ADS.filter(a => a.position === 'middle')
  const ad = middleAds[index % middleAds.length]
  if (!ad) return null
  return <AdCard ad={ad} variant={index % 2 === 0 ? 'horizontal' : 'vertical'} />
}

export function AdBannerFooter() {
  const ad = ADS.find(a => a.position === 'footer')
  if (!ad) return null
  return <AdCard ad={ad} variant="horizontal" />
}

export function AdBannerSidebar() {
  const ad = ADS.find(a => a.position === 'sidebar')
  if (!ad) return null
  return <AdCard ad={ad} variant="sidebar" />
}

function AdCard({ ad, variant }: { ad: typeof ADS[0]; variant: 'hero' | 'horizontal' | 'vertical' | 'sidebar' }) {
  if (variant === 'hero') {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        className="relative overflow-hidden w-full"
        style={{ height: '180px' }}
      >
        <a href="#" className="block w-full h-full relative group cursor-pointer"
          onClick={(e) => e.preventDefault()}
          style={{ background: ad.bg }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, ${ad.accent}, transparent 50%)`,
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-4 md:gap-8 opacity-50 group-hover:opacity-80 transition-all duration-700">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl border border-white/10 flex items-center justify-center bg-white/[0.03] group-hover:bg-white/[0.06] transition-all duration-500 group-hover:scale-105"
                style={{ borderColor: `${ad.accent}20` }}>
                <span className="text-lg md:text-2xl font-display" style={{ color: ad.accent }}>{ad.logo}</span>
              </div>
              <div className="text-center">
                <span className="text-[0.4rem] tracking-[0.25em] uppercase text-white/20 block mb-1">{ad.category}</span>
                <span className="text-xl md:text-3xl font-display text-white/60 group-hover:text-white/80 transition-colors duration-500 block leading-tight">{ad.brand}</span>
                <span className="text-[0.55rem] text-white/30 block mt-0.5">{ad.tagline}</span>
              </div>
              <span className="text-[0.45rem] tracking-[0.2em] uppercase px-4 py-2 rounded-full border border-white/10 text-white/30 group-hover:text-white/50 group-hover:border-white/20 transition-all duration-500 hidden md:inline">
                {ad.cta} →
              </span>
            </div>
          </div>
          <div className="absolute bottom-3 right-4 text-[0.35rem] tracking-[0.2em] uppercase text-white/10">Publicidade</div>
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ad.accent}15, transparent)` }} />
        </a>
      </motion.section>
    )
  }

  if (variant === 'vertical') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="hidden lg:block relative overflow-hidden rounded-xl group cursor-default"
        style={{
          background: ad.bg,
          minHeight: '320px',
          border: `1px solid ${ad.accent}08`,
        }}
      >
        <a href="#" className="block w-full h-full p-5 flex flex-col items-center justify-center text-center"
          onClick={(e) => e.preventDefault()}>
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at 50% 30%, ${ad.accent}, transparent 60%)`,
          }} />
          <div className="w-16 h-16 rounded-2xl border border-white/5 flex items-center justify-center mb-3 bg-white/[0.02] group-hover:bg-white/[0.04] transition-all duration-500"
            style={{ borderColor: `${ad.accent}15` }}>
            <span className="text-xl font-display" style={{ color: ad.accent }}>{ad.logo}</span>
          </div>
          <span className="text-[0.35rem] tracking-[0.25em] uppercase text-white/15 block mb-1.5">{ad.category}</span>
          <span className="text-base font-display text-white/50 group-hover:text-white/70 transition-colors duration-500 block leading-tight">{ad.brand}</span>
          <span className="text-[0.5rem] text-white/25 block mt-1 leading-relaxed max-w-[160px]">{ad.tagline}</span>
          <span className="text-[0.4rem] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border border-white/10 text-white/25 mt-4 group-hover:text-white/40 group-hover:border-white/20 transition-all duration-500">
            {ad.cta} →
          </span>
          <div className="absolute bottom-2 text-[0.3rem] tracking-[0.2em] uppercase text-white/8">Publicidade</div>
        </a>
      </motion.div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <motion.a href="#"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="block relative overflow-hidden rounded-xl group cursor-pointer"
        onClick={(e) => e.preventDefault()}
        style={{
          background: ad.bg,
          border: `1px solid ${ad.accent}08`,
        }}>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${ad.accent}, transparent 60%)`,
        }} />
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center flex-shrink-0 bg-white/[0.02]"
            style={{ borderColor: `${ad.accent}15` }}>
            <span className="text-sm font-display" style={{ color: ad.accent }}>{ad.logo}</span>
          </div>
          <div className="min-w-0">
            <span className="text-[0.35rem] tracking-[0.2em] uppercase text-white/15 block">{ad.category}</span>
            <span className="text-[0.6rem] font-display text-white/50 group-hover:text-white/70 transition-colors block truncate">{ad.brand}</span>
          </div>
        </div>
      </motion.a>
    )
  }

  // horizontal / middle banner
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      className="relative overflow-hidden w-full rounded-xl group"
      style={{
        background: ad.bg,
        border: `1px solid ${ad.accent}08`,
        minHeight: '140px',
      }}
    >
      <a href="#" className="block w-full h-full relative cursor-pointer"
        onClick={(e) => e.preventDefault()}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 40% 50%, ${ad.accent}, transparent 50%)`,
        }} />
        <div className="relative z-10 w-full h-full flex items-center px-5 md:px-8">
          <div className="flex items-center gap-3 md:gap-6 w-full justify-between">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl border border-white/5 flex items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.04] transition-all duration-500 group-hover:scale-105"
                style={{ borderColor: `${ad.accent}15` }}>
                <span className="text-sm md:text-xl font-display" style={{ color: ad.accent }}>{ad.logo}</span>
              </div>
              <div>
                <span className="text-[0.35rem] tracking-[0.25em] uppercase text-white/15 block mb-0.5">{ad.category}</span>
                <span className="text-sm md:text-lg font-display text-white/50 group-hover:text-white/70 transition-colors duration-500 block leading-tight">{ad.brand}</span>
                <span className="text-[0.45rem] text-white/25 block mt-0.5 hidden sm:block">{ad.tagline}</span>
              </div>
            </div>
            <span className="text-[0.4rem] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border border-white/10 text-white/25 group-hover:text-white/40 group-hover:border-white/20 transition-all duration-500 flex-shrink-0">
              {ad.cta} →
            </span>
          </div>
        </div>
        <div className="absolute bottom-2 right-3 text-[0.3rem] tracking-[0.2em] uppercase text-white/8">Publicidade</div>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ad.accent}10, transparent)` }} />
      </a>
    </motion.section>
  )
}
