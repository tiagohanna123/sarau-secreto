# Plano de Modernizacao — Sarau Secreto
## Novas Fontes de Receita Alem de Bar e Ingressos

Criado: 17/07/2026
Revisado: 17/07/2026 — alinhado aos 4 pilares de Tiago

---

## Situacao Atual

- Evento mensal, 700-1.200 pessoas, publico presencial recorrente
- Receita hoje: bar (via Yuzer) + ingressos (via Sympla)
- Infra existente: dashboard de insights, Yuzer + Sympla com cron, PIX do Mural
  Digital, Khem como parceiro, 34 eventos historicos com dados
- O publico ja gasta, a infra ja existe — falta monetizar alem do obvio

---

## Os 4 Pilares (definidos por Tiago)

```
1. INVENTARIO DE PUBLICIDADE     — espacos de marca dentro e fora do evento
2. CURADORIA DE ARTISTAS         — do palco ao catalogo comercial
3. INGRESSOS VIP                 — segmentacao do publico pagante
4. YOUTUBE                       — conteudo como ativo de receita
```

---

## PILAR 1 — Inventario de Publicidade

O Sarau tem espacos de atencao que hoje sao gratis. Cada um pode ser precificado
e vendido como midia para marcas que querem atingir o publico do evento.

### 1.1 Drink da noite patrocinado (Fase 0)

O que: marca de destilado, energetico ou cerveja paga para ser o drink oficial
do evento. Nome no cardapio, copo personalizado, degustacao na entrada.
Infra: Yuzer ja tem categorias de produto. Criar "patrocinio" no sistema.
Por que: custo zero de execucao (marca entrega o produto). Publico qualificado
de 1000 pessoas/mes.
Meta: R$ 2.000-5.000/evento.

### 1.2 Espaco de marca no palco/lounge (Fase 0)

O que: banner, backdrop, ou projecao com logo da marca durante o evento.
Disponivel em 3 niveis:
- Bronze: logo no backdrop do palco + mencao no Instagram — R$ 1.500
- Prata: tudo do bronze + copo personalizado + degustacao — R$ 3.500
- Ouro: tudo do prata + area lounge com marca + post dedicado — R$ 7.000
Infra: impressoras de banner, adesivo de copo.
Por que: marca quer estar onde o publico esta. O Sarau ja tem o publico.
Meta: 2-3 cotas por evento = R$ 5.000-15.000/evento.

### 1.3 Playlist mensal patrocinada (Fase 1)

O que: playlist oficial no Spotify com os artistas que tocaram na edicao.
Marca patrocina (watermark no titulo, descricao). Publico leva a experiencia
pra casa e ouve na semana seguinte.
Infra: artistas ja cadastrados no sistema, generos mapeados.
Por que: custo zero (playlist ja existe, so nao esta formalizada).
Meta: R$ 1.000-3.000/mes por playlist.

### 1.4 Mencao paga no Instagram Stories (Fase 1)

O que: marca paga para aparecer nos stories do Sarau durante a semana do
evento. Formato: "Hoje o drink e por conta da [marca]" + link.
Por que: publico do Instagram do Sarau e engajado e segmentado.
Custo marginal zero (stories ja sao feitos todo mes).
Meta: R$ 500-1.500 por story patrocinado. 4-8 vendas/mes.

### 1.5 Dados de consumo anonimizados (Fase 3)

O que: Sarau tem dados de (a) que generos musicais funcionam com que publico,
(b) horarios de pico de consumo, (c) correlacao entre musica e consumo de bar.
Marcas e gravadoras pagam por esses insights.
Infra: dashboard com 34 eventos historicos de dados.
Por que: mercado fonografico e de eventos carece de dados reais de consumo
presencial. Sarau tem isso. Dado anonimizado nao expoe o publico.
Meta: R$ 5.000-15.000 por relatorio de tendencia. 2-4 vendas/ano.

---

## PILAR 2 — Curadoria de Artistas

O Sarau ja descobre, testa e valida artistas ao vivo todo mes. Isso e um
ativo que pode gerar receita alem da bilheteria.

### 2.1 Catalogo Curadoria Sarau no Khem (Fase 1)

