# Dockerfile para o Backend AulaPronta
FROM node:20-alpine

# Metadata
LABEL maintainer="Equipe AulaPronta"
LABEL description="Backend da plataforma AulaPronta"

# Diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia o código fonte
COPY . .

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Muda ownership dos arquivos
RUN chown -R nodejs:nodejs /app

# Usa o usuário não-root
USER nodejs

# Expõe a porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
