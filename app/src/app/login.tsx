import { useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'

interface Props { onLogin: () => void }

export function LoginPage({ onLogin }: Props) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      onLogin()
    } catch {
      setError('Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Background glow — violet + gold orbs */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-violet/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gold/6 top-[30%] left-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-violet/4 bottom-[20%] right-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <form onSubmit={handleSubmit} className="w-full max-w-sm px-6 relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/sarau-logo-white.png" alt="Sarau Secreto" className="w-[180px] mx-auto opacity-95" />
          <p className="mt-3 text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
            Sistema de Gestão
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-30 mt-4" />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-lg px-3 py-2.5 text-xs text-danger mb-4">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-gold-dim"
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-gold-dim"
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-black font-semibold text-sm rounded-lg py-2.5 transition-all duration-150 hover:opacity-85 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-current border-r-transparent animate-spin" />
                Entrando...
              </span>
            ) : 'Entrar'}
          </button>
        </div>

        <DemoHint />
      </form>
    </div>
  )
}

function DemoHint() {
  const [show, setShow] = useState(false)
  return (
    <p
      onClick={() => setShow(!show)}
      className="mt-6 text-center text-[0.72rem] cursor-pointer transition-colors duration-200 select-none"
      style={{ color: show ? 'var(--color-gold)' : 'var(--color-muted-foreground)' }}
    >
      {show ? 'admin@osarausecreto.com / sarau2024' : 'Acesso restrito · clique para credenciais demo'}
    </p>
  )
}
