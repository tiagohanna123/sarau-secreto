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
    id: 'ss-2026-1',
    titulo: 'Sarau Secreto — Edição Inverno',
    data: '2026-08-15',
    local: 'Local a revelar 48h antes',
    descricao: 'Uma noite de jazz ao vivo, poesia declamada à luz de velas e gastronomia afetiva. A edição mais íntima do ano, em um casarão secreto da cidade.',
    imagem: '',
    symplaUrl: 'https://www.sympla.com.br/evento/sarau-secreto-edicao-inverno/123456',
    destaque: true,
    status: 'disponivel',
    tags: ['jazz', 'poesia', 'gastronomia', 'inverno'],
  },
  {
    id: 'ss-2026-2',
    titulo: 'Sarau Secreto — Especial Vinil',
    data: '2026-09-26',
    local: 'Local a revelar 48h antes',
    descricao: 'DJ set apenas em vinil, exposição de capas raras e uma curadoria musical que cruza décadas. O vinil como objeto de arte e memória.',
    imagem: '',
    status: 'breve',
    tags: ['vinil', 'dj set', 'exposicao'],
  },
  {
    id: 'ss-2026-3',
    titulo: 'Sarau Secreto — Primavera nos Jardins',
    data: '2026-10-17',
    local: 'Local a revelar 48h antes',
    descricao: 'Festival ao ar livre em jardins secretos. Três palcos, instalações interativas e feira de arte independente. A maior edição do ano.',
    imagem: '',
    destaque: true,
    status: 'breve',
    tags: ['jardins', 'feira de arte', 'instalacoes', 'primavera'],
  },
  {
    id: 'ss-2027-1',
    titulo: 'Sarau Secreto — Réveillon da Alma',
    data: '2026-12-31',
    local: 'Local a revelar 48h antes',
    descricao: 'A virada do ano como ela deveria ser: música ao vivo, champanhe, abraços sinceros e fogos vistos de um lugar que só existe nesta noite.',
    imagem: '',
    status: 'breve',
    tags: ['reveillon', 'ano novo', 'fogos', 'celebração'],
  },
]
