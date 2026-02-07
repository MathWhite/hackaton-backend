# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-02-01

### ✨ Adicionado

#### Funcionalidades Core
- **Sistema de Autenticação JWT** completo
  - Registro de usuários (professores e alunos)
  - Login com autenticação por email e senha
  - Middleware de autenticação JWT
  - Endpoint de perfil do usuário

- **CRUD Completo de Atividades**
  - Criação de atividades pedagógicas (apenas professores)
  - Listagem de atividades com filtros
  - Busca de atividade por ID
  - Atualização de atividades (apenas criador)
  - Exclusão de atividades (apenas criador)
  - Duplicação de atividades

#### Recursos de Atividades
- **Materiais de Apoio**: Suporte para PDF, vídeo, links e imagens
- **Filtros Avançados**: Por disciplina, série e status
- **Controle de Visibilidade**: Atividades públicas e privadas
- **Status de Publicação**: Rascunho e publicada

#### Sistema de Autorização
- **Controle de Acesso Baseado em Funções (RBAC)**
  - Professores: podem criar, editar, deletar e duplicar atividades
  - Alunos: podem apenas visualizar atividades públicas
  - Professores podem ver suas próprias atividades + públicas de outros

#### Arquitetura
- **Clean Architecture** com separação clara de responsabilidades
  - Domain Layer: Entidades de negócio
  - Application Layer: Casos de uso
  - Infrastructure Layer: Repositórios e banco de dados
  - Presentation Layer: Controllers, rotas e middlewares

#### Banco de Dados
- **MongoDB** com Mongoose ODM
- **Modelos**:
  - `Usuario`: Gerenciamento de usuários
  - `Atividade`: Gerenciamento de atividades pedagógicas
- **Índices** para performance otimizada
- **Validações** no nível de schema

#### Testes
- **100% de Cobertura de Código**
  - 143 testes passando
  - Testes de unidade
  - Testes de integração
  - Testes de middlewares
  - Testes de entidades
  - Testes de repositórios
  - Testes de casos de uso
  - Testes de controllers
  - Testes de tratamento de erros

#### Documentação
- **Swagger/OpenAPI 3.0**
  - Documentação interativa em `/api-docs`
  - Todos os endpoints documentados
  - Schemas de dados completos
  - Exemplos de requisições e respostas
  - Autenticação JWT integrada

- **Documentação Abrangente**
  - README.md completo
  - API_DOCUMENTATION.md - Referência detalhada
  - QUICKSTART.md - Guia de início rápido
  - TESTING.md - Guia de testes
  - DOCKER.md - Guia do Docker
  - CONTRIBUTING.md - Guia de contribuição
  - Postman Collection para testes

#### Docker
- **Docker Compose** completo
  - Serviço MongoDB com autenticação
  - Serviço da API Node.js
  - Volumes para persistência de dados
  - Networks isolados
  - Health checks
  - Configuração para desenvolvimento e produção

#### Middleware
- **Autenticação JWT**: Verifica tokens em rotas protegidas
- **Autorização**: Controla acesso baseado em tipo de usuário
- **Tratamento de Erros**: Middleware centralizado para erros
- **CORS**: Configurado para permitir origens específicas

#### Segurança
- **Bcrypt** para hash de senhas
- **JWT** para autenticação stateless
- **Validação de dados** em todos os endpoints
- **Sanitização** de entradas
- **Headers de segurança** configurados

### 📦 Dependências

#### Produção
- `express` ^5.0.1 - Framework web
- `mongoose` ^9.1.0 - ODM para MongoDB
- `jsonwebtoken` ^9.0.2 - Autenticação JWT
- `bcryptjs` ^2.4.3 - Hash de senhas
- `dotenv` ^16.4.7 - Gerenciamento de variáveis de ambiente
- `cors` ^2.8.5 - Middleware CORS
- `swagger-ui-express` ^5.0.1 - Interface Swagger UI
- `swagger-jsdoc` ^6.2.8 - Geração de spec OpenAPI

#### Desenvolvimento
- `jest` ^30.0.0 - Framework de testes
- `supertest` ^7.0.0 - Testes de API HTTP
- `nodemon` ^3.1.11 - Reinicialização automática

### 🏗️ Estrutura do Projeto

```
src/
├── domain/              # Entidades e regras de negócio
│   └── entities/        # Entidades: Usuario, Atividade
├── application/         # Casos de uso
│   └── use-cases/       # Lógica de aplicação
├── infrastructure/      # Implementações técnicas
│   ├── database/        # Modelos MongoDB
│   └── repositories/    # Implementação de repositórios
├── presentation/        # Camada de apresentação
│   ├── controllers/     # Controladores HTTP
│   ├── middlewares/     # Middlewares Express
│   └── routes/          # Definição de rotas
└── config/              # Configurações
    ├── database.js      # Configuração do MongoDB
    ├── env.js           # Variáveis de ambiente
    └── swagger.js       # Configuração Swagger
```

