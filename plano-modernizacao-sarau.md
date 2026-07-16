# Plano de Modernizacao — Sarau Secreto
## Novas Fontes de Receita Alem de Bar e Ingressos

Criado: 17/07/2026
Status: Kickstart — aprovado para execucao

---

## Situacao Atual

- Evento mensal, 700-1.200 pessoas, publico presencial recorrente
- Receita hoje: bar (via Yuzer) + ingressos (via Sympla)
- Infra existente: dashboard de insights, Yuzer + Sympla com cron, PIX do Mural Digital, Khem como parceiro, 34 eventos historicos com dados
- O publico ja gasta, a infra ja existe — falta monetizar alem do obvio

---

## FASE 0 — Imediato (proximo evento, sem codigo novo)

### 0.1 Credito de bar antecipado
O que: publico compra credito via PIX antes do evento, ganha bonus de 15-20%.
Chega no evento com saldo pronto em pulseira/QR code. Nao precisa de maquineta,
fila ou dinheiro vivo.
Infra: PIX EMV + QR Code do Mural Digital (adaptar landing para Sarau).
Por que: capturar dinheiro ANTES do evento = caixa positivo antes de comecar.
Bonus incentiva a comprar mais do que gastaria normalmente.
Meta: 30% do publico compra R$ 50 medio = R$ 12.500/evento.
Responsavel: usar Mural Digital como template. Criar pagina Sarau com
creditos pre-definidos (R$ 25, R$ 50, R$ 100).

### 0.2 Drink da noite patrocinado
O que: marca de destilado, energetico ou cerveja paga para ser o drink oficial
do evento. Nome no cardapio, copo personalizado, degustacao na entrada.
Infra: Yuzer ja tem categorias de produto. Criar "patrocinio" no sistema.
Por que: custo zero de execucao (marca entrega o produto). Publico qualificado
de 1000 pessoas/mes.
Meta: R$ 2.000-5.000/evento.
Responsavel: contato comercial com marcas locais (Cachaçaria, Heineken, etc.).

### 0.3 Lote VIP — ingresso + experiencia
O que: lote limitado (50-100 ingressos) com entrada prioritária, copo exclusivo,
drink de boas-vindas, area com melhor visao.
Infra: Sympla ja vende ingressos. Criar nova categoria de ingresso.
Por que: mesmo drink, mesmo copo, mesma area — so entregue para menos pessoas.
Margem pura.
Meta: 50 ingressos VIP a R$ 80 (vs R$ 30 normal) = R$ 2.500 extras/evento.
Responsavel: configurar nova categoria no Sympla. Ajustar precos.

---

## FASE 1 — Curto Prazo (1-2 semanas de implementacao)

### 1.1 Loja de credito digital no site do Sarau
O que: pagina no site onde o publico compra credito de bar, ingresso VIP,
ou combo (ingresso + credito). Tudo via PIX. Chega no evento e usa.
Infra: codigo PIX do Mural Digital adaptado para o site Sarau (React).
Dados de evento ja existem no dashboard.
Por que: transforma o site de "info do evento" em plataforma de commerce.
Meta: 30-40% do publico comprando algo antes = R$ 20.000-30.000 de pre-sale/evento.
Arquivos: criar pagina em /app/src/app/pre-sale/ com catalogo de creditos + PIX.

### 1.2 Cashless integrado ao dashboard
O que: pulseira ou QR code como carteira digital do evento. Publico carrega
antes (PIX) ou durante (QR na mesa). Dashboard mostra gasto em tempo real.
Infra ja existe: dashboard, API de insights, Yuzer, dados de bar.
O cashless adiciona: dados EM TEMPO REAL, upsell no momento certo
("compre mais R$ 20 e ganhe um shot"), perfil de consumo por pessoa.
Por que: dados hoje sao pos-evento. Cashless da dados durante o evento.
Permite campanhas no meio do evento e fidelidade automatica.
Meta: aumento de 15-25% no ticket medio de bar (R$ 35 para R$ 42-45).
Dependencia: leitores QR code nas maquinetas (baixo custo).

### 1.3 Playlist mensal patrocinada
O que: playlist oficial no Spotify com artistas que tocaram na edicao.
Marca patrocina (watermark no titulo, descricao). Publico leva a experiencia
pra casa e ouve na semana seguinte.
Infra: artistas ja cadastrados no sistema, generos mapeados.
Por que: custo zero. A playlist ja existe, so nao esta formalizada.
Meta: R$ 1.000-3.000/mes.
Responsavel: criar playlist no Spotify da conta do Sarau.

---

## FASE 2 — Medio Prazo (1-2 meses)

### 2.1 Clube de Assinatura Sarau Secreto
O que: R$ 29-49/mes. Beneficios:
- Acesso prioritario a ingresso (nao precisa acordar pra comprar)
- 10% de desconto no bar
- Conteudo exclusivo (bastidores, entrevistas com artistas)
- Playlist fechada
- Um drink gratis por evento
Infra: dashboard de usuarios ja existe. Integracao PIX para recorrencia.
Por que: publico RECORRENTE (vai todo mes). Assinatura transforma visitante
em membro. Receita recorrente e ouro para qualquer negocio.
Meta: 5-10% do publico assina = R$ 2.000-4.000/mes recorrente.

