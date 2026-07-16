// Cloudflare Pages Function — GET /api/bar
import { BAR_EVENTOS, BAR_REVENUE_MAP } from '../data/bar'

export async function onRequest() {
  return new Response(JSON.stringify({
    eventos: BAR_EVENTOS,
    eventBarRevenue: BAR_REVENUE_MAP,
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