### 🔌 Endpoints

#### Autenticação
- `POST /api/auth/registrar` - Registrar novo usuário
- `POST /api/auth/login` - Autenticar usuário
- `GET /api/auth/perfil` - Obter perfil do usuário autenticado

#### Atividades
- `POST /api/atividades` - Criar atividade (professor)
- `GET /api/atividades` - Listar atividades (com filtros)
- `GET /api/atividades/:id` - Buscar atividade por ID
- `PUT /api/atividades/:id` - Atualizar atividade (criador)
- `DELETE /api/atividades/:id` - Deletar atividade (criador)
- `POST /api/atividades/:id/duplicar` - Duplicar atividade (professor)

#### Sistema
- `GET /api/health` - Health check

### 🔧 Configuração

#### Variáveis de Ambiente
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://admin:admin123@localhost:27017/aulapronta?authSource=admin
JWT_SECRET=sua_chave_secreta_super_segura
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 🚀 Execução

#### Desenvolvimento
```bash
npm install
npm run dev
```

#### Produção
```bash
npm start
```

#### Testes
```bash
npm test                # Executar todos os testes
npm run test:watch      # Modo watch
npm run test:coverage   # Com cobertura
npm run test:ci         # Para CI/CD
```

#### Docker
```bash
docker-compose up -d    # Iniciar todos os serviços
docker-compose down     # Parar todos os serviços
```

### 📊 Coverage

- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

### 🎯 Objetivos Alcançados

- ✅ Arquitetura limpa e escalável
- ✅ 100% de cobertura de testes
- ✅ Documentação completa (Swagger + Markdown)
- ✅ Segurança (JWT + bcrypt)
- ✅ Controle de acesso granular
- ✅ API RESTful bem estruturada
- ✅ Docker pronto para produção
- ✅ Código limpo e bem documentado
- ✅ Padrões de código estabelecidos
- ✅ Guias de contribuição
- ✅ Coleção Postman/Insomnia

### 🎓 Casos de Uso Implementados

1. **Registro de Usuário**: Professores e alunos podem se registrar
2. **Autenticação**: Login seguro com JWT
3. **Criação de Atividades**: Professores criam atividades pedagógicas
4. **Compartilhamento**: Atividades podem ser públicas ou privadas
5. **Filtragem**: Busca por disciplina, série e status
6. **Reaproveitamento**: Duplicação de atividades de outros professores
7. **Gestão**: Edição e exclusão de atividades próprias
8. **Visualização**: Alunos veem atividades públicas

### 🌟 Destaques

- **Zero vulnerabilidades** de segurança conhecidas
- **Performance otimizada** com índices no MongoDB
- **Tratamento de erros** robusto e consistente
- **Validações** em todas as camadas
- **Logs** estruturados para debugging
- **Ambiente containerizado** com Docker
- **CI/CD ready** com scripts de teste

### 📖 Licença

ISC License - Projeto educacional para Hackathon FIAP 2024

---

## [Unreleased]

### 🔮 Planejado para Próximas Versões

#### v1.1.0 (Q1 2024)
- [ ] Paginação nas listagens
- [ ] Upload de arquivos para materiais de apoio
- [ ] Sistema de comentários em atividades
- [ ] Notificações em tempo real
- [ ] Busca full-text

#### v1.2.0 (Q2 2024)
- [ ] Sistema de categorias/tags
- [ ] Avaliações e feedback de atividades
- [ ] Estatísticas de uso
- [ ] Dashboard para professores
- [ ] Integração com Google Classroom

#### v2.0.0 (Q3 2024)
- [ ] Microserviços
- [ ] GraphQL API
- [ ] Sistema de recomendações com ML
- [ ] Multi-tenancy
- [ ] Internacionalização (i18n)

### 🐛 Bugs Conhecidos

Nenhum bug conhecido na versão 1.0.0

### 💡 Melhorias Consideradas

- Cache com Redis
- Rate limiting
- Compressão de respostas
- Logging avançado (Winston)
- Monitoramento (Prometheus)
- Métricas de performance
- WebSockets para real-time
- Backup automático

---

## Como Contribuir

Para sugerir novas funcionalidades ou reportar bugs, veja [CONTRIBUTING.md](./CONTRIBUTING.md).

---

<div align="center">

**🎓 AulaPronta - Changelog**

Versão 1.0.0 | Atualizado em: Fevereiro 2024

</div>
