// Cloudflare Pages Function — GET /api/bar
import { BAR_EMBED } from '../../src/lib/bar-embed'

export async function onRequest() {
  return new Response(JSON.stringify(BAR_EMBED), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