O que: artistas que se destacaram no Sarau entram num catalogo "Curadoria
Sarau" dentro do Khem. Cada artista com video, bio, precos. Empresas contratam
para eventos corporativos, casamentos, festas privadas.
Infra: Khem ja e parceiro do Sarau (landing de parceiro existe). Tem sistema
de booking, perfis de artista, pagamentos.
Por que: Sarau faz a curadoria (descobre, testa, valida). Khem faz a venda.
Sarau ganha sem trabalho operacional. Artista ganha mais um canal.
Meta: 10-15% comissao. 3-5 bookings/mes de R$ 2.000-5.000 = R$ 1.000-3.000/mes.

### 2.2 Show-case mensal para contratantes (Fase 2)

O que: uma edicao por trimestre onde o Sarau convida contratantes
(empresas, agencias, produtoras) para assistir aos artistas AO VIVO.
Funciona como "feira de artistas" dentro do evento normal.
Infra: o evento ja existe. So criar um lote de convites para contratantes.
Por que: o melhor argumento de venda de um artista e ve-lo ao vivo.
O Sarau ja tem o palco. So abrir para quem paga.
Meta: 10 contratantes/edicao. Se 30% fecha contrato de R$ 3.000 em media,
comissao de 15% = R$ 1.350/edicao.

### 2.3 Selo de curadoria Sarau (Fase 3)

O que: criar um selo "Curadoria Sarau" que artistas podem usar em seus
materiais de divulgacao (como certificacao de qualidade). Selo basico
(gratuito para quem tocou) e selo premium (pago, com destaque no catalogo).
Meta: selo premium a R$ 200-500/ano. 20-30 artistas = R$ 6.000-10.000/ano.

---

## PILAR 3 — Ingressos VIP

Segmentar o publico pagante para extrair mais valor de quem pode/com mais.

### 3.1 Lote VIP basico (Fase 0)

O que: lote limitado (50-100 ingressos) com:
- Entrada prioritaria (fila separada)
- Copo exclusivo (nao e o copo comum)
- Drink de boas-vindas
- Area com melhor visao do palco
Infra: Sympla ja vende ingressos. Criar nova categoria.
Por que: mesmo drink, mesmo copo, mesma area — so entregue para menos
pessoas. Margem pura.
Meta: 50 ingressos VIP a R$ 80 (vs R$ 30 normal) = R$ 2.500 extras/evento.

### 3.2 Lote VIP experiencia (Fase 1)

O que: lote super-limitado (10-20 ingressos) com:
- Tudo do VIP basico
- Meet & greet com artistas depois do show
- Foto oficial com o line-up
- Camisa exclusiva do evento
- Nome nos creditos do video do YouTube
Infra: Sympla + producao do evento.
Por que: cria um objeto de desejo. Experiencias sao mais valiosas que
produtos. O custo marginal e baixo (camisa + 15 min de meet & greet).
Meta: 15 ingressos a R$ 150 = R$ 2.250 extras/evento.

### 3.3 Mesa reservada (Fase 2)

O que: mesas para grupos de 4-6 pessoas com visao privilegiada, garcom
dedicado, e consumo minimo. Modelo de balada/casa noturna.
Infra: espaco fisico do evento. Precisa de delimitacao de area.
Por que: o publico do Sarau ja tem poder de consumo (gasta no bar).
Quem vem em grupo quer sentar junto. Mesa com reserva resolve e
garante consumo minimo.
Meta: 5 mesas a R$ 100 de reserva + consumo minimo de R$ 150/pessoa.

---

## PILAR 4 — YouTube

Transformar o conteudo do evento em ativo de receita digital.

### 4.1 Canal Sarau Secreto (Fase 1)

O que: canal no YouTube com:
- Melhores momentos de cada edicao
- Apresentacao completa dos artistas (com autorizacao)
- Bastidores (preparacao, making of)
- Entrevistas curtas com artistas ("3 perguntas antes do palco")
Infra: camera ja cobre o evento (fotografo/videomaker). Edicao e o
gargalo.
Por que: o Sarau gera conteudo todo mes que morre no Instagram (24h).
YouTube e perpetuo. Um video de 2025 pode ser descoberto em 2028.
Meta: 2 videos/edicao (1 highlight + 1 artista em destaque).

### 4.2 YouTube Partner Program (Fase 2)

O que: monetizar o canal com ads do YouTube quando atingir 1.000 inscritos
e 4.000 horas de visualizacao.
Infra: videos publicados consistentemente.
Por que: receita passiva. Cada video continua gerando dinheiro enquanto
existir.
Meta: R$ 500-2.000/mes depois de 6-12 meses de publicacao consistente.
Depende: views por video.

