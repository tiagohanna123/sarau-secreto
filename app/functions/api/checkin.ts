// Cloudflare Pages Function — GET /api/checkin
import { CHECKIN_EMBED } from '../../src/lib/checkin-embed'

export async function onRequest() {
  return new Response(JSON.stringify(CHECKIN_EMBED), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
