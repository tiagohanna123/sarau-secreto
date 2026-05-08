export interface MemoryItem {
  id: string
  question: string
  insight: string
  confirmed: boolean
  createdAt: string
}

const MEM_KEY = 'sarau-chat-memory'
const CFG_KEY = 'sarau-llm-config'

export interface LLMConfig {
  provider: 'deepseek' | 'openai' | 'groq'
  apiKey: string
}

// ── Memory ──────────────────────────────────────────────────────────────────

export function getMemory(): MemoryItem[] {
  try { return JSON.parse(localStorage.getItem(MEM_KEY) || '[]') } catch { return [] }
}

export function addMemory(q: string, insight: string): MemoryItem {
  const all = getMemory()
  const item: MemoryItem = { id: Date.now().toString(), question: q, insight, confirmed: false, createdAt: new Date().toISOString() }
  all.push(item)
  localStorage.setItem(MEM_KEY, JSON.stringify(all.slice(-50))) // max 50
  return item
}

export function confirmMemory(id: string) {
  const all = getMemory()
  const item = all.find(m => m.id === id)
  if (item) { item.confirmed = true; localStorage.setItem(MEM_KEY, JSON.stringify(all)) }
}

export function clearMemory() {
  localStorage.removeItem(MEM_KEY)
}

export function getConfirmedInsights(): MemoryItem[] {
  return getMemory().filter(m => m.confirmed)
}

// ── LLM Config ───────────────────────────────────────────────────────────────

export function getLLMConfig(): LLMConfig {
  try { return JSON.parse(localStorage.getItem(CFG_KEY) || 'null') || { provider: 'deepseek', apiKey: '' } }
  catch { return { provider: 'deepseek', apiKey: '' } }
}

export function setLLMConfig(cfg: LLMConfig) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg))
}