### 4.3 Conteudo patrocinado no YouTube (Fase 2)

O que: marca paga para aparecer no video: "Esse momento e dedicado a
[marca]" no meio do video, ou product placement no backstage, ou
"esse video e trazido por [marca]" na abertura.
Meta: R$ 2.000-5.000 por video patrocinado. 1-2 videos/mes.

### 4.4 Live do evento (Fase 3)

O que: transmitir o evento ao vivo pelo YouTube. Ingresso digital para
assistir online (pay-per-view) ou gratuito com doacao via Super Chat.
Por que: publico que nao pode ir presencialmente ainda quer ver.
E tambem: amigos e familiares dos artistas querem assistir.
Meta: R$ 5-10 por ingresso digital. Se 200 viewers = R$ 1.000-2.000/evento.

### 4.5 Catalogo de artistas no YouTube (Fase 3)

O que: cada artista que toca no Sarau ganha um video profissional no
canal. O video vira referencia para contratacoes. O artista divulga
o video para seus seguidores = trafego gratuito pro canal do Sarau.
Por que: todo artista quer material profissional. O Sarau produz.
Todo artista tem seguidores. O Sarau ganha views.
Meta: circulo virtuoso — mais views = mais inscritos = mais receita.

---

## Resumo Financeiro (estimativa com 1 evento/mes)

| Pilar | Fonte | Fase | Receita/mes | Esforco |
|---|---|---|---|---|
| Publicidade | Drink patrocinado | 0 | R$ 3.500 | Baixo |
| Publicidade | Espaco de marca (2 cotas) | 0 | R$ 7.000 | Baixo |
| Ingressos VIP | Lote VIP basico | 0 | R$ 2.500 | Baixo |
| Publicidade | Playlist patrocinada | 1 | R$ 2.000 | Baixo |
| Publicidade | Stories patrocinados | 1 | R$ 4.000 | Baixo |
| Curadoria | Catalogo Khem (3 bookings) | 1 | R$ 1.500 | Baixo |
| Ingressos VIP | VIP experiencia | 1 | R$ 2.250 | Baixo |
| YouTube | Canal + ads | 2 | R$ 1.000 | Medio |
| YouTube | Conteudo patrocinado | 2 | R$ 3.500 | Medio |
| Publicidade | Dados anonimizados | 3 | R$ 2.500 | Alto |
| Curadoria | Show-case contratantes | 2 | R$ 1.350 | Medio |
| YouTube | Live PPV | 3 | R$ 1.500 | Alto |
| **TOTAL** | | | **R$ 32.600/mes** | |

Distribuicao por pilar:
- Publicidade: R$ 19.000/mes (58%)
- Ingressos VIP: R$ 4.750/mes (15%)
- Curadoria: R$ 2.850/mes (9%)
- YouTube: R$ 6.000/mes (18%)

---

## Mapa de implementacao recomendado

### Mes 1 — Fase 0 (proximo evento, sem codigo novo)
- Drink patrocinado — contatar marcas
- Espaco de marca (3 niveis) — criar tabela de precos
- Lote VIP basico — configurar no Sympla

### Mes 2 — Fase 1 (1-2 semanas de dev cada)
- Playlist patrocinada — criar conta Spotify Sarau
- Stories patrocinados — tabela de precos + exemplos
- Catalogo Khem — cadastrar primeiros artistas
- VIP experiencia — configurar no Sympla
- Canal YouTube — publicar primeiros 2 videos

### Mes 3-4 — Fase 2
- Conteudo patrocinado YouTube — buscar marcas
- Show-case contratantes — planejar primeira edicao
- YouTube Partner Program — acelerar inscritos

### Mes 6+ — Fase 3
- Dados anonimizados — preparar primeiro relatorio
- Live PPV — testar infraestrutura de streaming
- Selo Sarau — formalizar

---

## Proximo passo

Qual pilar voce quer atacar primeiro? Minha sugestao: comeca com o que
da mais retorno com menos esforco — Publicidade (drink patrocinado +
espaco de marca) roda no PROXIMO evento sem codigo. Depois VIP
(so configurar categoria no Sympla) e YouTube (publicar o que ja
grava mas nao usa).
