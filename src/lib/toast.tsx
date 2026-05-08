import { createContext, useContext, useState, useCallback, useRef } from 'react'

type ToastType = 'success' | 'warning' | 'error' | 'info'
interface ToastItem { id: number; message: string; type: ToastType }

interface ToastCtx { toast: (msg: string, type?: ToastType) => void }
const ToastContext = createContext<ToastCtx>({ toast: () => {} })

export function useToast() { return useContext(ToastContext) }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2800)
  }, [])

  const colors: Record<ToastType, string> = {
    success: '#c8a96e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#8b5cf6',
  }
  const icons: Record<ToastType, string> = {
    success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️'
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '4.5rem', right: '1rem',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} className="tab-fade-enter" style={{
            background: '#1a1a1a',
            border: `1px solid ${colors[t.type]}44`,
            borderLeft: `3px solid ${colors[t.type]}`,
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            color: '#f5f0e8',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            minWidth: '220px',
            maxWidth: '320px',
            pointerEvents: 'auto',
          }}>
            <span>{icons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
