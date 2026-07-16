import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { PrismaClient } from '@prisma/client'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

const app = Fastify({ logger: true })

// ── Plugins ──
await app.register(cors, { origin: true, credentials: true })
await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret-change-me' })
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

// ── Decorate with Prisma ──
app.decorate('prisma', prisma)
app.decorate('authenticate', async (req: any, reply: any) => {
  try { await req.jwtVerify() }
  catch { return reply.status(401).send({ error: 'Unauthorized' }) }
})

// ── Routes ──
await app.register(import('./routes/auth.js'), { prefix: '/api/auth' })
await app.register(import('./routes/events.js'), { prefix: '/api/events' })
await app.register(import('./routes/import.js'), { prefix: '/api/import' })
await app.register(import('./routes/insights.js'), { prefix: '/api/insights' })
await app.register(import('./routes/yuzer.js'), { prefix: '/api/yuzer' })
await app.register(import('./routes/sympla-sync.js'), { prefix: '/api/sympla' })
await app.register(import('./routes/artists.js'), { prefix: '/api/artists' })
await app.register(import('./routes/convergence.js'), { prefix: '/api/insights' })

// ── Start ──
const port = parseInt(process.env.PORT || '3001')
try {
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`🚀 API running on port ${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

export default app
