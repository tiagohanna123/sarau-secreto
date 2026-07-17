import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionTitle, ScrollReveal } from '@/components/ScrollReveal'
import { ProductCard } from '@/components/ProductCard'
import { produtos } from '@/data/products'
import { Package, Shirt, Watch, Album } from 'lucide-react'

const categorias = [
  { key: 'todos', label: 'Todos', icon: Package },
  { key: 'vestuario', label: 'Vestuário', icon: Shirt },
  { key: 'acessorio', label: 'Acessórios', icon: Watch },
  { key: 'colecionavel', label: 'Colecionáveis', icon: Album },
]

export function MarketplacePage() {
  const [filtro, setFiltro] = useState('todos')
  const filtrados = filtro === 'todos'
    ? produtos
    : produtos.filter(p => p.categoria === filtro)

  return (
    <section id="marketplace" className="section-chapter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionTitle
          label="Marketplace"
          title="Leve o Sarau com Você"
          subtitle="Camisetas, moletons, bonés e edições limitadas. Produtos em desenvolvimento — cadastre seu interesse."
        />

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categorias.map(cat => (
            <motion.button
              key={cat.key}
              onClick={() => setFiltro(cat.key)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`tag-filter flex items-center gap-1.5 ${filtro === cat.key ? 'active' : ''}`}
            >
              <cat.icon size={12} />
              {cat.label}
            </motion.button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtrados.map((produto, i) => (
              <motion.div
                key={produto.id}
                layout
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ duration: 0.4, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard produto={produto} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <ScrollReveal mode="scale-in" delay={0.15} className="mt-12">
          <div className="glass-premium p-6 text-center max-w-md mx-auto">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Produtos em fase de produção. Quer ser avisado quando lançar?
            </p>
            <a href="mailto:marketplace@osarausecreto.com"
              className="inline-block mt-3 text-xs text-crimson hover:text-crimson-dim transition-colors tracking-wide hover:underline underline-offset-4">
              marketplace@osarausecreto.com
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
