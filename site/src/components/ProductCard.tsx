import { motion } from 'framer-motion'
import type { Produto } from '@/data/products'
import { ShoppingBag, AlertCircle } from 'lucide-react'

export function ProductCard({ produto, index }: { produto: Produto; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="glass-premium p-4 flex flex-col group relative overflow-hidden"
    >
      {/* Image placeholder */}
      <div className="aspect-[4/3] rounded-xl mb-4 art-placeholder border border-border/50 flex items-center justify-center overflow-hidden group-hover:border-crimson/15 transition-colors duration-500">
        {produto.imagem ? (
          <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-4 relative z-10">
            <ShoppingBag size={24} className="text-crimson-dim/20 mx-auto mb-1.5 group-hover:text-crimson-dim/40 transition-colors duration-500" />
            <span className="text-[0.45rem] tracking-wider uppercase text-muted-foreground/20 block">
              Em breve
            </span>
          </div>
        )}
      </div>

      {!produto.disponivel && (
        <div className="flex items-center gap-1.5 text-[0.5rem] text-warning bg-warning/5 border border-warning/15 rounded-full px-2.5 py-1 mb-3 w-fit">
          <AlertCircle size={10} />
          Indisponível
        </div>
      )}

      <h3 className="text-sm font-display font-light text-foreground mb-1 group-hover:text-crimson transition-colors duration-300">
        {produto.nome}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">
        {produto.descricao}
      </p>

      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border/20">
        <span className="text-sm font-medium text-crimson tracking-wide">{produto.preco}</span>
        <span className="text-[0.45rem] tracking-wider uppercase text-muted-foreground/40 px-2 py-0.5 rounded-full bg-white/[0.02] border border-border/20">
          {produto.categoria === 'vestuario' ? 'Vestuário' : produto.categoria === 'acessorio' ? 'Acessório' : 'Colecionável'}
        </span>
      </div>
    </motion.div>
  )
}
