export function SectionTitle({ number, label, title, subtitle }: {
  number?: string
  label: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="text-center mb-12 sm:mb-16">
      {number && (
        <span className="text-[0.6rem] tracking-[0.25em] uppercase text-gold font-medium">
          {number}
        </span>
      )}
      {label && (
        <span className="block text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-2">
          {label}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-light text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="gold-line max-w-[60px] mx-auto mt-5" />
    </div>
  )
}
