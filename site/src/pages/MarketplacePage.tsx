import { SectionTitle } from '@/components/SectionTitle'
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
  return (
    <section id="marketplace" className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionTitle
          label="Marketplace"
          title="Leve a Noite com Você"
          subtitle="Camisetas, moletons, acessórios e edições limitadas. Cada peça carrega a identidade do Sarau Secreto."
        />

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categorias.map(cat => (
            <button
              key={cat.key}
              className="flex items-center gap-1.5 text-[0.6rem] tracking-wider uppercase px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-gold/30 hover:bg-gold-glow transition-all"
            >
              <cat.icon size={12} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {produtos.map((produto, i) => (
            <ProductCard key={produto.id} produto={produto} index={i} />
          ))}
        </div>

        {/* Placeholder note */}
        <div className="mt-12 text-center">
          <div className="glass-card p-6 inline-block mx-auto">
            <p className="text-xs text-muted-foreground">
              Imagens dos produtos em produção. Fotos reais serão adicionadas em breve.
            </p>
            <p className="text-[0.55rem] tracking-wider uppercase text-gold-dim mt-2">
              Interessado? Fale conosco para encomendar
            </p>
            <a
              href="mailto:marketplace@osarausecreto.com"
              className="inline-block mt-3 text-xs text-violet hover:text-violet-dim transition-colors"
            >
              marketplace@osarausecreto.com
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
