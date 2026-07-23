import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { App } from './app'
import { ToastProvider } from './lib/toast'
import './index.css'

function RootFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-red-400/80 text-sm font-medium mb-2">Erro inesperado</p>
        <p className="text-[#4b5563] text-xs mb-4">
          O sistema encontrou um erro ao carregar. Isso pode ser causado por dados
          salvos desatualizados.
        </p>
        <button
          onClick={() => {
            sessionStorage.clear()
            window.location.reload()
          }}
          className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg text-sm transition-colors"
        >
          Limpar cache e recarregar
        </button>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={RootFallback}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
