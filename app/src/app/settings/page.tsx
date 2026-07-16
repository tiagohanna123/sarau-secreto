import { useState, useEffect } from 'react'
import { getLLMConfig, setLLMConfig, clearMemory } from '@/lib/chat-memory'

// Build info: extrair do package.json ou usar fallback
const BUILD_DATE = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
const VERSION = '1.0.0'
const STACK = ['React 19', 'Vite', 'Tailwind v4', 'Recharts'].join(' · ')

function getProfileName() {
  return localStorage.getItem('user_profile_name') || 'Usuário'
}
function setProfileName(name: string) {
  localStorage.setItem('user_profile_name', name)
}

export function SettingsPage({ navigate }: { navigate: (path: string) => void }) {
  const [profileName, setProfileName] = useState(getProfileName())
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    const cfg = getLLMConfig()
    setApiKey(cfg.apiKey || '')
  }, [])

  const handleProfileSave = () => {
    setProfileName(profileName)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleKeySave = () => {
    setLLMConfig({ ...getLLMConfig(), apiKey })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearCache = () => {
    clearMemory()
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  const initials = profileName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
  const avatarColor = '#8b5cf6' // violeta do sistema

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2rem', margin: 0 }}>Configurações</h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', marginTop: '0.25rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Personalização & sistema
        </p>
        <div style={{ height: 1, background: 'linear-gradient(90deg, #c8a96e, transparent)', opacity: 0.3, marginTop: '0.75rem' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 1. Perfil */}
        <section className="section-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
              {initials}
            </span>
            Perfil
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)', display: 'block', marginBottom: '0.35rem' }}>
                Nome de exibição
              </label>
              <input
                className="input-field"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="Seu nome"
                style={{ maxWidth: 320 }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Salvo localmente no navegador
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={handleProfileSave}
              style={{ maxWidth: 200, marginTop: '0.5rem' }}
            >
              {saved ? '✓ Salvo' : 'Salvar perfil'}
            </button>
          </div>
        </section>

        {/* 2. LLM / IA */}
        <section className="section-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem', marginBottom: '1rem' }}>
            LLM · Assistente IA
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)', display: 'block', marginBottom: '0.35rem' }}>
                API Key (DeepSeek / OpenAI / Groq)
              </label>
              <input
                type="password"
                className="input-field"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-... ou gsk_..."
                style={{ maxWidth: 400 }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                A mesma chave é usada na página Chat. Guardada localmente.
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={handleKeySave}
              style={{ maxWidth: 200, marginTop: '0.5rem' }}
            >
              {saved ? '✓ Salvo' : 'Salvar chave'}
            </button>
          </div>
        </section>

        {/* 3. Sistema */}
        <section className="section-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem', marginBottom: '1rem' }}>
            Sistema
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)' }}>Versão</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#c8a96e' }}>{VERSION}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)' }}>Data do build</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb' }}>{BUILD_DATE}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)' }}>Stack</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#8b5cf6' }}>{STACK}</div>
            </div>
          </div>
        </section>

        {/* 4. Avançado */}
        <section className="section-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem', marginBottom: '1rem', color: '#ef4444' }}>
            Avançado
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', maxWidth: 480 }}>
              Limpa todo o histórico de conversas e insights salvos do assistente Chat. Esta ação não pode ser desfeita.
            </p>

            <button
              style={{
                background: cleared ? '#166534' : '#1a0a00',
                border: `1px solid ${cleared ? '#166534' : '#7c2d12'}`,
                color: cleared ? '#4ade80' : '#f59e0b',
                borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', maxWidth: 220
              }}
              onClick={handleClearCache}
            >
              {cleared ? '✓ Cache limpo' : '🗑️ Limpar cache do chat'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
