# 🚀 Guia de Deployment - AulaPronta Backend

Este guia fornece instruções detalhadas para fazer o deploy do backend AulaPronta em diferentes ambientes de produção.

## 📋 Índice

- [Pré-requisitos](#-pré-requisitos)
- [Preparação](#-preparação)
- [Deploy com Docker](#-deploy-com-docker)
- [Deploy em Cloud Providers](#-deploy-em-cloud-providers)
  - [AWS](#aws-amazon-web-services)
  - [Google Cloud](#google-cloud-platform)
  - [Azure](#microsoft-azure)
  - [Heroku](#heroku)
  - [Railway](#railway)
  - [Render](#render)
- [Configuração de MongoDB](#-configuração-de-mongodb)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Segurança em Produção](#-segurança-em-produção)
- [Monitoramento](#-monitoramento)
- [CI/CD](#-cicd)
- [Troubleshooting](#-troubleshooting)

---

## ✅ Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

- [ ] Conta em um provedor de cloud (AWS, GCP, Azure, Heroku, etc.)
- [ ] Banco de dados MongoDB configurado (Atlas, EC2, ou managed service)
- [ ] Domínio personalizado (opcional, mas recomendado)
- [ ] Certificado SSL (Let's Encrypt ou provedor)
- [ ] Conhecimento básico de CI/CD
- [ ] Ferramentas instaladas: Docker, Git, Node.js

---

## 🔧 Preparação

### 1. Configure as Variáveis de Ambiente

Crie um arquivo `.env.production`:

```env
# Servidor
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/aulapronta?retryWrites=true&w=majority

# JWT
JWT_SECRET=sua_chave_secreta_super_strong_mudada_em_producao
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://seu-dominio.com.br

# Logs (opcional)
LOG_LEVEL=info

# Sentry (opcional)
SENTRY_DSN=https://sentry.io/sua-chave
```

### 2. Build do Projeto

```bash
# Instalar dependências de produção
npm ci --only=production

# Verificar se tudo está funcionando
npm test
```

### 3. Otimizações para Produção

#### package.json
```json
{
  "scripts": {
    "start": "node src/server.js",
    "start:prod": "NODE_ENV=production node src/server.js"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

## 🐳 Deploy com Docker

### Dockerfile Otimizado para Produção

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Production stage
FROM node:20-alpine

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código da aplicação
COPY --chown=nodejs:nodejs . .

# Usar usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
CMD ["npm", "start"]
```

### Docker Compose para Produção

```yaml
version: '3.8'

services:
  api:
    image: aulapronta-backend:latest
    container_name: aulapronta-api
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      CORS_ORIGIN: ${CORS_ORIGIN}
    depends_on:
      - mongodb
    networks:
      - aulapronta-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  mongodb:
    image: mongo:7
    container_name: aulapronta-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: aulapronta
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - aulapronta-network
    ports:
      - "27017:27017"

  nginx:
    image: nginx:alpine
    container_name: aulapronta-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - aulapronta-network

volumes:
  mongodb_data:
  mongodb_config:

networks:
  aulapronta-network:
    driver: bridge
```

### Nginx Configuration

```nginx
upstream api {
    server api:3000;
}

server {
    listen 80;
    server_name api.aulapronta.com.br;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.aulapronta.com.br;

    # SSL
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy
    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api;
    }
}
```

### Deploy com Docker

```bash
# Build da imagem
docker build -t aulapronta-backend:latest .

# Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose logs -f api

# Parar serviços
docker-compose down
```

---

## ☁️ Deploy em Cloud Providers

### AWS (Amazon Web Services)

#### Opção 1: Elastic Beanstalk

```bash
# Instalar EB CLI
pip install awsebcli

# Inicializar
eb init -p node.js-20 aulapronta-backend

# Criar ambiente
eb create aulapronta-prod

# Deploy
eb deploy

# Abrir no navegador
eb open
```

**Configuração** (`.ebextensions/01-nginx.config`):
```yaml
files:
  "/etc/nginx/conf.d/proxy.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      client_max_body_size 20M;
```

#### Opção 2: ECS (Elastic Container Service)

```bash
# Build e push para ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -t aulapronta-backend .
docker tag aulapronta-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/aulapronta-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/aulapronta-backend:latest

# Deploy no ECS (via terraform ou console)
```

#### Opção 3: EC2

```bash
# Conectar via SSH
ssh -i sua-chave.pem ubuntu@seu-ip

# Instalar dependências
sudo apt update
sudo apt install -y nodejs npm nginx

# Clonar repositório
git clone https://github.com/seu-usuario/aulapronta-backend.git
cd aulapronta-backend

# Instalar dependências
npm ci --only=production

# Configurar variáveis de ambiente
nano .env

# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start src/server.js --name aulapronta-api
pm2 startup
pm2 save

# Configurar Nginx
sudo nano /etc/nginx/sites-available/aulapronta
sudo ln -s /etc/nginx/sites-available/aulapronta /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Google Cloud Platform

#### Cloud Run (Serverless)

```bash
# Fazer login
gcloud auth login

# Configurar projeto
gcloud config set project seu-projeto-id

# Build e deploy
gcloud builds submit --tag gcr.io/seu-projeto-id/aulapronta-backend
gcloud run deploy aulapronta-backend \
  --image gcr.io/seu-projeto-id/aulapronta-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI=$MONGODB_URI,JWT_SECRET=$JWT_SECRET
```

#### App Engine

```yaml
# app.yaml
runtime: nodejs20

env_variables:
  NODE_ENV: "production"
  PORT: "8080"

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.65
```

```bash
gcloud app deploy
```

---

### Microsoft Azure

#### App Service

```bash
# Fazer login
az login

# Criar resource group
az group create --name aulapronta-rg --location eastus

# Criar App Service Plan
az appservice plan create \
  --name aulapronta-plan \
  --resource-group aulapronta-rg \
  --sku B1 \
  --is-linux

# Criar Web App
az webapp create \
  --resource-group aulapronta-rg \
  --plan aulapronta-plan \
  --name aulapronta-backend \
  --runtime "NODE:20-lts"

# Configurar variáveis de ambiente
az webapp config appsettings set \
  --resource-group aulapronta-rg \
  --name aulapronta-backend \
  --settings \
    NODE_ENV=production \
    MONGODB_URI="$MONGODB_URI" \
    JWT_SECRET="$JWT_SECRET"

# Deploy via Git
az webapp deployment source config-local-git \
  --name aulapronta-backend \
  --resource-group aulapronta-rg

git remote add azure <URL-do-azure>
git push azure main
```

---

### Heroku

```bash
# Fazer login
heroku login

# Criar app
heroku create aulapronta-backend

# Adicionar MongoDB
heroku addons:create mongolab:sandbox

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=sua_chave_secreta

# Deploy
git push heroku main

# Ver logs
heroku logs --tail

# Abrir app
heroku open
```

**Procfile**:
```
web: npm start
```

---

### Railway

1. Acesse https://railway.app
2. Conecte seu repositório GitHub
3. Selecione o projeto
4. Configure variáveis de ambiente
5. Deploy automático a cada push

**railway.json**:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### Render

1. Acesse https://render.com
2. Conecte seu repositório GitHub
3. Crie um novo Web Service
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Adicione variáveis de ambiente
6. Deploy

**render.yaml**:
```yaml
services:
  - type: web
    name: aulapronta-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 3000
```

---

## 🗄️ Configuração de MongoDB

### MongoDB Atlas (Recomendado)

1. Acesse https://www.mongodb.com/cloud/atlas
2. Crie um cluster grátis (M0)
3. Configure IP Whitelist (0.0.0.0/0 para permitir todos)
4. Crie um usuário de banco de dados
5. Obtenha a connection string

**Connection String**:
```
mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/aulapronta?retryWrites=true&w=majority
```

### MongoDB em VPS/EC2

```bash
# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Configurar autenticação
mongo
> use admin
> db.createUser({
    user: "admin",
    pwd: "senha_forte_aqui",
    roles: [ { role: "root", db: "admin" } ]
  })
> exit

# Editar configuração
sudo nano /etc/mongod.conf
# Adicionar:
# security:
#   authorization: enabled

sudo systemctl restart mongod
```

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] **JWT_SECRET** forte e único
- [ ] **HTTPS** habilitado (SSL/TLS)
- [ ] **CORS** configurado corretamente
- [ ] **Rate limiting** implementado
- [ ] **Helmet.js** para headers de segurança
- [ ] **Validação de entrada** em todos os endpoints
- [ ] **MongoDB** com autenticação habilitada
- [ ] **Senhas** com hash bcrypt (10+ rounds)
- [ ] **Logs** sem informações sensíveis
- [ ] **Variáveis de ambiente** não commitadas
- [ ] **Dependências** atualizadas (npm audit)
- [ ] **Firewall** configurado
- [ ] **Backups** automáticos do banco
- [ ] **Monitoramento** de erros (Sentry)

### Implementar Helmet.js

```bash
npm install helmet
```

```javascript
// src/app.js
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));
```

### Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// src/app.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requests por IP
  message: 'Muitas requisições, tente novamente mais tarde.'
});

app.use('/api/', limiter);
```

---

## 📊 Monitoramento

### Sentry (Monitoramento de Erros)

```bash
npm install @sentry/node
```

```javascript
// src/server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Middleware de erro
app.use(Sentry.Handlers.errorHandler());
```

### PM2 (Process Manager)

```bash
npm install -g pm2

# Iniciar
pm2 start src/server.js --name aulapronta-api

# Monitorar
pm2 monit

# Logs
pm2 logs aulapronta-api

# Restart
pm2 restart aulapronta-api

# Auto-restart em boot
pm2 startup
pm2 save
```

**ecosystem.config.js**:
```javascript
module.exports = {
  apps: [{
    name: 'aulapronta-api',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

---

## 🔄 CI/CD

### GitHub Actions

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "aulapronta-backend"
          heroku_email: "seu-email@exemplo.com"
```

---

## 🔧 Troubleshooting

### Problema: Aplicação não inicia

**Solução**:
```bash
# Verificar logs
pm2 logs aulapronta-api
# ou
docker logs aulapronta-api

# Verificar variáveis de ambiente
printenv | grep MONGODB_URI
```

### Problema: Erro de conexão com MongoDB

**Solução**:
```bash
# Testar conexão
mongo "mongodb+srv://usuario:senha@cluster.mongodb.net/aulapronta"

# Verificar IP Whitelist no Atlas
# Verificar usuário e senha
# Verificar firewall
```

### Problema: Erro 502 Bad Gateway

**Solução**:
```bash
# Verificar se a aplicação está rodando
curl http://localhost:3000/api/health

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

## 📞 Suporte

Para problemas durante o deployment:

1. Consulte os logs de erro
2. Verifique as configurações
3. Teste localmente primeiro
4. Abra uma issue no GitHub

---

<div align="center">

**🚀 AulaPronta - Deployment Guide**

Versão 1.0.0 | Atualizado em: Fevereiro 2024

</div>
