import { AuthProvider, useAuth } from '@/lib/auth'
import { LoginPage } from '@/app/login'
import { Dashboard, DashboardErrorBoundary } from '@/app/insights/dashboard'
import { DataProvider } from '@/lib/data-context'
import { PeriodProvider } from '@/lib/period-context'
import { lazy, Suspense, useState, useEffect, type ReactNode } from 'react'
import { api } from '@/lib/api'

import {
  LayoutDashboard, CalendarDays, Brain, DollarSign, Settings,
  LogOut, Menu, BarChart3, Target, Music, Upload, ArrowLeft, Sun, Moon,
} from 'lucide-react'

const EventsPage       = lazy(() => import('@/app/eventos/list').then(m => ({ default: m.EventsPage })))
const EventDetail      = lazy(() => import('@/app/eventos/detail').then(m => ({ default: m.EventDetail })))
const ComparativoPage  = lazy(() => import('@/app/comparativo/page').then(m => ({ default: m.ComparativoPage })))
const FinanceiroPage   = lazy(() => import('@/app/financeiro/page').then(m => ({ default: m.FinanceiroPage })))
const MetasPage        = lazy(() => import('@/app/metas/page').then(m => ({ default: m.MetasPage })))
const InsightsPage     = lazy(() => import('@/app/insights/page').then(m => ({ default: m.InsightsPage })))
const SettingsPage     = lazy(() => import('@/app/settings/page').then(m => ({ default: m.SettingsPage })))
const ArtistsPage      = lazy(() => import('@/app/artistas/list').then(m => ({ default: m.ArtistsPage })))
const ArtistDetailPage = lazy(() => import('@/app/artistas/detail').then(m => ({ default: m.ArtistDetailPage })))
const ImportPage       = lazy(() => import('@/app/import/page').then(m => ({ default: m.ImportPage })))

type Route = 'login' | 'dashboard' | 'eventos' | 'financeiro' | 'inteligencia' | 'config' | 'event' | 'artist'

/* ── Router via hash ── */
function useRouter() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || 'dashboard')
  useEffect(() => {
    const handler = () => setHash(window.location.hash.slice(1) || 'dashboard')
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])
  const parts = hash.split('/')
  const route = parts[0] as Route
  const sub = parts.slice(1).join('/')
  const isSub = (name: string) => sub === name
  const navigate = (path: string) => { window.location.hash = path }
  return { route, sub, isSub, navigate }
}

/* ── Nav definitions ── */
interface NavItem { id: string; label: string; icon: ReactNode }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
  { id: 'eventos',      label: 'Eventos',      icon: <CalendarDays size={18} /> },
  { id: 'financeiro',   label: 'Financeiro',   icon: <DollarSign size={18} /> },
  { id: 'inteligencia', label: 'Inteligência', icon: <Brain size={18} /> },
  { id: 'config',       label: 'Config',       icon: <Settings size={18} /> },
]

/* ── Sub-nav definitions for merged tabs ── */
interface SubNavItem { id: string; label: string; icon: ReactNode }

const SUB_EVENTOS: SubNavItem[] = [
  { id: '',           label: 'Eventos',    icon: <CalendarDays size={15} /> },
  { id: 'comparativo', label: 'Comparativo', icon: <BarChart3 size={15} /> },
]

const SUB_FINANCEIRO: SubNavItem[] = [
  { id: '',      label: 'Financeiro', icon: <DollarSign size={15} /> },
  { id: 'metas',  label: 'Metas',     icon: <Target size={15} /> },
]

const SUB_CONFIG: SubNavItem[] = [
  { id: '',         label: 'Geral',    icon: <Settings size={15} /> },
  { id: 'artistas',  label: 'Artistas', icon: <Music size={15} /> },
  { id: 'import',    label: 'Importar', icon: <Upload size={15} /> },
]

function getSubNav(route: string): SubNavItem[] | null {
  if (route === 'eventos') return SUB_EVENTOS
  if (route === 'financeiro') return SUB_FINANCEIRO
  if (route === 'config') return SUB_CONFIG
  return null
}

