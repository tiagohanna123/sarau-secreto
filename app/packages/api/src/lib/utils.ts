import { PrismaClient } from '@prisma/client'

export interface Env {
  DATABASE_URL: string
  JWT_SECRET: string
}

let prisma: PrismaClient

export function getPrisma(env: Env) {
  if (!prisma) {
    prisma = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } })
  }
  return prisma
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    }
  })
}

export function error(msg: string, status = 400) {
  return json({ error: msg }, status)
}
