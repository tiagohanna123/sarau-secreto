# Sarau Secreto — Painel de Gestão

[![CI](https://github.com/tiagohanna123/sarau-secreto/actions/workflows/ci.yml/badge.svg)](https://github.com/tiagohanna123/sarau-secreto/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](CHANGELOG.md)

> Dashboard analítico completo para o **Sarau Secreto**, evento mensal de jazz/MPB em Brasília.

---

## 📊 Dados do Evento

- **9 eventos** monitorados (set/2025 → abr/2026)
- **6.896 ingressos** vendidos | **R$ 322 mil** em bilheteria
- **R$ 91 mil** em receita de bar | **3.347 clientes únicos**
- Taxa de no-show: **19,2%** | LTV médio: **R$ 92,16**

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 |
| Build | Vite 6 |
| Estilo | Tailwind CSS v4 |
| Gráficos | Recharts 2 |
| API | Fastify 5 + Prisma + PostgreSQL |
| Deploy | Cloudflare Pages |

## 🚀 Quick Start

```bash
cd app
npm install
npm run dev          # Frontend Vite
npm run dev:api      # API backend (Fastify)
npm run dev:all      # Ambos simultaneamente
```

## 📋 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server Vite |
| `npm run dev:api` | Dev server API |
| `npm run dev:all` | Frontend + API |
| `npm run build` | Build de produção |
| `npm test` | Testes (Vitest) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## 🏗️ Estrutura

```
app/
├── src/            # Frontend React
├── packages/api/   # API Fastify
├── scripts/        # Build e dados
├── tests/          # Testes
└── dist/           # Build output
```

## 📄 Licença

MIT — veja [LICENSE](LICENSE).
