#!/bin/bash
cd /home/ser/projetos/sarau-secreto-novo/app/packages/api
export DATABASE_URL="file:$(pwd)/prisma/dev.db"
export JWT_SECRET="dev-secret-change-me"
export PORT=3004
# SYMPLA_TOKEN is loaded from .env by dotenv in index.ts
exec npx tsx src/index.ts
