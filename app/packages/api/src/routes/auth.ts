import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default async function (app: FastifyInstance) {
  app.post('/login', async (req, reply) => {
    const { email, password } = loginSchema.parse(req.body)
    const user = await (app as any).prisma.user.findUnique({ where: { email } })
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return reply.status(401).send({ error: 'Email ou senha incorretos' })
    }
    const token = (app as any).jwt.sign({ id: user.id, role: user.role })
    await (app as any).prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  })

  app.get('/me', { preHandler: [(app as any).authenticate] }, async (req: any) => {
    const user = await (app as any).prisma.user.findUnique({ where: { id: req.user.id } })
    return { id: user.id, name: user.name, email: user.email, role: user.role }
  })
}
