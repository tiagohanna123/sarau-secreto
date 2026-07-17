export interface Artista {
  id: string
  nome: string
  foto: string
  bio: string
  estilo: string
  redes?: { instagram?: string; soundcloud?: string }
  destaque?: boolean
}

export const artistas: Artista[] = [
  {
    id: 'luiza-mendonca',
    nome: 'Luiza Mendonça',
    foto: '',
    bio: 'Cantora e compositora que mistura jazz, samba e eletrônico. Voz aveludada que já abriu a noite de três edições do Sarau.',
    estilo: 'Jazz / MPB Eletrônico',
    redes: { instagram: '@luizamendonca' },
    destaque: true,
  },
  {
    id: 'rafael-trompete',
    nome: 'Rafael Trompete',
    foto: '',
    bio: 'Trompetista de formação clássica que encontrou no jazz de rua sua verdadeira voz. Solos que param o salão.',
    estilo: 'Jazz / Soul',
    redes: { instagram: '@rafatrompete' },
    destaque: true,
  },
  {
    id: 'ana-terra',
    nome: 'Ana Terra',
    foto: '',
    bio: 'Poeta marginal e slammer. Seus versos sobre城市, afeto e resistência emocionaram plateias inteiras no Sarau.',
    estilo: 'Poesia Falada / Slam',
    redes: { instagram: '@anaterra.poesia' },
    destaque: true,
  },
  {
    id: 'coletivo-vista',
    nome: 'Coletivo Vista',
    foto: '',
    bio: 'Coletivo de artistas visuais que transforma espaços vazios em galerias efêmeras. Instalações imersivas com luz, sombra e projeção.',
    estilo: 'Arte Instalação / Projeção',
    destaque: true,
  },
  {
    id: 'dj-lunar',
    nome: 'DJ Lunar',
    foto: '',
    bio: 'Selecionadora de discos raros. Seu set passeia por funk brasileiro, jazz fusion e world music. Setlist imprevisível.',
    estilo: 'Vinil / World Music',
    redes: { instagram: '@dj_lunar', soundcloud: 'dj-lunar' },
  },
  {
    id: 'maestro-caetano',
    nome: 'Maestro Caetano & Quarteto de Cordas',
    foto: '',
    bio: 'Quarteto de cordas que reinterpreta clássicos da música brasileira com arranjos contemporâneos. Experiência cinematográfica ao vivo.',
    estilo: 'Música Erudita / Brasileira',
  },
  {
    id: 'bia-martins',
    nome: 'Bia Martins Cerâmica',
    foto: '',
    bio: 'Ceramista que cria peças inspiradas nas texturas da noite. Cada peça é única, moldada à mão e queimada em forno a lenha.',
    estilo: 'Cerâmica Artesanal',
    redes: { instagram: '@biamartinsceramica' },
  },
  {
    id: 'thigo-escrita',
    nome: 'Thiago Escrita',
    foto: '',
    bio: 'Escritor e letrista. Microcontos impressos em papéis artesanais distribuídos como ingressos-poema. Palavra como objeto.',
    estilo: 'Microconto / Letrista',
  },
]

export const curadoriaAreas = [
  {
    titulo: 'Curadoria Musical',
    descricao: 'A seleção musical do Sarau Secreto é feita por um conselho rotativo de músicos, DJs e produtores. A cada edição, uma nova constelação sonora.',
    icone: 'music',
  },
  {
    titulo: 'Curadoria de Artes Visuais',
    descricao: 'Artistas visuais são convidados a ocupar o espaço com instalações site-specific. Pintura, projeção, escultura e intervenção urbana.',
    icone: 'palette',
  },
  {
    titulo: 'Curadoria Gastronômica',
    descricao: 'Chefs parceiros criam menus exclusivos para cada edição. Comida afetiva com ingredientes sazonais e apresentação artística.',
    icone: 'utensils',
  },
  {
    titulo: 'Curadoria Literária',
    descricao: 'Poetas, contistas e escritores são selecionados por chamada aberta. Os textos escolhidos ganham voz ao vivo e impressão artesanal.',
    icone: 'book',
  },
]
