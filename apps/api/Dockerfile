FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9

WORKDIR /app

# Instalar dependencias primero (cache layer)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Generar cliente Prisma
RUN pnpm --filter @eira/api exec prisma generate

ENV NODE_ENV=production
EXPOSE 3001

CMD ["pnpm", "--filter", "@eira/api", "start"]
