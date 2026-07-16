import { cn } from '@/lib/cn'
import {
  SarauButton,
  SarauSection,
  SarauKPI,
  SarauBadge,
  PageHeader,
  EmptyState,
  SarauTable,
} from '@/lib/design-system'

/* ─── Types ─── */

export interface ArtistEvent {
  id: string
  title: string
  date: string
  ticketsSold: number
  ticketRevenue: number
  checkedIn: number
}

export interface ArtistDetail {
  id: string
  name: string
  genre?: string
  contact?: string
  instagram?: string
  bio?: string
  eventCount: number
  totalAudience: number
  totalTicketRevenue: number
  events: ArtistEvent[]
}

/* ─── Helpers ─── */

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ]
  const dia = String(d.getDate()).padStart(2, '0')
  return `${dia} ${meses[d.getMonth()]}/${d.getFullYear()}`
}

const navigateTo = (hash: string) => {
  window.location.hash = hash
}

/* ─── Component ─── */

export function ArtistDetailPage({
  artist,
  onBack,
}: {
  artist: ArtistDetail
  onBack: () => void
}) {
  const avgAudience =
    artist.eventCount > 0
      ? Math.round(artist.totalAudience / artist.eventCount)
      : 0

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* ─── Back Button ─── */}
      <div className="mb-4">
        <SarauButton variant="ghost" size="sm" onClick={onBack}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </SarauButton>
      </div>

      {/* ─── Page Header ─── */}
      <PageHeader
        title={artist.name}
        subtitle={artist.genre ? `Gênero: ${artist.genre}` : undefined}
      />

      {/* ─── Bio ─── */}
      {artist.bio && (
        <p
          className="text-sm text-[var(--color-muted-foreground)] leading-relaxed mb-6 max-w-[700px]"
          style={{ opacity: 0.85 }}
        >
          {artist.bio}
        </p>
      )}

      {/* ─── Genre Badge inline ─── */}
      {artist.genre && (
        <SarauBadge variant="gold" className="mb-6">
          {artist.genre}
        </SarauBadge>
      )}

      {/* ─── KPI Cards ─── */}
      <div
        className="grid gap-4 mb-8"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <SarauKPI label="Eventos" value={String(artist.eventCount)} />
        <SarauKPI
          label="Público Total"
          value={artist.totalAudience.toLocaleString('pt-BR')}
        />
        <SarauKPI label="Receita Total" value={fmtBRL(artist.totalTicketRevenue)} />
        <SarauKPI
          label="Média de Público"
          value={avgAudience.toLocaleString('pt-BR')}
          sub="por evento"
        />
      </div>

      {/* ─── Eventos com Ingressos ─── */}
      <SarauSection title="Eventos com Ingressos" className="mb-6">
        {artist.events.length === 0 ? (
          <EmptyState
            title="Nenhum evento encontrado"
            description="Este artista ainda não possui eventos registrados."
          />
        ) : (
          <SarauTable>
            <thead>
              <tr className="data-table-header">
                <th>Título</th>
                <th>Data</th>
                <th className="text-right">Ingressos Vendidos</th>
                <th className="text-right">Receita</th>
                <th className="text-right">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {artist.events.map((evt) => (
                <tr
                  key={evt.id}
                  className="data-table-row cursor-pointer"
                  onClick={() => navigateTo(`event/${evt.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigateTo(`event/${evt.id}`)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver evento ${evt.title}`}
                >
                  <td className="font-medium">{evt.title}</td>
                  <td className="text-muted-foreground">{fmtDate(evt.date)}</td>
                  <td className="text-right">{evt.ticketsSold.toLocaleString('pt-BR')}</td>
                  <td className="text-right font-medium text-gold">
                    {fmtBRL(evt.ticketRevenue)}
                  </td>
                  <td className="text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        evt.checkedIn === evt.ticketsSold
                          ? 'text-success'
                          : 'text-muted-foreground'
                      )}
                    >
                      {evt.checkedIn.toLocaleString('pt-BR')}
                      {evt.ticketsSold > 0 && (
                        <span className="text-[10px] opacity-60">
                          ({Math.round((evt.checkedIn / evt.ticketsSold) * 100)}%)
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </SarauTable>
        )}
      </SarauSection>

      {/* ─── Informações de Contato ─── */}
      {(artist.instagram || artist.contact) && (
        <SarauSection title="Informações de Contato" className="mb-6">
          <div className="flex flex-col gap-3">
            {artist.instagram && (
              <div className="flex items-center gap-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground shrink-0"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <a
                  href={`https://instagram.com/${artist.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gold hover:underline"
                >
                  {artist.instagram}
                </a>
              </div>
            )}
            {artist.contact && (
              <div className="flex items-center gap-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground shrink-0"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="text-sm text-foreground">{artist.contact}</span>
              </div>
            )}
          </div>
        </SarauSection>
      )}
    </div>
  )
}
