export interface Artista {
  id: string
  nome: string
  foto: string
  bio: string
  estilo: string
  redes?: { instagram?: string }
  destaque?: boolean
}

export const artistas: Artista[] = [
  { id: 'sandra-de-sa', nome: 'Sandra de Sá', foto: '', bio: 'Uma das vozes mais marcantes da MPB. Cantora e compositora com décadas de carreira, dona de hits que atravessam gerações.', estilo: 'MPB / Soul', redes: { instagram: '@sandradesa' }, destaque: true },
  { id: 'luedji-luna', nome: 'Luedji Luna', foto: '', bio: 'Cantora e compositora baiana que conquistou o Brasil com sua mistura de MPB, soul e afrobeat. Voz que carrega ancestralidade e pertencimento.', estilo: 'MPB / Soul / Afrobeat', redes: { instagram: '@luedjiluna' }, destaque: true },
  { id: 'jotape', nome: 'Jotapê', foto: '', bio: 'Rapper e compositor paulista, referência no rap nacional contemporâneo. Letras que cortam fundo.', estilo: 'Rap / Hip-Hop', redes: { instagram: '@jotape' }, destaque: true },
  { id: 'fat-family', nome: 'Fat Family', foto: '', bio: 'Grupo vocal icônico da música brasileira. Soul, gospel e R&B em harmonia que emociona.', estilo: 'Soul / Gospel / R&B', destaque: true },
  { id: 'os-garotin', nome: 'Os Garotin', foto: '', bio: 'Banda carioca que mistura samba, funk e MPB com uma energia contagiante. Sucesso crescente na cena independente.', estilo: 'Samba / MPB / Funk', redes: { instagram: '@osgarotin' } },
  { id: 'jean-tassy', nome: 'Jean Tassy', foto: '', bio: 'Cantor e compositor paraense dono de um som único que transita entre MPB, soul e R&B contemporâneo.', estilo: 'MPB / Soul / R&B', redes: { instagram: '@jeantassy' } },
  { id: 'marvyn', nome: 'Marvyn', foto: '', bio: 'Cantor e compositor, um dos idealizadores do Sarau Secreto. Voz marcante e presença de palco que guia a noite.', estilo: 'MPB / Soul', redes: { instagram: '@marvyn' }, destaque: true },
  { id: 'israel-paixao', nome: 'Israel Paixão', foto: '', bio: 'Cantor e instrumentista baiano radicado em Brasília. Voz potente que transita entre samba, MPB e soul.', estilo: 'Samba / MPB / Soul' },
  { id: 'bell-lins', nome: 'Bell Lins', foto: '', bio: 'Cantor e compositor brasiliense com pegada pop e R&B. Voz que conecta a nova cena da capital.', estilo: 'Pop / R&B' },
  { id: 'laady-b', nome: 'Laady B', foto: '', bio: 'Cantora e performer que domina o palco com presença magnética. Mistura de pop, R&B e música preta brasileira.', estilo: 'Pop / R&B', destaque: true },
  { id: 'cecilia-marcos', nome: 'Cecília Marcos', foto: '', bio: 'Cantora brasiliense de voz doce e letras potentes. MPB com pegada contemporânea.', estilo: 'MPB', redes: { instagram: '@ceciliamarcos' } },
  { id: 'gabi-blue', nome: 'Gabi Blue', foto: '', bio: 'Voz da nova cena de Brasília. Mistura de R&B, MPB e soul com letras que falam de afeto e identidade.', estilo: 'R&B / MPB / Soul' },
  { id: 'nat-telles', nome: 'Nat Telles', foto: '', bio: 'Cantora e compositora de voz aveludada. Navega entre MPB, jazz e soul com naturalidade.', estilo: 'MPB / Jazz / Soul' },
  { id: 'vitu-voz', nome: 'Vitu Voz', foto: '', bio: 'Cantor e compositor da nova geração de Brasília. Voz marcante e presença de palco que arrebata.', estilo: 'MPB / Soul', destaque: true },
]

export const curadoriaAreas = [
  { titulo: 'Curadoria Musical', descricao: '25+ artistas por edição, uma banda, zero ensaio. A direção musical de Todd Henrique resolve tudo ao vivo, em tempo real. NeoSoul, R&B, MPB, Samba, Jazz, Gospel, Samba-Rock, Pop — tudo cabe no palco do Sarau.', icone: 'music' },
  { titulo: 'Curadoria de Artistas', descricao: 'Diversidade, representatividade e inclusão no centro do palco. O Sarau abre espaço para quem a cena musical sempre negligenciou — artistas independentes, vozes periféricas e talentos emergentes.', icone: 'palette' },
  { titulo: 'Experiência Única', descricao: 'Nenhuma edição se repete. Data, local e lineup são surpresa até o dia. Cada sarau é uma obra efêmera — música ao vivo sem ensaio, repertório autoral e clássicos revisitados.', icone: 'sparkles' },
  { titulo: 'Acesso Democrático', descricao: 'Preços acessíveis e espaços que acolhem. O Sarau Secreto é para todos, sem barreiras de entrada. Arte não tem preço mínimo pra existir.', icone: 'heart' },
]
