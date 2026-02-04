# 🐳 Docker & Docker Compose

## Executando com Docker

Este projeto possui configuração completa para Docker, permitindo executar o MongoDB e o backend em containers.

### Pré-requisitos

- Docker >= 20.x
- Docker Compose >= 2.x

## 📦 Opções de Execução

### 1️⃣ Apenas MongoDB (Desenvolvimento Local)

Execute apenas o MongoDB em Docker e o backend localmente:

```bash
# Inicia o MongoDB
docker-compose up -d

# Em outro terminal, inicie o backend localmente
npm run dev
```

**Acessos:**
- MongoDB: `localhost:27017`
- Mongo Express (UI): `http://localhost:8081`
  - Usuário: `admin`
  - Senha: `admin123`

### 2️⃣ Backend + MongoDB (Full Docker)

Execute todo o ambiente em Docker:

```bash
# Build e start de todos os serviços
docker-compose -f docker-compose.full.yml up --build

# Ou em modo detached (background)
docker-compose -f docker-compose.full.yml up -d --build
```

**Acessos:**
- API Backend: `http://localhost:3000`
- MongoDB: `localhost:27017`
- Mongo Express: `http://localhost:8081`

## 🛠️ Comandos Úteis

### Gerenciamento de Containers

```bash
# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f mongodb

# Parar os serviços
docker-compose down

# Parar e remover volumes (limpa dados do MongoDB)
docker-compose down -v

# Rebuild dos containers
docker-compose up --build

# Verificar status
docker-compose ps
```

### MongoDB

```bash
# Acessar o MongoDB via CLI
docker exec -it aulapronta-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Backup do banco
docker exec aulapronta-mongodb mongodump -u admin -p admin123 --authenticationDatabase admin -d aulapronta -o /data/backup

# Restaurar backup
docker exec aulapronta-mongodb mongorestore -u admin -p admin123 --authenticationDatabase admin -d aulapronta /data/backup/aulapronta
```

### Backend

```bash
# Acessar o container do backend
docker exec -it aulapronta-backend sh

# Ver logs do backend
docker logs -f aulapronta-backend

# Reiniciar apenas o backend
docker-compose restart backend
```

## 🔐 Credenciais

### MongoDB (desenvolvimento)
- **Usuário**: `admin`
- **Senha**: `admin123`
- **Database**: `aulapronta`
- **Auth Database**: `admin`

### Mongo Express (UI)
- **URL**: http://localhost:8081
- **Usuário**: `admin`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere estas credenciais em produção!

## 📊 Volumes

Os dados do MongoDB são persistidos em volumes Docker:

```bash
# Listar volumes
docker volume ls | grep aulapronta

# Inspecionar volume
docker volume inspect backend_mongodb_data

# Remover volumes (CUIDADO: apaga os dados!)
docker volume rm backend_mongodb_data backend_mongodb_config
```

## 🌐 Redes

Os containers se comunicam através da rede `aulapronta-network`:

```bash
# Inspecionar a rede
docker network inspect backend_aulapronta-network
```

## 🏗️ Build do Backend

### Build manual da imagem

```bash
# Build da imagem
docker build -t aulapronta-backend:latest .

# Run manual
docker run -d \
  --name aulapronta-backend \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://admin:admin123@mongodb:27017/aulapronta?authSource=admin \
  -e JWT_SECRET=your_secret_key \
  --network backend_aulapronta-network \
  aulapronta-backend:latest
```

## 🔄 CI/CD com Docker

O projeto está preparado para deploy usando Docker:

```bash
# Build para produção
docker-compose -f docker-compose.full.yml build

# Push para registry (exemplo)
docker tag aulapronta-backend:latest your-registry/aulapronta-backend:v1.0.0
docker push your-registry/aulapronta-backend:v1.0.0
```

## 🐛 Troubleshooting

### Erro de conexão com MongoDB

```bash
# Verifique se o MongoDB está rodando
docker-compose ps

# Verifique os logs do MongoDB
docker-compose logs mongodb

# Teste a conexão
docker exec -it aulapronta-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

### Porta já em uso

```bash
# Encontre o processo usando a porta 3000
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Ou altere a porta no docker-compose.yml
ports:
  - "3001:3000"  # Mapeia porta 3001 do host para 3000 do container
```

### Limpar tudo e recomeçar

```bash
# Para todos os containers, remove volumes e networks
docker-compose down -v --remove-orphans

# Remove imagens do projeto
docker rmi $(docker images | grep aulapronta | awk '{print $3}')

# Recria tudo do zero
docker-compose up --build
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# JWT
JWT_SECRET=your_super_secret_jwt_key

# CORS
CORS_ORIGIN=http://localhost:5173

# MongoDB (se precisar customizar)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123
```

## 🚀 Deploy em Produção

Para produção, recomendamos:

1. **Use MongoDB Atlas** ou MongoDB gerenciado
2. **Configure secrets** adequados (JWT_SECRET)
3. **Use HTTPS** com certificado válido
4. **Configure backup** automático do banco
5. **Use orquestrador** (Kubernetes, Docker Swarm)
6. **Configure monitoring** (Prometheus, Grafana)

### Exemplo de configuração de produção

```yaml
# docker-compose.prod.yml
services:
  backend:
    image: your-registry/aulapronta-backend:latest
    environment:
      NODE_ENV: production
      MONGODB_URI: ${MONGODB_URI}  # Use MongoDB Atlas
      JWT_SECRET: ${JWT_SECRET}    # Use secrets manager
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
```

---

📚 **Documentação completa**: [README.md](./README.md)
