export interface Anuncio {
  id: string
  nome: string
  descricao: string
  valor: string
  disponivel: boolean
  tipo: 'patrocinio' | 'espaco' | 'midia'
}

export const anuncios: Anuncio[] = [
  { id: 'patrocinio-master', nome: 'Patrocínio Master — 2026', descricao: 'Logo no palco principal, menção em redes sociais (3 posts), kit cortesia para 4 pessoas, espaço para estande/ativação de marca, marca no telão interativo.', valor: 'R$ 5.000,00', disponivel: true, tipo: 'patrocinio' },
  { id: 'patrocinio-apoio', nome: 'Apoio Oficial', descricao: 'Logo em material gráfico digital, menção em stories (3), 1 post dedicado. Visibilidade para marcas que querem estar associadas à cultura.', valor: 'R$ 2.500,00', disponivel: true, tipo: 'patrocinio' },
  { id: 'telao-interativo', nome: 'Espaço no Telão Interativo', descricao: 'Sua marca em loop no telão que exibe letras de música e artes visuais durante todo o evento. Visível para todos os participantes.', valor: 'R$ 1.200,00', disponivel: true, tipo: 'espaco' },
  { id: 'cardapio-digital', nome: 'Espaço no Cardápio Digital', descricao: 'Sua marca como "apoio" no cardápio digital do bar. Visível para todos os participantes durante todo o evento.', valor: 'R$ 600,00', disponivel: true, tipo: 'espaco' },
  { id: 'brinde-exclusivo', nome: 'Distribuição de Brindes', descricao: 'Distribuição de brindes da sua marca na entrada do evento. Público cativo de 700+ pessoas.', valor: 'R$ 1.500,00', disponivel: true, tipo: 'midia' },
  { id: 'newsletter', nome: 'Menção na Newsletter', descricao: 'Sua marca mencionada em 2 edições da newsletter do Sarau. Base de contatos qualificados.', valor: 'R$ 400,00', disponivel: true, tipo: 'midia' },
]
