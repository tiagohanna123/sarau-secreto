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

function ProductPlaceholder({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div className="w-full aspect-[3/4] rounded-xl relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(220,38,38,0.06), rgba(127,29,29,0.1))`,
      }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-display text-crimson/10">{initials}</span>
      </div>
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(220,38,38,0.03), transparent 70%)',
      }} />
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

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`text-[0.5rem] tracking-[0.15em] uppercase px-4 py-2 rounded-full border transition-all duration-300 ${
                activeCategory === cat.key
                  ? 'border-crimson text-crimson bg-crimson-glow'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-border-hover'
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
                <div className="card p-3 group cursor-default hover:border-crimson/20 transition-all">
                  <ProductPlaceholder name={product.name} />
                  <div className="mt-2.5 space-y-0.5">
                    <h3 className="text-[0.6rem] font-heading text-foreground leading-tight">{product.name}</h3>
                    <p className="text-[0.45rem] text-muted-foreground">{product.sizes}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm font-display text-crimson">R$ {product.price}</span>
                      <span className="tag text-[0.35rem]">{CATEGORY_COLORS[product.category]}</span>
                    </div>
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
