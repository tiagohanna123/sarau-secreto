import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const pwd = bcrypt.hashSync('sarau2024', 10)
  await prisma.user.upsert({
    where: { email: 'admin@osarausecreto.com' },
    update: {},
    create: {
      email: 'admin@osarausecreto.com',
      password: pwd,
      name: 'Sócio Sarau',
      role: 'admin',
    },
  })

  // Artistas de exemplo
  const artistas = [
    { name: 'Grupo Marcelo Café', genre: 'Jazz Contemporâneo', eventCount: 4, totalAudience: 480, bio: 'Repertório autoral com bossa, presença fixa nos eventos de maior ticket médio.' },
    { name: 'Banda Velha Guarda', genre: 'MPB Clássica', eventCount: 3, totalAudience: 352, bio: 'Homenagem aos grandes nomes brasileiros; cativa o público 40+.' },
    { name: 'Trio Sax & Voz', genre: 'Jazz & Bossa', eventCount: 3, totalAudience: 315, bio: 'Formação saxofone, piano e voz. Som ambiente requintado.' },
    { name: 'Ana Lima', genre: 'MPB Moderna', eventCount: 2, totalAudience: 210, bio: 'Cantora e compositora brasiliense. Repertório autoral + covers de Djavan e Marisa Monte.' },
    { name: 'Samba Soul Brasília', genre: 'Samba / MPB', eventCount: 2, totalAudience: 190, bio: 'Groove contagiante, percussionistas locais. Funciona bem no pico do bar (22h).' },
    { name: 'Quarteto Martinelli', genre: 'Jazz de Câmara', eventCount: 1, totalAudience: 95, bio: 'Quatro músicos da OSB. Repertório instrumental suave, ideal para início de evento.' },
    { name: 'Forró Elétrico DF', genre: 'Forró / Pé de Serra', eventCount: 1, totalAudience: 88, bio: 'Animação garantida, repertório tradicional com arranjos modernos.' },
    { name: 'Duo Piano & Violão', genre: 'Instrumental (Bossa/Jazz)', eventCount: 1, totalAudience: 92, bio: 'Dupla consagrada no cenário local. Som refinado, volume controlado.' },
  ]

  for (const a of artistas) {
    const existing = await prisma.artist.findFirst({ where: { name: a.name } })
    if (!existing) {
      await prisma.artist.create({ data: a })
    }
  }

  console.log('✅ Seed concluído')
  console.log('   Email: admin@osarausecreto.com')
  console.log('   Senha: sarau2024')
  console.log(`   Artistas: ${artistas.length} criados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
