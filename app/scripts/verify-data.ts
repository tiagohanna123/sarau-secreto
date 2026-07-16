import { EMBEDDED_DB } from './src/lib/db-embed.js'
import { BAR_EMBED } from './src/lib/bar-embed.js'

function barDataForEvent(eventId) {
  const map = (BAR_EMBED as any)?.eventBarRevenue
  if (!map) return null
  return map[eventId] ?? null
}

const events = EMBEDDED_DB.events
const tickets = EMBEDDED_DB.tickets

let totalTicket = 0
let totalBar = 0
let totalCombined = 0

for (const ev of events) {
  const tr = tickets[ev.id]?.revenue ?? ev.totalRevenue ?? 0
  const bar = barDataForEvent(ev.id)
  const br = bar ? bar.revenue : 0
  totalTicket += tr
  totalBar += br
  totalCombined += tr + br
}

console.log('Computed from embed:')
console.log('  Ticket revenue:', totalTicket.toFixed(2))
console.log('  Bar revenue:', totalBar.toFixed(2))
console.log('  Combined:', totalCombined.toFixed(2))
console.log('  Events:', events.length)
console.log('  DB totalRevenue sum:', events.reduce((s,e) => s + (e.totalRevenue || 0), 0).toFixed(2))
console.log('  DB soldCount sum:', events.reduce((s,e) => s + (e.soldCount || 0), 0))
