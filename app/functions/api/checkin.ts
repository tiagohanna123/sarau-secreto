// Cloudflare Pages Function — GET /api/checkin
import { CHECKIN } from '../data/checkin'

export async function onRequest() {
  return new Response(JSON.stringify(CHECKIN), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
