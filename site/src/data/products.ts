export interface Produto {
  id: string
  nome: string
  descricao: string
  preco: string
  imagem: string
  categoria: 'vestuario' | 'acessorio' | 'colecionavel'
  tags: string[]
  disponivel: boolean
}

export const produtos: Produto[] = [
  {
    id: 'camiseta-sarau-1',
    nome: 'Camiseta Sarau Secreto — Logo',
    descricao: 'Camiseta oversized em algodão orgânico preto com o logo do Sarau Secreto em dourado. Serigrafia artesanal. Modelagem unissex.',
    preco: 'R$ 129,00',
    imagem: '',
    categoria: 'vestuario',
    tags: ['camiseta', 'algodao', 'logo'],
    disponivel: true,
  },
  {
    id: 'camiseta-sarau-2',
    nome: 'Camiseta Sarau Secreto — Jazz Club',
    descricao: 'Estampa exclusiva com ilustração de trompete e partitura. Gola careca, algodão penteado 30.1.',
    preco: 'R$ 139,00',
    imagem: '',
    categoria: 'vestuario',
    tags: ['camiseta', 'jazz', 'ilustracao'],
    disponivel: true,
  },
  {
    id: 'moletom-sarau-1',
    nome: 'Moletom Sarau Secreto — Edição Limitada',
    descricao: 'Moletom com capuz, forro quentinho, bolso canguru e bordado dourado do símbolo do Sarau. Tiragem limitada de 100 unidades.',
    preco: 'R$ 249,00',
    imagem: '',
    categoria: 'vestuario',
    tags: ['moletom', 'edicao-limitada', 'bordado'],
    disponivel: true,
  },
  {
    id: 'bone-sarau-1',
    nome: 'Boné Sarau Secreto — Dad Fit',
    descricao: 'Boné aba reta com ajuste tic-tac. Logo frontal bordado em relevo dourado. Aba curva personalizada.',
    preco: 'R$ 99,00',
    imagem: '',
    categoria: 'vestuario',
    tags: ['bone', 'dad-fit', 'bordado'],
    disponivel: true,
  },
  {
    id: 'ecobag-sarau-1',
    nome: 'Ecobag Sarau Secreto — Leve a Noite',
    descricao: 'Sacola retornável em algodão cru com frase "Leve a Noite com Você" e ilustração de lua crescente.',
    preco: 'R$ 49,00',
    imagem: '',
    categoria: 'acessorio',
    tags: ['ecobag', 'sustentavel', 'algodao'],
    disponivel: true,
  },
  {
    id: 'caneca-sarau-1',
    nome: 'Caneca Sarau Secreto — Café da Manhã',
    descricao: 'Caneca de cerâmica preta com detalhe interno dourado. O verso diz: "A noite foi boa, o café que pague."',
    preco: 'R$ 69,00',
    imagem: '',
    categoria: 'colecionavel',
    tags: ['caneca', 'ceramica', 'humor'],
    disponivel: true,
  },
  {
    id: 'poster-sarau-1',
    nome: 'Pôster Sarau Secreto — Série Cartográfica',
    descricao: 'Mapa ilustrado dos locais secretos que já sediaram o Sarau. Impressão fine art em papel 300g. 50x70cm.',
    preco: 'R$ 89,00',
    imagem: '',
    categoria: 'colecionavel',
    tags: ['poster', 'cartografia', 'fine-art'],
    disponivel: true,
  },
  {
    id: 'adesivo-sarau-1',
    nome: 'Kit Adesivos Sarau Secreto',
    descricao: '6 adesivos vinil cortados com designs variados: logo, trompete, máscara, lua, etc. Resistentes à água.',
    preco: 'R$ 25,00',
    imagem: '',
    categoria: 'acessorio',
    tags: ['adesivo', 'kit', 'vinil'],
    disponivel: true,
  },
  {
    id: 'disco-sarau-1',
    nome: 'Vinil ao Vivo — Sarau Secreto Vol. 1',
    descricao: 'Gravação ao vivo da primeira edição do Sarau. Artistas convidados, poesia musicada e improvisos. Prensagem limitada 300 cópias.',
    preco: 'R$ 159,00',
    imagem: '',
    categoria: 'colecionavel',
    tags: ['vinil', 'musica', 'ao-vivo', 'colecao'],
    disponivel: false,
  },
]