### 2.2 Curadoria de artistas para eventos corporativos (via Khem)
O que: Sarau descobre e testa artistas ao vivo todo mes. Os melhores viram
catalogo "Curadoria Sarau" no Khem. Empresa contrata artista para evento
corporativo via Khem com selo Sarau. Sarau ganha comissao.
Infra: Khem ja e parceiro do Sarau (landing de parceiro existe).
Tem sistema de booking, perfis de artista, pagamentos.
Por que: Sarau faz a curadoria (descobre, testa, valida). Khem faz a venda.
Sarau ganha sem trabalho operacional. Artista ganha mais um canal.
Meta: 10-15% comissao. 3 bookings/mes de R$ 3.000 = R$ 900-1.350/mes.

### 2.3 Venda de fotos profissionais do evento
O que: fotografo cobre o evento. Publico ve as fotos em album online
(Nubium, SmugMug, ou sistema proprio). Compra digital (R$ 10-20)
ou impressao (R$ 30-50).
Infra: simples — album externo + link no Instagram/WhatsApp do evento.
Por que: todo mundo quer foto bonita do evento. Fotografo ja esta la.
Custo marginal proximo de zero.
Meta: 10-20% do publico compra 1 foto = R$ 2.000-4.000/evento.

---

## FASE 3 — Longo Prazo (3+ meses, investimento)

### 3.1 Sarau Cashless proprio (pulseira NFC)
O que: pulseira RFID/NFC como carteira digital. Carrega antes ou durante.
Leitor nas maquinetas do bar. Dado em tempo real no dashboard.
Por que: cada pulseira e um perfil de consumo. Dados permitem saber exatamente
quem gasta quanto, campanhas personalizadas no evento, fidelidade automatica.
Fora que reduz fila e roubo.
Investimento: R$ 3.000-8.000 em leitores + pulseiras.
ROI: 40 eventos/ano com aumento de 20% no ticket medio de bar = retorno em 2-3 meses.

### 3.2 Marketplace de artistas revelados pelo Sarau
O que: artistas que se destacaram no Sarau entram em catalogo online com
video, bio, precos. Qualquer contratante contrata direto. Sarau ganha comissao.
Infra: Khem ja faz isso. Seria vertical especifica do Sarau dentro do Khem.
Por que: Sarau e uma vitrine ao vivo. Transformar em catalogo comercial
e o passo logico. Artista sai do Sarau com mais trabalho.
Meta: 15-20% comissao. 5 contratacoes/mes de R$ 2.000 = R$ 1.500-2.000/mes.

### 3.3 Dados de consumo musical anonimizados
O que: Sarau tem dados de que generos funcionam com que publico, horarios
de pico, correlacao entre musica e consumo de bar. Marcas e gravadoras
pagam por esses insights.
Infra: dashboard com 34 eventos historicos de dados.
Por que: mercado fonografico e de eventos carece de dados reais de consumo
presencial. Sarau tem isso. Dado anonimizado nao expoe o publico.
Meta: R$ 5.000-15.000 por relatorio de tendencia. 2-4 vendas/ano.

---

## Resumo Financeiro (estimativa com 1 evento/mes)

| Fonte | Fase | Receita/mes | Esforco | Implementacao |
|---|---|---|---|---|
| Credito bar antecipado | 0 | R$ 12.500 | Baixo | Adaptar PIX existente |
| Drink patrocinado | 0 | R$ 3.000 | Baixo | Contato comercial |
| Lote VIP | 0 | R$ 2.500 | Baixo | Categoria nova no Sympla |
| Cashless integrado | 1 | +R$ 7.000 | Medio | QR code + integracao dashboard |
| Loja de credito (site) | 1 | R$ 12.000 | Medio | Pagina React + PIX |
| Playlist patrocinada | 1 | R$ 2.000 | Baixo | Criar playlist |
| Assinatura Sarau | 2 | R$ 2.000 | Medio | Sistema de assinatura |
| Curadoria Khem | 2 | R$ 1.100 | Baixo | Catalogo no Khem |
| Fotos do evento | 2 | R$ 3.000 | Baixo | Album externo |
| **TOTAL** | | **R$ 45.100/mes** | | |

O Sarau hoje fatura apenas bar + ingresso. Essas 12 frentes adicionam
~R$ 45.000/mes sem aumentar o tamanho do evento — so monetizando melhor
o mesmo publico e a mesma infraestrutura.

---

## Proximo passo

Escolher qual fase comecar. Sugiro Fase 0 para o proximo evento:
as 3 frentes sao testaveis imediatamente e geram impacto visivel.
A partir do resultado, a Fase 1 constroi em cima da estrutura de
pre-sale e dados em tempo real.
