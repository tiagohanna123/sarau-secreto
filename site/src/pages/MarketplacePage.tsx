import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeUp, SectionTitle } from '@/components/Shared'

const PRODUCT_PHOTOS = [
  'https://gpsbrasilia.com.br/wp-content/uploads/2023/09/Na_Praia_BS_Fotografias_cf08e4034c.jpg',
  'https://images.metroimg.com/2023/09/07175650/Sarau-Secreto-3.jpeg',
  'https://images.metroimg.com/2023/09/07175647/Sarau-Secreto-2.jpeg',
  'https://midias.correiobraziliense.com.br/_midias/jpg/2023/07/05/675x450/1__mg_6785_2-28437321.jpg',
]

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

function ProductPhoto({ name, index }: { name: string; index: number }) {
  const photo = PRODUCT_PHOTOS[index % PRODUCT_PHOTOS.length]
  return (
    <div className="w-full aspect-[3/4] rounded-xl relative overflow-hidden group">
      <img
        src={photo}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-sm text-white/80 block leading-tight line-clamp-2">{name}</span>
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
              className={`text-sm tracking-[0.15em] uppercase px-4 py-2 rounded-full border transition-all duration-300 ${
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
                  <ProductPhoto name={product.name} index={product.id} />
                  <div className="mt-2.5 space-y-1 flex-1 flex flex-col">
                    <h3 className="text-sm font-heading text-foreground leading-tight line-clamp-2 min-h-[2rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-lg font-display text-crimson leading-none">
                        R$ {product.price}
                      </span>
                      <span className="tag shrink-0 ml-1">{product.sizes}</span>
                    </div>
                    <span className="text-sm tracking-wider uppercase text-muted-foreground/50">
                      {catLabel(product.category)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-8">Nenhum produto nesta categoria.</p>
        )}
      </div>
    </section>
  )
}

function catLabel(key: string): string {
  const found = CATEGORIES.find(c => c.key === key)
  return found ? found.label : key
}
