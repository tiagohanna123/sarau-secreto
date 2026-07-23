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
  const [profileName, setProfileNameState] = useState(getProfileName())
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

  return (
    <div className="max-w-[700px] mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-light text-[2rem] m-0">Configurações</h1>
        <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">
          Personalização & sistema
        </p>
        <div className="h-px bg-gradient-to-r from-gold to-transparent opacity-30 mt-3" />
      </div>

      <div className="flex flex-col gap-6">
        {/* 1. Perfil */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display font-medium text-lg mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet to-violet/80 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </span>
            Perfil
          </h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground block mb-1">
                Nome de exibição
              </label>
              <input
                className="w-full max-w-xs rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-gold/50 transition-colors"
                value={profileName}
                onChange={e => setProfileNameState(e.target.value)}
                placeholder="Seu nome"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Salvo localmente no navegador
              </p>
            </div>

            <button
              className="self-start rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-card-hover hover:border-gold/30 transition-colors"
              onClick={handleProfileSave}
            >
              {saved ? '✓ Salvo' : 'Salvar perfil'}
            </button>
          </div>
        </section>

        {/* 2. LLM / IA */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display font-medium text-lg mb-4">
            LLM · Assistente IA
          </h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground block mb-1">
                API Key (DeepSeek / OpenAI / Groq)
              </label>
              <input
                type="password"
                className="w-full max-w-md rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-gold/50 transition-colors"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-... ou gsk_..."
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                A mesma chave é usada na página Chat. Guardada localmente.
              </p>
            </div>

            <button
              className="self-start rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-card-hover hover:border-gold/30 transition-colors"
              onClick={handleKeySave}
            >
              {saved ? '✓ Salvo' : 'Salvar chave'}
            </button>
          </div>
        </section>

        {/* 3. Sistema */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display font-medium text-lg mb-4">
            Sistema
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Versão</p>
              <p className="text-base font-semibold text-gold">{VERSION}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Data do build</p>
              <p className="text-base font-semibold text-foreground">{BUILD_DATE}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Stack</p>
              <p className="text-sm font-medium text-violet">{STACK}</p>
            </div>
          </div>
        </section>

        {/* 4. Avançado */}
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display font-medium text-lg mb-4 text-danger">
            Avançado
          </h2>

          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground max-w-[480px]">
              Limpa todo o histórico de conversas e insights salvos do assistente Chat. Esta ação não pode ser desfeita.
            </p>

            <button
              onClick={handleClearCache}
              className={`self-start rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                cleared
                  ? 'bg-success/90 text-white'
                  : 'bg-[#1a0a00] border border-[#7c2d12] text-warning hover:bg-[#2a1500]'
              }`}
            >
              {cleared ? '✓ Cache limpo' : '🗑️ Limpar cache do chat'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
