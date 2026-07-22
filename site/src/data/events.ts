export interface Evento {
  id: string
  titulo: string
  data: string
  local?: string
  descricao: string
  imagem: string
  symplaUrl?: string
  destaque?: boolean
  status: 'breve' | 'disponivel' | 'esgotado' | 'encerrado'
  tags: string[]
}

export const eventos: Evento[] = [
  {
    id: 'sarau-2025-1',
    titulo: 'Sarau Secreto — Edição 2025',
    data: '2025-07-11',
    local: 'Yuzer Bar · Brasília',
    descricao: '3 dias de música ao vivo e conexão. Sexta (11/07): Cida Oliveira, Banda Vira Lata, Sorriso Dela. Sábado (12/07): Tchello, Sandu Áudio e Jadsa, Samuca EletroAcústico. Domingo (13/07): Fim de tarde com som autoral, convidados especiais e jam session. Open bar de cerveja e refrigerante incluso. Estacionamento gratuito.',
    imagem: '',
    symplaUrl: 'https://www.sympla.com.br/produtor/sarausecreto',
    destaque: true,
    status: 'encerrado',
    tags: ['3 dias', 'yuzer bar', 'brasilia', 'open bar'],
  },
  {
    id: 'ss-2026-1',
    titulo: 'Sarau Secreto 2026',
    data: '2026-07-01',
    local: 'A revelar dias antes',
    descricao: 'A edição de 2026 do Sarau Secreto está sendo preparada. Local, data exata e lineup serão revelados em breve. Fique de olho nas redes para não perder.',
    imagem: '',
    symplaUrl: 'https://www.sympla.com.br/produtor/sarausecreto',
    status: 'breve',
    tags: ['2026', 'em breve', 'save the date'],
  },
  {
    id: 'ss-rio-2025',
    titulo: 'Sarau Secreto — Rio de Janeiro',
    data: '2025-09-15',
    local: 'Centro · Rio de Janeiro',
    descricao: 'Edição especial no Rio de Janeiro, reunindo artistas cariocas e convidados internacionais. A experiência do Sarau Secreto cruzou fronteiras.',
    imagem: '',
    status: 'encerrado',
    tags: ['rio de janeiro', 'edicao especial', 'internacional'],
  },
  {
    id: 'ss-lisboa-2025',
    titulo: 'Sarau Secreto — Lisboa',
    data: '2025-11-20',
    local: 'Lisboa · Portugal',
    descricao: 'Primeira edição internacional do Sarau Secreto. Levando a experiência do festival brasiliense para a Europa.',
    imagem: '',
    status: 'encerrado',
    tags: ['lisboa', 'portugal', 'internacional'],
  },
]
