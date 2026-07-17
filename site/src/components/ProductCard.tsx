import type { Produto } from '@/data/products'
import { ShoppingBag, AlertCircle } from 'lucide-react'

export function ProductCard({ produto, index }: { produto: Produto; index: number }) {
  return (
    <div className={`glass-card p-5 flex flex-col animate-fade-up animate-fade-up-${Math.min(index + 1, 6)}`}>
      {/* Placeholder image */}
      <div className="aspect-[4/3] rounded-lg mb-4 bg-gradient-to-br from-gold/5 via-violet/5 to-background border border-border flex items-center justify-center overflow-hidden">
        {produto.imagem ? (
          <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-4">
            <ShoppingBag size={28} className="text-gold-dim/40 mx-auto mb-2" />
            <span className="text-[0.55rem] tracking-wider uppercase text-muted-foreground/40 block">
              Em breve
            </span>
          </div>
        )}
      </div>

      {!produto.disponivel && (
        <div className="flex items-center gap-1.5 text-[0.6rem] text-warning bg-warning/5 border border-warning/15 rounded px-2 py-1 mb-3">
          <AlertCircle size={11} />
          Esgotado / Indisponível
        </div>
      )}

      <h3 className="text-sm font-display font-light text-foreground mb-1">
        {produto.nome}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">
        {produto.descricao}
      </p>

      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border/50">
        <span className="text-sm font-medium text-gold">{produto.preco}</span>
        <span className="text-[0.55rem] tracking-wider uppercase text-muted-foreground/50 px-2 py-0.5 rounded bg-white/[0.03] border border-border/30">
          {produto.categoria === 'vestuario' ? 'Vestuário' : produto.categoria === 'acessorio' ? 'Acessório' : 'Colecionável'}
        </span>
      </div>
    </div>
  )
}
