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
  { id: 'camiseta-sarau-1', nome: 'Camiseta Sarau Secreto — Logo', descricao: 'Camiseta oversized em algodão orgânico preto com o logo do Sarau Secreto em dourado. Serigrafia artesanal. Modelagem unissex.', preco: 'R$ 129,00', imagem: '', categoria: 'vestuario', tags: ['camiseta', 'algodao', 'logo'], disponivel: false },
  { id: 'camiseta-sarau-2', nome: 'Camiseta Sarau Secreto — Edição 2025', descricao: 'Estampa exclusiva da edição 2025 com ilustração de palco e público. Gola careca, algodão penteado 30.1.', preco: 'R$ 139,00', imagem: '', categoria: 'vestuario', tags: ['camiseta', 'edicao-2025', 'ilustracao'], disponivel: false },
  { id: 'moletom-sarau-1', nome: 'Moletom Sarau Secreto', descricao: 'Moletom com capuz, forro quentinho, bolso canguru e bordado dourado do símbolo do Sarau.', preco: 'R$ 249,00', imagem: '', categoria: 'vestuario', tags: ['moletom', 'bordado'], disponivel: false },
  { id: 'bone-sarau-1', nome: 'Boné Sarau Secreto — Dad Fit', descricao: 'Boné aba reta com ajuste tic-tac. Logo frontal bordado em relevo dourado.', preco: 'R$ 99,00', imagem: '', categoria: 'vestuario', tags: ['bone', 'dad-fit', 'bordado'], disponivel: false },
  { id: 'ecobag-sarau-1', nome: 'Ecobag Sarau Secreto', descricao: 'Sacola retornável em algodão cru com frase "A experiência musical mais exclusiva do Brasil" e ilustração de lua.', preco: 'R$ 49,00', imagem: '', categoria: 'acessorio', tags: ['ecobag', 'sustentavel', 'algodao'], disponivel: false },
  { id: 'caneca-sarau-1', nome: 'Caneca Sarau Secreto', descricao: 'Caneca de cerâmica preta com detalhe interno dourado. O verso diz: "Acontece quando menos se espera."', preco: 'R$ 69,00', imagem: '', categoria: 'colecionavel', tags: ['caneca', 'ceramica'], disponivel: false },
  { id: 'poster-sarau-1', nome: 'Pôster Sarau Secreto — Série Cartográfica', descricao: 'Mapa ilustrado dos locais que já sediaram o Sarau: Brasília, Rio e Lisboa. Impressão fine art 50x70cm.', preco: 'R$ 89,00', imagem: '', categoria: 'colecionavel', tags: ['poster', 'cartografia', 'fine-art'], disponivel: false },
  { id: 'kit-adesivo-sarau-1', nome: 'Kit Adesivos Sarau Secreto', descricao: '6 adesivos vinil cortados com designs variados: logo SS, palco, lua, máscara, etc. Resistentes à água.', preco: 'R$ 25,00', imagem: '', categoria: 'acessorio', tags: ['adesivo', 'kit', 'vinil'], disponivel: false },
  { id: 'disco-sarau-1', nome: 'Vinil — Sarau Secreto ao Vivo', descricao: 'Gravação ao vivo com artistas que passaram pelo Sarau. Prensagem limitada.', preco: 'R$ 159,00', imagem: '', categoria: 'colecionavel', tags: ['vinil', 'ao-vivo', 'colecao'], disponivel: false },
]