/* ── Sidebar ── */
function Sidebar({ route, sub, navigate, open, onClose }: {
  route: string; sub: string; navigate: (r: string) => void; open: boolean; onClose: () => void
}) {
  const { logout } = useAuth()
  const subNav = getSubNav(route)
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sarau-theme') === 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight)
    localStorage.setItem('sarau-theme', isLight ? 'light' : 'dark')
  }, [isLight])

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-50 flex flex-col',
          'bg-[#0d0d0d] border-r border-border',
          'transition-transform duration-300 ease-in-out',
          'w-60',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto',
        ].join(' ')}
      >
        <div className="px-5 pt-7 pb-5 border-b border-border">
          <img src="/sarau-logo-white.png" alt="Sarau Secreto" className="w-32 opacity-90" />
          <p className="mt-1.5 text-[0.6rem] tracking-[0.15em] uppercase text-muted-foreground">Sistema de Gestão</p>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const hasSub = !!getSubNav(item.id)
            const active = route === item.id && (!sub || hasSub)
            return (
              <div key={item.id}>
                <button
                  onClick={() => { navigate(item.id); onClose() }}
                  className={[
                    'flex items-center gap-3 px-5 py-3 text-sm text-left w-full transition-colors rounded-none',
                    active
                      ? 'bg-gold/10 text-gold font-semibold border-r-2 border-gold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]',
                  ].join(' ')}
                >
                  <span className={active ? 'text-gold' : 'text-muted-foreground'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>

                {/* Sub-nav items when this tab is active */}
                {route === item.id && hasSub && subNav && (
                  <div className="ml-2 mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-border/50 ml-6 pl-2">
                    {subNav.filter(s => s.id !== '').map(s => {
                      const subActive = route === item.id && (
                        s.id === '' ? sub === '' : sub === s.id
                      )
                      return (
                        <button
                          key={s.id}
                          onClick={() => { navigate(s.id ? `${item.id}/${s.id}` : item.id); onClose() }}
                          className={[
                            'flex items-center gap-2.5 px-3 py-2 text-xs text-left w-full transition-colors rounded',
                            subActive
                              ? 'text-gold font-medium bg-gold/5'
                              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]',
                          ].join(' ')}
                        >
                          <span className={subActive ? 'text-gold' : 'text-muted-foreground'}>
                            {s.icon}
                          </span>
                          {s.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <button
            onClick={() => setIsLight(!isLight)}
            className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2 px-2"
          >
            {isLight ? <Moon size={14} /> : <Sun size={14} />}
            {isLight ? 'Modo escuro' : 'Modo claro'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2 px-2"
          >
            <LogOut size={14} />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  )
}

/* ── Bottom nav mobile ── */
function BottomNav({ route, navigate }: { route: string; navigate: (r: string) => void }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
      style={{ background: 'rgba(13,13,13,0.97)', borderTop: '1px solid #1f1f1f', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {NAV_ITEMS.map(item => {
          const active = route === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all relative"
              style={{ color: active ? '#c8a96e' : '#6b7280' }}
            >
              <span className="transition-transform" style={{ transform: active ? 'scale(1.15)' : 'scale(1)' }}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-gold" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/* ── Header mobile ── */
function MobileHeader({ title, subTitle, onMenuOpen, onBack }: {
  title: string; subTitle?: string; onMenuOpen: () => void; onBack?: () => void
}) {
  return (
    <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 bg-[#0d0d0d]/95 backdrop-blur border-b border-border" style={{ height: 52 }}>
      <div className="flex items-center gap-2">
        {onBack ? (
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground p-1 -ml-1 transition-colors">
            <ArrowLeft size={18} />
          </button>
        ) : (
          <button onClick={onMenuOpen} className="text-muted-foreground hover:text-foreground p-1 -ml-1 transition-colors" aria-label="Menu">
            <Menu size={20} />
          </button>
        )}
      </div>
      <img src="/sarau-logo-white.png" alt="Sarau Secreto" className="h-6 opacity-90 absolute left-1/2 -translate-x-1/2" />
      <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">{subTitle || title}</span>
    </header>
  )
}

/* ── App Shell ── */
function AppShell({ children, route, sub, navigate }: {
  children: ReactNode; route: string; sub: string; navigate: (r: string) => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const currentLabel = NAV_ITEMS.find(n => n.id === route)?.label ?? 'Dashboard'
  const subNav = getSubNav(route)
  const subLabel = subNav?.find(s => (s.id === '' && sub === '') || s.id === sub)?.label

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar route={route} sub={sub} navigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader
          title={currentLabel}
          subTitle={subLabel}
          onMenuOpen={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden pb-24 lg:pb-0">
          {children}
        </main>
      </div>
      <BottomNav route={route} navigate={navigate} />
    </div>
  )
}

function PageSkel() {
  return <div className="bg-card border border-border rounded-xl h-28 animate-pulse" />
}

function Router() {
  const { isAuthenticated } = useAuth()
  const { route, sub, isSub, navigate } = useRouter()

  if (!isAuthenticated) return <LoginPage onLogin={() => navigate('dashboard')} />

  const content = (() => {
    switch (route) {
      /* ── Dashboard (unifica bar + insights overview) ── */
      case 'dashboard':
        return <DashboardErrorBoundary><Dashboard /></DashboardErrorBoundary>

      /* ── Eventos (unifica comparativo) ── */
      case 'eventos':
        if (isSub('comparativo')) return <ComparativoPage />
        return <EventsPage onBack={() => navigate('dashboard')} onSelect={(id: string) => navigate(`event/${id}`)} />

      /* ── Event detail (kept) ── */
      case 'event':
        return <EventDetail id={sub} onBack={() => navigate('eventos')} />

      /* ── Financeiro (unifica metas) ── */
      case 'financeiro':
        if (isSub('metas')) return <MetasPage navigate={navigate} />
        return <FinanceiroPage />

      /* ── Inteligência (insights avançados) ── */
      case 'inteligencia':
        return <InsightsPage />

      /* ── Config (unifica settings, artistas, import) ── */
      case 'config':
        if (isSub('artistas')) return <ArtistsPage navigate={navigate} />
        if (isSub('import'))  return <ImportPage onBack={() => navigate('config')} />
        return <SettingsPage navigate={navigate} />

      /* ── Artist Detail ── */
      case 'artist':
        return <ArtistDetailPage artist={{ id: sub } as any} onBack={() => navigate('config/artistas')} />

      /* ── Dashboard (fallback para rotas nao mapeadas) ── */
      default:
        return <DashboardErrorBoundary><Dashboard /></DashboardErrorBoundary>
    }
  })()

  return (
    <AppShell route={route} sub={sub} navigate={navigate}>
      <Suspense fallback={
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
          {[1, 2, 3].map(i => <PageSkel key={i} />)}
        </div>
      }>
        {content}
      </Suspense>
    </AppShell>
  )
}

/* ── Artist Detail Wrapper ── */

function ArtistDetailWrapper({ id, onBack }: { id: string; onBack: () => void }) {
  const [artist, setArtist] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let dead = false
    setLoading(true)
    api.artists.getDetail(id).then(data => {
      if (!dead) setArtist(data)
    }).catch(() => {}).finally(() => { if (!dead) setLoading(false) })
    return () => { dead = true }
  }, [id])

  if (loading) return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      <div className="h-3 w-16 bg-white/5 rounded mb-3" />
      <div className="h-6 w-64 bg-white/5 rounded mb-2" />
      <div className="grid grid-cols-4 gap-3 mb-6">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}</div>
      <div className="h-48 bg-white/5 rounded-xl" />
    </div>
  )

  if (!artist) return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-center">
      <p className="text-sm text-red-400">Erro ao carregar artista</p>
      <button onClick={onBack} className="mt-4 text-xs text-[#c8a96e] hover:underline">← Voltar</button>
    </div>
  )

  return <ArtistDetailPage artist={artist} onBack={onBack} />
}

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <PeriodProvider>
          <Router />
        </PeriodProvider>
      </DataProvider>
    </AuthProvider>
  )
}
