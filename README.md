# 🎓 AulaPronta - Backend API

Backend da plataforma **AulaPronta**, um sistema de gestão de atividades pedagógicas para professores e alunos da rede pública de ensino.

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Express](https://img.shields.io/badge/Express-5.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)
![Jest](https://img.shields.io/badge/Jest-30.x-red)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## 📚 Documentação Completa

- 🏗️ **[Architecture Guide](./ARCHITECTURE.md)** - Arquitetura detalhada do sistema
- 📘 **[API Documentation](./API_DOCUMENTATION.md)** - Referência completa de todos os endpoints
- 🚀 **[Quick Start Guide](./QUICKSTART.md)** - Comece em 5 minutos com exemplos práticos
- 🧪 **[Testing Guide](./TESTING.md)** - Guia completo de testes e cobertura
- 🐳 **[Docker Guide](./DOCKER.md)** - Configuração e uso do Docker
- 🚢 **[Deployment Guide](./DEPLOYMENT.md)** - Deploy em produção (AWS, GCP, Azure, Heroku, etc.)
- 📮 **[Postman Collection](./postman_collection.json)** - Importe e teste a API
- 🌐 **[Swagger UI](http://localhost:3000/api-docs)** - Documentação interativa (com servidor rodando)

---

## 📋 Índice

- [Sobre](#-sobre)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Testes](#-testes)
- [Documentação da API](#-documentação-da-api)
  - [Swagger](#acessar-o-swagger)
  - [Postman/Insomnia](#-postmaninsomnia-collection)
- [Endpoints](#-endpoints)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Docker](#-docker)
- [Quick Start Guide](#-quick-start)

## 📖 Sobre

O **AulaPronta** é uma plataforma que permite:

- ✅ **Professores** criarem, organizarem e compartilharem atividades pedagógicas
- ✅ **Reaproveitamento** de materiais didáticos entre educadores
- ✅ **Colaboração** através do compartilhamento de atividades públicas
- ✅ **Alunos** acessarem atividades disponibilizadas pelos professores
- ✅ **Gestão** completa de atividades com filtros por disciplina, série e status

## 🏗️ Arquitetura

O projeto utiliza **Clean Architecture** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                 │
│  (Controllers, Routes, Middlewares)          │
├─────────────────────────────────────────────┤
│          Application Layer                   │
│         (Use Cases - Business Logic)         │
├─────────────────────────────────────────────┤
│            Domain Layer                      │
│     (Entities - Core Business Rules)         │
├─────────────────────────────────────────────┤
│        Infrastructure Layer                  │
│   (Database, Repositories, External APIs)    │
└─────────────────────────────────────────────┘
```

### Camadas:

- **Domain**: Entidades de negócio puras (Usuario, Atividade)
- **Application**: Casos de uso e lógica de aplicação
- **Infrastructure**: Implementações de banco de dados e repositórios
- **Presentation**: Controllers, rotas, middlewares e API REST

## 🛠️ Tecnologias

### Core
- **Node.js** v20.x - Runtime JavaScript
- **Express.js** v5.x - Framework web
- **MongoDB** v7.x - Banco de dados NoSQL
- **Mongoose** v9.x - ODM para MongoDB

### Autenticação & Segurança
- **JWT (jsonwebtoken)** - Autenticação stateless
- **bcryptjs** - Hash de senhas
- **CORS** - Controle de acesso entre origens

### Testes
- **Jest** - Framework de testes
- **Supertest** - Testes de API HTTP
- **100% de cobertura** de código

### DevOps
- **GitHub Actions** - CI/CD automatizado
- **Nodemon** - Hot reload em desenvolvimento

## 📦 Pré-requisitos

- Node.js >= 18.x
- MongoDB >= 7.x (local ou Atlas) **ou Docker**
- NPM ou Yarn
- Docker e Docker Compose (opcional, recomendado)

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/MathWhite/hackaton-backend

# Navegue até o diretório
cd hackaton-backend

# Instale as dependências
npm install
```

## ⚙️ Configuração

### Opção 1: Com Docker (Recomendado)

1. Certifique-se de ter Docker e Docker Compose instalados

2. Inicie o MongoDB com Docker:

```bash
docker-compose up -d
```

3. O MongoDB estará disponível em `localhost:27017`
   - Interface Web (Mongo Express): http://localhost:8081
   - Usuário: `admin` / Senha: `admin123`

### Opção 2: MongoDB Local

1. Instale o MongoDB localmente (versão 7.x ou superior)

2. Inicie o serviço do MongoDB

### Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do backend:

```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente:

```env
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB (Docker com autenticação)
MONGODB_URI=mongodb://admin:admin123@localhost:27017/aulapronta?authSource=admin

# Ou MongoDB local sem autenticação
# MONGODB_URI=mongodb://localhost:27017/aulapronta

# JWT
JWT_SECRET=sua_chave_secreta_super_segura
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `MONGODB_URI` | String de conexão MongoDB | `mongodb://localhost:27017/aulapronta` |
| `JWT_SECRET` | Chave secreta para JWT | - |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:5173` |
## 🏃 Execução

### Desenvolvimento com Docker (Recomendado)

```bash
# Inicia o MongoDB em Docker
docker-compose up -d

# Em outro terminal, inicie o backend
npm run dev
```

### Desenvolvimento sem Docker

```bash
# Certifique-se de que o MongoDB está rodando localmente
# Depois inicie o backend
npm run dev
```

### Modo Produção

```bash
# Inicia o servidor em modo produção
npm start
```

### Full Docker (Backend + MongoDB)

```bash
# Inicia tudo em containers
docker-compose -f docker-compose.full.yml up --build
```

O servidor estará rodando em: **http://localhost:3000**

### Acessar a Documentação

Após iniciar o servidor:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json
- **Health Check**: http://localhost:3000/api/health

**📚 Documentação completa de Testes**: [TESTING.md](./TESTING.md)

**📚 Documentação completa do Docker**: [DOCKER.md](./DOCKER.md)

## 📚 Documentação da API

A API está completamente documentada com **Swagger/OpenAPI 3.0**.

### Acessar o Swagger

Com o servidor rodando, acesse:

🔗 **http://localhost:3000/api-docs**

### Recursos do Swagger

- ✅ Documentação interativa de todos os endpoints
- ✅ Testar requisições diretamente no navegador
- ✅ Schemas de dados completos
- ✅ Exemplos de requisições e respostas
- ✅ Autenticação JWT integrada
- ✅ Especificação OpenAPI em JSON

### Como usar o Swagger para testar a API

1. Acesse http://localhost:3000/api-docs
2. Registre um usuário em `POST /api/auth/registrar`
3. Faça login em `POST /api/auth/login` e copie o token
4. Clique em **"Authorize"** no topo da página
5. Cole o token no formato: `Bearer seu_token_aqui`
6. Agora você pode testar todos os endpoints protegidos!

### Exportar especificação OpenAPI

Baixe a especificação em JSON:

```bash
curl http://localhost:3000/api-docs.json > openapi.json
```

### 📮 Postman/Insomnia Collection

Uma coleção completa está disponível em [postman_collection.json](./postman_collection.json) com:

- ✅ Todos os endpoints organizados por categoria
- ✅ Variáveis de ambiente (baseUrl e token)
- ✅ Script automático para salvar token após login
- ✅ Exemplos de requisições com dados realistas

#### Como importar no Postman

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `postman_collection.json`
4. A coleção **AulaPronta API** será importada

#### Como importar no Insomnia

1. Abra o Insomnia
2. Clique em **Application** > **Import/Export** > **Import Data**
3. Selecione **From File**
4. Escolha o arquivo `postman_collection.json`
5. A coleção será importada automaticamente

#### Usando a coleção

1. **Registrar usuário**: Execute "Registrar Professor"
2. **Login**: Execute "Login" - o token será salvo automaticamente
3. **Testar endpoints**: Todos os outros endpoints já usarão o token automaticamente

**Variáveis disponíveis:**
- `{{baseUrl}}`: http://localhost:3000/api (pode ser alterado para produção)
- `{{token}}`: Preenchido automaticamente após login

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes em modo watch

```bash
npm run test:watch
```

### Executar testes no CI

```bash
npm run test:ci
```

### Cobertura de Testes

O projeto possui **100% de cobertura** de código com testes abrangentes:

**Testes incluem:**
- ✅ Autenticação (registro, login, perfil)
- ✅ CRUD de atividades
- ✅ Autorização e permissões
- ✅ Filtros e buscas
- ✅ Duplicação de atividades
- ✅ Validações de entrada
- ✅ Casos de erro

## 📡 Endpoints da API

> **💡 Dica**: Use o Swagger UI em http://localhost:3000/api-docs para uma documentação interativa completa!

### Base URL
```
http://localhost:3000/api
```

### 🔐 Autenticação

#### `POST /api/auth/registrar`
Registra um novo usuário (professor ou aluno)

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "tipo": "professor"
}
```

**Response (201):**
```json
{
  "usuario": {
    "id": "...",
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo": "professor"
  },
  "mensagem": "Usuário registrado com sucesso."
}
```

#### `POST /api/auth/login`
Realiza login e retorna token JWT

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Response (200):**
```json
{
  "usuario": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mensagem": "Login realizado com sucesso."
}
```

#### `GET /api/auth/perfil` 🔒
Retorna dados do usuário autenticado

**Headers:**
```
Authorization: Bearer {token}
```

---

### 📚 Atividades

#### `POST /api/atividades` 🔒 👨‍🏫
Cria uma nova atividade (somente professores)

**Body:**
```json
{
  "titulo": "Equações de Segundo Grau",
  "descricao": "Exercícios práticos sobre equações",
  "disciplina": "Matemática",
  "serie": "9º ano",
  "objetivo": "Desenvolver habilidades...",
  "status": "rascunho",
  "isPublica": false
}
```

#### `GET /api/atividades` 🔒
Lista atividades
- **Professores**: retorna suas atividades
- **Alunos**: retorna apenas atividades públicas

**Query Parameters:**
- `disciplina` - Filtrar por disciplina
- `serie` - Filtrar por série
- `status` - Filtrar por status (rascunho, publicada)

#### `GET /api/atividades/:id` 🔒
Busca uma atividade por ID

#### `PUT /api/atividades/:id` 🔒 👨‍🏫
Atualiza uma atividade (somente professor dono)

#### `DELETE /api/atividades/:id` 🔒 👨‍🏫
Deleta uma atividade (somente professor dono)

#### `POST /api/atividades/:id/duplicar` 🔒 👨‍🏫
Duplica uma atividade (professores podem duplicar atividades próprias ou públicas)

---

### 🏥 Health Check

#### `GET /api/health`
Verifica status da API

**Response (200):**
```json
{
  "status": "OK",
  "mensagem": "API AulaPronta está funcionando!",
  "timestamp": "2026-02-07T..."
}
```

**Legenda:**
- 🔒 = Requer autenticação (token JWT)
- 👨‍🏫 = Somente professores

## 📁 Estrutura do Projeto

```
Backend/
├── src/
│   ├── application/
│   │   └── use-cases/           # Casos de uso (lógica de negócio)
│   │       ├── CriarAtividadeUseCase.js
│   │       ├── ListarAtividadesUseCase.js
│   │       ├── LoginUsuarioUseCase.js
│   │       └── RegistrarUsuarioUseCase.js
│   │
│   ├── config/
│   │   ├── database.js          # Configuração MongoDB
│   │   ├── env.js               # Variáveis de ambiente
│   │   └── swagger.js           # Configuração Swagger/OpenAPI
│   │
│   ├── domain/
│   │   └── entities/            # Entidades de negócio
│   │       ├── Atividade.js
│   │       └── Usuario.js
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── models/          # Modelos Mongoose
│   │   │       ├── AtividadeModel.js
│   │   │       └── UsuarioModel.js
│   │   └── repositories/        # Acesso a dados
│   │       ├── AtividadeRepository.js
│   │       └── UsuarioRepository.js
│   │
│   ├── presentation/
│   │   ├── controllers/         # Controllers da API
│   │   │   ├── AtividadeController.js
│   │   │   └── AuthController.js
│   │   ├── middlewares/         # Middlewares Express
│   │   │   ├── autenticar.js
│   │   │   ├── autorizacao.js
│   │   │   └── tratarErros.js
│   │   └── routes/              # Rotas da API
│   │       ├── atividadeRoutes.js
│   │       ├── authRoutes.js
│   │       └── index.js
│   │
│   ├── app.js                   # Configuração do Express
│   └── server.js                # Ponto de entrada
│
├── __tests__/                   # Testes automatizados (143 testes)
│   ├── helpers/
│   │   └── testHelpers.js
│   ├── app.test.js
│   ├── atividades.test.js
│   ├── auth.test.js
│   ├── controllers-error.test.js
│   ├── entities.test.js
│   ├── middlewares.test.js
│   ├── middlewares-unit.test.js
│   ├── repositories.test.js
│   └── usecases.test.js
│
├── coverage/                    # Relatórios de cobertura
├── .env                         # Variáveis de ambiente (não versionado)
├── .env.example                 # Exemplo de variáveis
├── docker-compose.yml           # Docker apenas MongoDB
├── docker-compose.full.yml      # Docker completo
├── Dockerfile                   # Imagem do backend
├── jest.config.js               # Configuração Jest
├── package.json                 # Dependências NPM
├── DOCKER.md                    # Documentação Docker
├── TESTING.md                   # Documentação de Testes
└── README.md                    # Documentação principal
```

## 🔄 CI/CD

O projeto utiliza **GitHub Actions** para automação:

### Pipeline de CI/CD

- ✅ Checkout do código
- ✅ Setup Node.js (matriz 18.x e 20.x)
- ✅ Instalação de dependências
- ✅ Testes com cobertura completa (100%)
- ✅ Análise de código (lint)
- ✅ Build da aplicação

## 🐳 Docker

O projeto inclui suporte completo para Docker:

### Opções disponíveis:

1. **MongoDB apenas** (`docker-compose.yml`)
   ```bash
   docker-compose up -d
   ```

2. **Backend + MongoDB** (`docker-compose.full.yml`)
   ```bash
   docker-compose -f docker-compose.full.yml up --build
   ```

Consulte [DOCKER.md](./DOCKER.md) para mais detalhes.

### Padrões do Projeto

- **Clean Architecture** - Separação de camadas
- **SOLID Principles** - Código limpo e manutenível
- **TDD/BDD** - Testes primeiro
- **100% Coverage** - Todo código testado
- **JSDoc** - Documentação inline
- **Swagger** - Documentação de API

## 👥 Equipe

Desenvolvido por *Matheus Carvalho* para o Hackathon FIAP.

## 📞 Contato

- **Email**: matheusfgc99@gmail.com
- **Website**: mc-dev.tech

---

### Triggers

- Push nas branches `main` e `develop`
- Pull Requests para `main` e `develop`

## 🚀 Quick Start

Quer começar rapidamente? Veja o guia completo em **[QUICKSTART.md](./QUICKSTART.md)**

O guia inclui:

- ✅ Exemplos práticos com curl
- ✅ Código JavaScript/Axios pronto para usar
- ✅ Fluxo completo de autenticação
- ✅ CRUD de atividades com exemplos
- ✅ Tratamento de erros
- ✅ Filtragem e busca

**Primeiro teste rápido:**

```bash
# 1. Verificar se o servidor está rodando
curl http://localhost:3000/api/health

# 2. Registrar um professor
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Silva","email":"maria@escola.com","senha":"senha123","tipo":"professor"}'

# 3. Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@escola.com","senha":"senha123"}'
```

Ver guia completo: **[QUICKSTART.md](./QUICKSTART.md)**

## 📄 Licença

Este projeto está sob a licença ISC.