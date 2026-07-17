export interface Anuncio {
  id: string
  nome: string
  descricao: string
  valor: string
  disponivel: boolean
  tipo: 'patrocinio' | 'espaco' | 'midia'
}

export const anuncios: Anuncio[] = [
  {
    id: 'patrocinio-ouro',
    nome: 'Patrocínio Ouro',
    descricao: 'Logo no palco principal, menção em redes sociais (3 posts), kit cortesia para 2 pessoas, espaço para estande/ativação de marca.',
    valor: 'R$ 5.000,00',
    disponivel: true,
    tipo: 'patrocinio',
  },
  {
    id: 'patrocinio-prata',
    nome: 'Patrocínio Prata',
    descricao: 'Logo em material gráfico digital, menção em stories, 1 post dedicado.',
    valor: 'R$ 2.500,00',
    disponivel: true,
    tipo: 'patrocinio',
  },
  {
    id: 'painel-digital',
    nome: 'Painel Digital — Tela Interativa',
    descricao: 'Espaço publicitário nos painéis de LED espalhados pelo evento. Exibição em loop de 30 segundos.',
    valor: 'R$ 800,00',
    disponivel: true,
    tipo: 'espaco',
  },
  {
    id: 'cardapio-digital',
    nome: 'Espaço no Cardápio Digital',
    descricao: 'Sua marca como "apoio" no cardápio digital do bar. Visível para todos os participantes durante todo o evento.',
    valor: 'R$ 600,00',
    disponivel: true,
    tipo: 'espaco',
  },
  {
    id: 'brinde-exclusivo',
    nome: 'Brinde Exclusivo',
    descricao: 'Distribuição de brindes da sua marca na entrada do evento. Público cativo e experiência positiva associada.',
    valor: 'R$ 1.200,00',
    disponivel: true,
    tipo: 'midia',
  },
  {
    id: 'email-marketing',
    nome: 'Menção em Newsletters',
    descricao: 'Sua marca mencionada em 2 edições da newsletter pré-evento (base de +2.000 contatos).',
    valor: 'R$ 400,00',
    disponivel: true,
    tipo: 'midia',
  },
]
