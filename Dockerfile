# Multi-stage build para otimizar o tamanho da imagem final
FROM node:20-alpine AS builder

# Instalar dependências necessárias para build
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (todas, incluindo dev deps para o build)
RUN npm ci --ignore-scripts && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS production

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Instalar dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init curl

# Definir diretório de trabalho
WORKDIR /app

# Copiar dependências de produção do estágio builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar aplicação buildada
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Expor porta
EXPOSE 3001

# Mudar para usuário não-root
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Comando de inicialização com dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
