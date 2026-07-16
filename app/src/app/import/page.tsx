import { useState, useRef, type ChangeEvent } from 'react'
import { api } from '@/lib/api'
import { useData } from '@/lib/data-context'

type ImportStep = 'idle' | 'uploading' | 'preview' | 'confirming' | 'done' | 'error'
type Source = 'sympla' | 'bar'

export function ImportPage({ onBack }: { onBack: () => void }) {
  const { refresh } = useData()
  const [source, setSource] = useState<Source>('sympla')
  const [step, setStep] = useState<ImportStep>('idle')
  const [preview, setPreview] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [error, setError] = useState('')
  const [imported, setImported] = useState(0)
  const fileRef = useRef<File | null>(null)
  const [detectedSlug, setDetectedSlug] = useState('')

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    fileRef.current = file
    setStep('uploading')
    setError('')

    try {
      if (source === 'sympla') {
        const res = await api.import.uploadSympla(file)
        setPreview(res.preview)
        setColumns(res.columns)
        setTotalRows(res.totalRows)
        setDetectedSlug(res.detectedSlug)
      } else {
        const res = await api.import.uploadBar(file)
        setPreview(res.preview)
        setColumns(res.columns)
        setTotalRows(res.totalRows)
      }
      setStep('preview')
    } catch (err: any) {
      setError(err.message)
      setStep('error')
    }
  }

  const handleConfirm = async () => {
    if (!fileRef.current) return
    setStep('confirming')

    try {
      const body = {
        rows: preview,
        filename: fileRef.current.name,
        eventId: detectedSlug,
        columnMap: {},
      }

      if (source === 'sympla') {
        const res = await api.import.confirmSympla(body)
        setImported(res.imported)
      } else {
        const res = await api.import.confirmBar(body)
        setImported(res.imported)
      }
      refresh()
      setStep('done')
    } catch (err: any) {
      setError(err.message)
      setStep('error')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Importar Dados</h1>
          <button onClick={onBack} className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            ← Voltar
          </button>
        </div>
      </header>

      {/* Source selector */}
      {step === 'idle' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            {(['sympla', 'bar'] as Source[]).map(s => (
              <button key={s} onClick={() => setSource(s)}
                      className={`kpi-card flex-1 cursor-pointer text-center ${source === s ? 'border-secondary/40' : ''}`}>
                <p className="text-sm font-bold uppercase tracking-wider">{s === 'sympla' ? 'Sympla' : 'Bar'}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {s === 'sympla' ? 'Ingressos vendidos' : 'Vendas do bar'}
                </p>
              </button>
            ))}
          </div>

          <div className="chart-box">
            <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Selecione o arquivo CSV
            </p>
            <label className="btn btn-primary cursor-pointer">
              <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
              Escolher arquivo
            </label>
            <p className="mt-2 text-[10px] text-muted-foreground/60">
              Formatos aceitos: CSV com headers. Sympla: nome, email, tipo, quantidade, valor, data.
              Bar: produto, quantidade, preço, horário, pagamento.
            </p>
          </div>
        </div>
      )}

      {/* Uploading */}
      {step === 'uploading' && (
        <div className="chart-box py-12 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">Processando arquivo...</p>
        </div>
      )}

      {/* Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="chart-box">
            <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Preview — {totalRows} linhas encontradas
            </p>
            <p className="mb-3 text-[10px] text-muted-foreground/60">
              Colunas detectadas: {columns.join(', ')}
            </p>
            <table className="data-table">
              <thead>
                <tr>
                  {columns.slice(0, 8).map(c => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {columns.slice(0, 8).map(c => <td key={c}>{String(row[c] || '').slice(0, 30)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button onClick={handleConfirm} className="btn btn-primary text-[10px]">
              Confirmar Importação
            </button>
            <button onClick={() => setStep('idle')} className="btn btn-ghost text-[10px]">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="chart-box py-8 text-center space-y-3">
          <p className="text-lg font-bold text-success">✅ Importação concluída</p>
          <p className="text-xs text-muted-foreground">{imported} registros importados</p>
          <button onClick={() => { refresh(); onBack() }} className="btn btn-primary text-[10px] mt-3">
            Voltar ao Dashboard
          </button>
        </div>
      )}

      {/* Error */}
      {step === 'error' && (
        <div className="chart-box py-8 text-center space-y-3">
          <p className="text-sm font-bold text-danger">Erro na importação</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <button onClick={() => setStep('idle')} className="btn btn-ghost text-[10px] mt-3">
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
