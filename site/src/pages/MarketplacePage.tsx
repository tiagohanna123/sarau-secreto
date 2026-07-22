import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeUp, SectionTitle } from '@/components/Shared'

const PRODUCTS = [
  { id: 1, name: 'Camiseta SS Logo', category: 'vestuario', price: 89, sizes: 'P-GG' },
  { id: 2, name: 'Camiseta Arte Exclusiva', category: 'vestuario', price: 99, sizes: 'P-GG' },
  { id: 3, name: 'Moletom Sarau', category: 'vestuario', price: 179, sizes: 'P-3G' },
  { id: 4, name: 'Boné Secreto', category: 'vestuario', price: 69, sizes: 'Único' },
  { id: 5, name: 'Ecobag SS', category: 'acessorios', price: 39, sizes: 'Único' },
  { id: 6, name: 'Caneca Edição', category: 'acessorios', price: 49, sizes: 'Único' },
  { id: 7, name: 'Poster A2', category: 'casa', price: 59, sizes: 'A2' },
  { id: 8, name: 'Adesivo Kit 5un', category: 'casa', price: 19, sizes: '5un' },
  { id: 9, name: 'Vinil Ao Vivo', category: 'midia', price: 129, sizes: 'LP' },
]

const CATEGORIES = [
  { key: 'all', label: 'Todos' },
  { key: 'vestuario', label: 'Vestuário' },
  { key: 'acessorios', label: 'Acessórios' },
  { key: 'casa', label: 'Casa' },
  { key: 'midia', label: 'Mídia' },
]

const CATEGORY_COLORS: Record<string, string> = {
  vestuario: '#dc2626',
  acessorios: '#b91c1c',
  casa: '#7f1d1d',
  midia: '#450a0a',
}

function ProductPlaceholder({ name, category }: { name: string; category: string }) {
  const gradients: Record<string, string> = {
    vestuario: 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 30%, #1a0a0a 60%, #2d1515 100%)',
    acessorios: 'linear-gradient(135deg, #0a0a1a 0%, #15152d 30%, #0a0a1a 60%, #15152d 100%)',
    casa: 'linear-gradient(135deg, #0a1210 0%, #15201a 30%, #0a1210 60%, #15201a 100%)',
    midia: 'linear-gradient(135deg, #120a12 0%, #201520 30%, #120a12 60%, #201520 100%)',
  }
  const patterns: Record<string, string> = {
    vestuario: 'radial-gradient(circle at 30% 40%, rgba(220,38,38,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(127,29,29,0.06) 0%, transparent 40%)',
    acessorios: 'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(139,92,246,0.06) 0%, transparent 40%)',
    casa: 'radial-gradient(circle at 60% 40%, rgba(34,197,94,0.08) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(16,185,129,0.06) 0%, transparent 40%)',
    midia: 'radial-gradient(circle at 40% 30%, rgba(168,85,247,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(236,72,153,0.06) 0%, transparent 40%)',
  }
  const icons: Record<string, string> = {
    vestuario: '◈',
    acessorios: '✦',
    casa: '□',
    midia: '♢',
  }
  return (
    <div className="w-full aspect-[3/4] rounded-xl relative overflow-hidden group"
      style={{ background: gradients[category] || gradients.vestuario }}>
      <div className="absolute inset-0 transition-opacity duration-500"
        style={{ backgroundImage: patterns[category] || patterns.vestuario }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(0deg, rgba(220,38,38,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.2) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-display text-white/[0.04] group-hover:text-white/[0.08] transition-all duration-500 group-hover:scale-110">
          {icons[category] || '◆'}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[0.4rem] text-white/60 block leading-tight line-clamp-2">{name}</span>
      </div>
    </div>
  )
}

export function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory)

  return (
    <section id="loja" className="section relative">
      <div className="max-w-7xl mx-auto px-5">
        <SectionTitle
          label="Marketplace"
          title="Leve o Sarau com Você"
          description="Produtos exclusivos do Sarau Secreto."
        />

        {/* Filters — pill style matching the tag from index.css */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`text-[0.5rem] tracking-[0.15em] uppercase px-4 py-2 rounded-full border transition-all duration-300 ${
                activeCategory === cat.key
                  ? 'border-crimson text-crimson bg-crimson-glow shadow-[0_0_12px_rgba(220,38,38,0.08)]'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-border-hover bg-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="card p-3 group cursor-default hover:border-crimson/20 transition-all duration-300 h-full flex flex-col">
                  <ProductPlaceholder name={product.name} category={product.category} />
                  <div className="mt-2.5 space-y-1 flex-1 flex flex-col">
                    <h3 className="text-xs font-heading text-foreground leading-tight line-clamp-2 min-h-[2rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-lg font-display text-crimson leading-none">
                        R$ {product.price}
                      </span>
                      <span className="tag text-[0.4rem] shrink-0 ml-1">{product.sizes}</span>
                    </div>
                    <span className="text-[0.4rem] tracking-wider uppercase text-muted-foreground/50">
                      {catLabel(product.category)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-[0.65rem] text-muted-foreground mt-8">Nenhum produto nesta categoria.</p>
        )}
      </div>
    </section>
  )
}

function catLabel(key: string): string {
  const found = CATEGORIES.find(c => c.key === key)
  return found ? found.label : key
}
