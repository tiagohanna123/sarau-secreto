import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface Artist {
  id: string
  name: string
  genre?: string
  contact?: string
  instagram?: string
  bio?: string
  eventCount: number
  totalAudience: number
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ArtistsPage({ navigate }: { navigate: (path: string) => void }) {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', genre: '', contact: '', instagram: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.artists.list()
      setArtists(data)
    } catch {
      setArtists([])
      toast('API offline', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = artists.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.genre || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const created = await api.artists.create(form)
      setArtists(prev => [...prev, created])
      toast('Artista cadastrado com sucesso!')
    } catch {
      toast('Erro ao salvar artista', 'error')
    } finally {
      setShowForm(false)
      setForm({ name: '', genre: '', contact: '', instagram: '', bio: '' })
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"?`)) return
    try {
      await api.artists.delete(id)
      setArtists(prev => prev.filter(a => a.id !== id))
      toast('Artista removido')
    } catch {
      setArtists(prev => prev.filter(a => a.id !== id))
      toast('Artista removido (offline)', 'info')
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2rem', margin: 0 }}>Artistas</h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', marginTop: '0.25rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Lineup & histórico de participação
        </p>
        <div style={{ height: 1, background: 'linear-gradient(90deg, var(--color-gold), transparent)', opacity: 0.3, marginTop: '0.75rem' }} />
      </div>

      {/* Actions Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          className="input-field"
          placeholder="Buscar por nome ou gênero..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <button className="btn-primary btn-ripple" style={{ marginLeft: 'auto' }} onClick={() => setShowForm(true)}>
          + Novo Artista
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '2rem', width: 440, maxWidth: '90vw' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '1.5rem' }}>Cadastrar Artista</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)', display: 'block', marginBottom: '0.3rem' }}>Nome *</label>
                <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome do artista ou grupo" />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)', display: 'block', marginBottom: '0.3rem' }}>Gênero Musical</label>
                <input className="input-field" value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))} placeholder="Jazz, MPB, Bossa Nova..." />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)', display: 'block', marginBottom: '0.3rem' }}>Contato</label>
                <input className="input-field" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder="email ou telefone" />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)', display: 'block', marginBottom: '0.3rem' }}>Instagram</label>
                <input className="input-field" value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@usuario" />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)', display: 'block', marginBottom: '0.3rem' }}>Bio</label>
                <textarea className="input-field" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Breve descrição do artista..." rows={3} style={{ resize: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artists Grid */}
      {loading ? (
        <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>Carregando...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map(artist => (
            <div key={artist.id} className="section-card" style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => navigate(`artist/${artist.id}`)}
              onKeyDown={e => { if (e.key === 'Enter') navigate(`artist/${artist.id}`) }}
              tabIndex={0}
              role="button"
              aria-label={`Ver detalhes de ${artist.name}`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(artist.id, artist.name) }}
                style={{
                  position: 'absolute', top: 8, right: 8, background: 'none', border: 'none',
                  color: '#6b7280', cursor: 'pointer', fontSize: 16, lineHeight: 1,
                  padding: '2px 6px', borderRadius: 4, transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                title="Excluir"
              >
                ×
              </button>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.15rem', margin: 0 }}>{artist.name}</h3>
                  {artist.genre && <span className="badge-gold" style={{ marginTop: '0.3rem', display: 'inline-block' }}>{artist.genre}</span>}
                </div>
                <div style={{ fontSize: '2rem', opacity: 0.3 }}>🎤</div>
              </div>
              {artist.bio && <p style={{ fontSize: '0.8rem', color: 'var(--color-muted-foreground)', margin: '0.5rem 0' }}>{artist.bio}</p>}
              <div className="gold-line" />
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: 'var(--color-muted-foreground)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Eventos</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-gold)' }}>{artist.eventCount}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-muted-foreground)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Público Total</div>
                  <div style={{ fontWeight: 700, color: 'oklch(0.55 0.22 290)' }}>{artist.totalAudience.toLocaleString('pt-BR')}</div>
                </div>
                {artist.instagram && (
                  <div>
                    <div style={{ color: 'var(--color-muted-foreground)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Instagram</div>
                    <div style={{ fontWeight: 500 }}>{artist.instagram}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Nenhum artista encontrado para "{search}"
        </div>
      )}
    </div>
  )
}
