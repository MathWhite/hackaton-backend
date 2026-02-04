# 🎓 AulaPronta - Backend

Backend da plataforma **AulaPronta**, um sistema de gestão de atividades pedagógicas para professores e alunos da rede pública de ensino.

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Express](https://img.shields.io/badge/Express-5.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)
![Jest](https://img.shields.io/badge/Jest-29.x-red)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)

## 📋 Índice

- [Sobre](#sobre)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Testes](#testes)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [CI/CD](#cicd)

## 📖 Sobre

O **AulaPronta** é uma plataforma que permite:
- ✅ Professores criarem, organizarem e compartilharem atividades pedagógicas
- ✅ Reaproveitamento de materiais didáticos
- ✅ Colaboração entre educadores
- ✅ Alunos acessarem atividades públicas

## 🏗️ Arquitetura

O projeto utiliza **Clean Architecture** com separação clara de responsabilidades:

```
┌─────────────────┐
│  Presentation   │  ← Controllers, Routes, Middlewares
├─────────────────┤
│  Application    │  ← Use Cases (Business Logic)
├─────────────────┤
│  Domain         │  ← Entities (Core Business)
├─────────────────┤
│ Infrastructure  │  ← Database, Repositories
└─────────────────┘
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
git clone <url-do-repositorio>

# Navegue até o diretório do backend
cd Desenvolvimento/Backend

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
Com Docker

```bash
# Inicia o MongoDB em Docker
docker-compose up -d

# Em outro terminal, inicie o backend
npm run dev
```

### Sem Docker

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

O servidor estará rodando em: `http://localhost:3000`

**📚 Documentação completa do Docker**: [DOCKER.md](./DOCKER.md)
```

O servidor estará rodando em: `http://localhost:3000`

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

### Base URL
```
http://localhost:3000/api
```

### Autenticação

#### `POST /auth/registrar`
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

#### `POST /auth/login`
Realiza login e retorna token JWT

#### `GET /auth/perfil`
Retorna dados do usuário autenticado (requer autenticação)

---

### Atividades

#### `POST /atividades`
Cria uma nova atividade (somente professores)

#### `GET /atividades`
Lista atividades com filtros opcionais

#### `GET /atividades/:id`
Busca uma atividade por ID

#### `PUT /atividades/:id`
Atualiza uma atividade (somente professor dono)

#### `DELETE /atividades/:id`
Deleta uma atividade (somente professor dono)

#### `POST /atividades/:id/duplicar`
Duplica uma atividade (somente professores)

---

### Health Check

#### `GET /health`
Verifica status da API

## 📁 Estrutura do Projeto

```
Backend/
├── src/
│   ├── application/use-cases/   # Casos de uso (lógica de negócio)
│   ├── config/                  # Configurações
│   ├── domain/entities/         # Entidades de negócio
│   ├── infrastructure/          # Database, Models, Repositories
│   ├── presentation/            # Controllers, Routes, Middlewares
│   ├── app.js                   # Configuração do Express
│   └── server.js                # Ponto de entrada
│
├── __tests__/                   # Testes automatizados
│   ├── helpers/testHelpers.js
│   ├── auth.test.js
│   └── atividades.test.js
│
├── .env                         # Variáveis de ambiente
├── jest.config.js               # Configuração do Jest
└── package.json
```

## 🔄 CI/CD

O projeto utiliza **GitHub Actions** para automação:

### Pipeline de CI/CD

- ✅ Checkout do código
- ✅ Setup Node.js (matriz 18.x e 20.x)
- ✅ Instalação de dependências
- ✅ Testes com cobertura completa
- ✅ Análise de código (lint)
- ✅ Build de produção
- ✅ Upload de cobertura

### Triggers

- Push nas branches `main` e `develop`
- Pull Requests para `main` e `develop`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### Padrões de Código

- Use **Clean Architecture**
- Escreva testes para todas as novas features
- Mantenha a cobertura em 100%

## 📝 Licença

Este projeto está sob a licença ISC.

## 👥 Equipe

Desenvolvido pela **Equipe AulaPronta** para o Hackathon FIAP 2026.

---

⚡ **Status**: Em desenvolvimento ativo  
📅 **Última atualização**: Fevereiro de 2026
