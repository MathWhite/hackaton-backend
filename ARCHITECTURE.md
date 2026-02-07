# 🏗️ Arquitetura do Sistema - AulaPronta Backend

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Clean Architecture](#-clean-architecture)
- [Camadas da Aplicação](#-camadas-da-aplicação)
- [Fluxo de Dados](#-fluxo-de-dados)
- [Padrões de Projeto](#-padrões-de-projeto)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Tecnologias por Camada](#-tecnologias-por-camada)
- [Decisões Arquiteturais](#-decisões-arquiteturais)
- [Diagramas](#-diagramas)

---

## 🌐 Visão Geral

O **AulaPronta Backend** é construído seguindo os princípios de **Clean Architecture**, garantindo:

- ✅ **Independência de Framework**: A lógica de negócio não depende de frameworks externos
- ✅ **Testabilidade**: Testes unitários sem dependências externas
- ✅ **Independência de UI**: A lógica pode ser usada em diferentes interfaces
- ✅ **Independência de Banco de Dados**: Fácil troca de tecnologia de persistência
- ✅ **Independência de Agentes Externos**: A lógica não depende de serviços externos

### Tecnologias Principais

- **Runtime**: Node.js 20.x
- **Framework Web**: Express.js 5.x
- **Banco de Dados**: MongoDB 7.x com Mongoose
- **Autenticação**: JWT (JSON Web Tokens)
- **Testes**: Jest 30.x
- **Documentação**: Swagger/OpenAPI 3.0

---

## 🎯 Clean Architecture

### Diagrama de Camadas

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                   │
│  (Controllers, Routes, Middlewares)          │
│  • HTTP/Express específico                   │
│  • Validação de entrada                      │
│  • Serialização de resposta                  │
└─────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────┐
│        Application Layer                     │
│         (Use Cases)                          │
│  • Regras de aplicação                       │
│  • Orquestração                              │
│  • Casos de uso específicos                  │
└─────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────┐
│          Domain Layer                        │
│         (Entities)                           │
│  • Regras de negócio                         │
│  • Entidades do domínio                      │
│  • Lógica de negócio pura                    │
└─────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────┐
│       Infrastructure Layer                   │
│   (Repositories, Database Models)            │
│  • Detalhes de implementação                 │
│  • Acesso a dados                            │
│  • Integrações externas                      │
└─────────────────────────────────────────────┘
```

### Princípio da Dependência

```
Presentation → Application → Domain ← Infrastructure
```

**Regra de Ouro**: As dependências apontam sempre para dentro (em direção ao domínio).

---

## 📚 Camadas da Aplicação

### 1. Domain Layer (Núcleo)

**Responsabilidade**: Regras de negócio puras

**Localização**: `src/domain/`

**Características**:
- ❌ Não tem dependências externas
- ✅ Apenas JavaScript puro
- ✅ Regras de negócio essenciais
- ✅ Entidades do domínio

**Componentes**:

#### Entidades

**`Usuario`** ([src/domain/entities/Usuario.js](src/domain/entities/Usuario.js)):
```javascript
class Usuario {
  constructor({ nome, email, senha, tipo }) {
    this.validar({ nome, email, senha, tipo });
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.tipo = tipo;
  }
  
  validar(dados) {
    // Validações de negócio
  }
}
```

**`Atividade`** ([src/domain/entities/Atividade.js](src/domain/entities/Atividade.js)):
```javascript
class Atividade {
  constructor(dados) {
    this.validar(dados);
    this.titulo = dados.titulo;
    this.disciplina = dados.disciplina;
    // ... outros campos
    this.status = dados.status || 'rascunho';
    this.isPublica = dados.isPublica || false;
  }
  
  podeSerEditadaPor(professorId) {
    return this.professorId.toString() === professorId.toString();
  }
  
  podeSerVisualizadaPor(usuario) {
    // Lógica de visualização
  }
}
```

---

### 2. Application Layer

**Responsabilidade**: Casos de uso e orquestração

**Localização**: `src/application/use-cases/`

**Características**:
- ✅ Orquestra o fluxo de dados
- ✅ Usa entidades do domínio
- ✅ Usa repositórios (abstração)
- ❌ Não conhece detalhes de implementação

**Componentes**:

#### Use Cases de Autenticação

**`RegistrarUsuarioUseCase`**:
```javascript
class RegistrarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }
  
  async executar({ nome, email, senha, tipo }) {
    // 1. Criar entidade de domínio
    const usuario = new Usuario({ nome, email, senha, tipo });
    
    // 2. Hash da senha
    usuario.senha = await bcrypt.hash(senha, 10);
    
    // 3. Persistir via repositório
    const usuarioCriado = await this.usuarioRepository.criar(usuario);
    
    // 4. Gerar token
    const token = jwt.sign({ id: usuarioCriado.id, ... }, JWT_SECRET);
    
    return { usuario: usuarioCriado, token };
  }
}
```

#### Use Cases de Atividades

**`CriarAtividadeUseCase`**:
```javascript
class CriarAtividadeUseCase {
  constructor(atividadeRepository, usuarioRepository) {
    this.atividadeRepository = atividadeRepository;
    this.usuarioRepository = usuarioRepository;
  }
  
  async executar(professorId, dados) {
    // 1. Validar que usuário é professor
    const professor = await this.usuarioRepository.buscarPorId(professorId);
    if (professor.tipo !== 'professor') {
      throw new Error('Apenas professores podem criar atividades');
    }
    
    // 2. Criar entidade
    const atividade = new Atividade({
      ...dados,
      professorId
    });
    
    // 3. Persistir
    return await this.atividadeRepository.criar(atividade);
  }
}
```

**Outros Use Cases**:
- `LoginUsuarioUseCase`
- `ListarAtividadesUseCase`
- `AtualizarAtividadeUseCase`
- `DeletarAtividadeUseCase`
- `DuplicarAtividadeUseCase`

---

### 3. Infrastructure Layer

**Responsabilidade**: Implementação de detalhes técnicos

**Localização**: `src/infrastructure/`

**Características**:
- ✅ Implementa interfaces de repositório
- ✅ Acesso ao banco de dados
- ✅ Modelos do Mongoose
- ✅ Integrações externas

**Componentes**:

#### Modelos (Database)

**`UsuarioModel`** ([src/infrastructure/database/models/UsuarioModel.js](src/infrastructure/database/models/UsuarioModel.js)):
```javascript
const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  tipo: { type: String, enum: ['professor', 'aluno'], required: true }
}, { timestamps: true });

// Índices para performance
usuarioSchema.index({ email: 1 });

module.exports = mongoose.model('Usuario', usuarioSchema);
```

**`AtividadeModel`** ([src/infrastructure/database/models/AtividadeModel.js](src/infrastructure/database/models/AtividadeModel.js)):
```javascript
const atividadeSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  disciplina: { type: String, required: true },
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  status: { type: String, enum: ['rascunho', 'publicada'], default: 'rascunho' },
  isPublica: { type: Boolean, default: false }
  // ... outros campos
}, { timestamps: true });

// Índices compostos
atividadeSchema.index({ disciplina: 1, serie: 1 });
atividadeSchema.index({ professorId: 1 });
atividadeSchema.index({ status: 1, isPublica: 1 });

module.exports = mongoose.model('Atividade', atividadeSchema);
```

#### Repositórios

**`UsuarioRepository`** ([src/infrastructure/repositories/UsuarioRepository.js](src/infrastructure/repositories/UsuarioRepository.js)):
```javascript
class UsuarioRepository {
  async criar(usuario) {
    const usuarioModel = new UsuarioModel(usuario);
    const salvo = await usuarioModel.save();
    return this._toEntity(salvo);
  }
  
  async buscarPorEmail(email) {
    const usuario = await UsuarioModel.findOne({ email });
    return usuario ? this._toEntity(usuario) : null;
  }
  
  _toEntity(model) {
    // Converte modelo do banco para entidade de domínio
    return new Usuario({
      id: model._id.toString(),
      nome: model.nome,
      email: model.email,
      senha: model.senha,
      tipo: model.tipo
    });
  }
}
```

**`AtividadeRepository`** ([src/infrastructure/repositories/AtividadeRepository.js](src/infrastructure/repositories/AtividadeRepository.js)):
```javascript
class AtividadeRepository {
  async criar(atividade) {
    const model = new AtividadeModel(atividade);
    const salvo = await model.save();
    return this._toEntity(salvo);
  }
  
  async listar(filtros) {
    const query = this._construirQuery(filtros);
    const atividades = await AtividadeModel.find(query).populate('professorId');
    return atividades.map(a => this._toEntity(a));
  }
  
  _toEntity(model) {
    // Converte modelo para entidade
  }
}
```

---

### 4. Presentation Layer

**Responsabilidade**: Interface HTTP/REST

**Localização**: `src/presentation/`

**Características**:
- ✅ Recebe requisições HTTP
- ✅ Valida entrada
- ✅ Chama use cases
- ✅ Formata resposta

**Componentes**:

#### Controllers

**`AuthController`** ([src/presentation/controllers/AuthController.js](src/presentation/controllers/AuthController.js)):
```javascript
class AuthController {
  constructor(registrarUsuarioUseCase, loginUsuarioUseCase) {
    this.registrarUsuarioUseCase = registrarUsuarioUseCase;
    this.loginUsuarioUseCase = loginUsuarioUseCase;
  }
  
  async registrar(req, res, next) {
    try {
      const { nome, email, senha, tipo } = req.body;
      const resultado = await this.registrarUsuarioUseCase.executar({
        nome, email, senha, tipo
      });
      
      res.status(201).json({
        mensagem: 'Usuário registrado com sucesso',
        usuario: resultado.usuario,
        token: resultado.token
      });
    } catch (erro) {
      next(erro);
    }
  }
}
```

**`AtividadeController`** ([src/presentation/controllers/AtividadeController.js](src/presentation/controllers/AtividadeController.js)):
```javascript
class AtividadeController {
  constructor(
    criarAtividadeUseCase,
    listarAtividadesUseCase,
    // ... outros use cases
  ) {
    this.criarAtividadeUseCase = criarAtividadeUseCase;
    this.listarAtividadesUseCase = listarAtividadesUseCase;
  }
  
  async criar(req, res, next) {
    try {
      const professorId = req.usuario.id;
      const atividade = await this.criarAtividadeUseCase.executar(
        professorId,
        req.body
      );
      res.status(201).json(atividade);
    } catch (erro) {
      next(erro);
    }
  }
}
```

#### Middlewares

**`autenticar`** ([src/presentation/middlewares/autenticar.js](src/presentation/middlewares/autenticar.js)):
```javascript
async function autenticar(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('Token não fornecido');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await usuarioRepository.buscarPorId(decoded.id);
    
    req.usuario = usuario;
    next();
  } catch (erro) {
    res.status(401).json({ erro: 'Token inválido' });
  }
}
```

**`autorizacao`** ([src/presentation/middlewares/autorizacao.js](src/presentation/middlewares/autorizacao.js)):
```javascript
function autorizacao(tiposPermitidos) {
  return (req, res, next) => {
    if (!tiposPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({ 
        erro: 'Acesso negado' 
      });
    }
    next();
  };
}
```

**`tratarErros`** ([src/presentation/middlewares/tratarErros.js](src/presentation/middlewares/tratarErros.js)):
```javascript
function tratarErros(erro, req, res, next) {
  console.error(erro);
  
  if (erro.name === 'ValidationError') {
    return res.status(400).json({ erro: erro.message });
  }
  
  if (erro.code === 11000) {
    return res.status(409).json({ erro: 'Email já cadastrado' });
  }
  
  res.status(500).json({ erro: 'Erro interno do servidor' });
}
```

#### Routes

**`authRoutes`** ([src/presentation/routes/authRoutes.js](src/presentation/routes/authRoutes.js)):
```javascript
const router = express.Router();

router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.get('/perfil', autenticar, authController.perfil);

module.exports = router;
```

**`atividadeRoutes`** ([src/presentation/routes/atividadeRoutes.js](src/presentation/routes/atividadeRoutes.js)):
```javascript
const router = express.Router();

router.post('/', 
  autenticar, 
  autorizacao(['professor']), 
  atividadeController.criar
);

router.get('/', autenticar, atividadeController.listar);
router.get('/:id', autenticar, atividadeController.buscarPorId);

router.put('/:id', 
  autenticar, 
  autorizacao(['professor']), 
  atividadeController.atualizar
);

router.delete('/:id', 
  autenticar, 
  autorizacao(['professor']), 
  atividadeController.deletar
);

router.post('/:id/duplicar', 
  autenticar, 
  autorizacao(['professor']), 
  atividadeController.duplicar
);

module.exports = router;
```

---

## 🔄 Fluxo de Dados

### Exemplo: Criar Atividade

```
┌─────────────────┐
│  HTTP Request   │
│  POST /atividades│
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Route: atividadeRoutes │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Middleware: autenticar │ ← Valida JWT
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Middleware: autorizacao│ ← Verifica tipo = professor
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Controller: criar()        │ ← Extrai dados do req
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Use Case: CriarAtividadeUseCase│ ← Lógica de aplicação
│  1. Valida professor            │
│  2. Cria entidade Atividade     │
│  3. Chama repositório           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Entity: Atividade          │ ← Validações de negócio
│  Valida campos obrigatórios │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Repository: criar()        │ ← Acesso ao banco
│  1. Cria AtividadeModel     │
│  2. Salva no MongoDB        │
│  3. Retorna entidade        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Controller: criar()    │ ← Formata resposta
│  res.status(201).json() │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Response  │
│  201 Created    │
└─────────────────┘
```

---

## 🎨 Padrões de Projeto

### 1. Repository Pattern

**Objetivo**: Abstrair o acesso aos dados

**Implementação**:
```javascript
// Interface (implícita em JavaScript)
class IUsuarioRepository {
  async criar(usuario) {}
  async buscarPorId(id) {}
  async buscarPorEmail(email) {}
}

// Implementação
class UsuarioRepository extends IUsuarioRepository {
  async criar(usuario) {
    // Implementação com Mongoose
  }
}
```

### 2. Dependency Injection

**Objetivo**: Desacoplar dependências

**Implementação**:
```javascript
// ❌ Ruim: Dependência hard-coded
class CriarAtividadeUseCase {
  constructor() {
    this.repository = new AtividadeRepository(); // Hard-coded
  }
}

// ✅ Bom: Injeção de dependência
class CriarAtividadeUseCase {
  constructor(atividadeRepository) {
    this.repository = atividadeRepository; // Injetado
  }
}

// Uso
const repository = new AtividadeRepository();
const useCase = new CriarAtividadeUseCase(repository);
```

### 3. Use Case Pattern

**Objetivo**: Encapsular regras de aplicação

**Estrutura**:
```javascript
class NomeDoUseCase {
  constructor(dependencias) {
    this.dependencias = dependencias;
  }
  
  async executar(parametros) {
    // 1. Validação
    // 2. Lógica de negócio
    // 3. Chamada a repositórios
    // 4. Retorno
  }
}
```

### 4. Entity Pattern

**Objetivo**: Encapsular regras de negócio

**Estrutura**:
```javascript
class Entidade {
  constructor(dados) {
    this.validar(dados);
    this.propriedade = dados.propriedade;
  }
  
  validar(dados) {
    // Validações de negócio
  }
  
  metodoDeNegocio() {
    // Lógica de negócio
  }
}
```

### 5. Middleware Pattern

**Objetivo**: Pipeline de processamento

**Implementação**:
```javascript
app.use(middleware1);
app.use(middleware2);
app.use(middleware3);

// Ordem: middleware1 → middleware2 → middleware3 → route handler
```

---

## 📁 Estrutura de Diretórios

```
src/
├── app.js                      # Configuração do Express
├── server.js                   # Inicialização do servidor
│
├── config/                     # Configurações
│   ├── database.js            # Conexão MongoDB
│   ├── env.js                 # Variáveis de ambiente
│   └── swagger.js             # Configuração Swagger
│
├── domain/                     # Camada de Domínio
│   └── entities/              # Entidades de negócio
│       ├── Usuario.js         # Entidade Usuario
│       └── Atividade.js       # Entidade Atividade
│
├── application/                # Camada de Aplicação
│   └── use-cases/             # Casos de uso
│       ├── RegistrarUsuarioUseCase.js
│       ├── LoginUsuarioUseCase.js
│       ├── CriarAtividadeUseCase.js
│       ├── ListarAtividadesUseCase.js
│       ├── AtualizarAtividadeUseCase.js
│       ├── DeletarAtividadeUseCase.js
│       └── DuplicarAtividadeUseCase.js
│
├── infrastructure/             # Camada de Infraestrutura
│   ├── database/              # Banco de dados
│   │   └── models/            # Modelos Mongoose
│   │       ├── UsuarioModel.js
│   │       └── AtividadeModel.js
│   │
│   └── repositories/          # Implementação de repositórios
│       ├── UsuarioRepository.js
│       └── AtividadeRepository.js
│
└── presentation/              # Camada de Apresentação
    ├── controllers/           # Controladores HTTP
    │   ├── AuthController.js
    │   └── AtividadeController.js
    │
    ├── middlewares/           # Middlewares Express
    │   ├── autenticar.js     # Middleware de autenticação
    │   ├── autorizacao.js    # Middleware de autorização
    │   └── tratarErros.js    # Middleware de erros
    │
    └── routes/                # Definição de rotas
        ├── index.js          # Rotas principais
        ├── authRoutes.js     # Rotas de autenticação
        └── atividadeRoutes.js # Rotas de atividades
```

---

## 🔧 Tecnologias por Camada

### Domain Layer
- **JavaScript puro** (ES6+)
- Sem dependências externas

### Application Layer
- **JavaScript ES6+**
- `bcryptjs` - Hash de senhas
- `jsonwebtoken` - Geração de tokens

### Infrastructure Layer
- **Mongoose** - ODM para MongoDB
- **MongoDB** - Banco de dados NoSQL

### Presentation Layer
- **Express.js** - Framework web
- **cors** - Middleware CORS
- **swagger-ui-express** - Documentação

---

## 🎯 Decisões Arquiteturais

### 1. Por que Clean Architecture?

**Justificativa**:
- ✅ **Testabilidade**: Lógica de negócio pode ser testada isoladamente
- ✅ **Manutenibilidade**: Mudanças em uma camada não afetam outras
- ✅ **Escalabilidade**: Fácil adicionar novas funcionalidades
- ✅ **Flexibilidade**: Trocar tecnologias sem reescrever tudo

### 2. Por que Mongoose/MongoDB?

**Justificativa**:
- ✅ **Flexibilidade de Schema**: Estrutura de dados pode evoluir
- ✅ **Performance**: Ótimo para operações de leitura
- ✅ **Escalabilidade Horizontal**: Fácil escalar com sharding
- ✅ **JSON Nativo**: Fácil integração com Node.js

### 3. Por que JWT?

**Justificativa**:
- ✅ **Stateless**: Não precisa armazenar sessões no servidor
- ✅ **Escalabilidade**: Funciona bem em ambientes distribuídos
- ✅ **Padrão da Indústria**: Amplamente suportado
- ✅ **Segurança**: Tokens assinados e verificáveis

### 4. Por que Express.js?

**Justificativa**:
- ✅ **Maduro e Estável**: Amplamente testado em produção
- ✅ **Minimalista**: Não impõe estrutura rígida
- ✅ **Middleware Ecosystem**: Grande variedade de plugins
- ✅ **Performance**: Rápido e eficiente

---

## 📊 Diagramas

### Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│                    (React/Vue/etc.)                           │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                      Express.js API                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Auth     │  │ Atividades │  │   Health   │             │
│  │   Routes   │  │   Routes   │  │   Route    │             │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘             │
│        │               │               │                     │
│        ▼               ▼               ▼                     │
│  ┌────────────┐  ┌────────────┐                             │
│  │   Auth     │  │ Atividade  │                             │
│  │ Controller │  │ Controller │                             │
│  └─────┬──────┘  └─────┬──────┘                             │
│        │               │                                     │
│        ▼               ▼                                     │
│  ┌────────────────────────────┐                             │
│  │       Use Cases            │                             │
│  └─────┬──────────────┬───────┘                             │
│        │              │                                     │
│        ▼              ▼                                     │
│  ┌────────────┐  ┌────────────┐                             │
│  │  Entities  │  │Repositories│                             │
│  └────────────┘  └─────┬──────┘                             │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   MongoDB   │
                  └─────────────┘
```

### Diagrama de Autenticação

```
┌────────┐                                ┌────────┐
│ Client │                                │  API   │
└───┬────┘                                └───┬────┘
    │                                         │
    │ POST /auth/registrar                   │
    ├────────────────────────────────────────►
    │  { nome, email, senha, tipo }          │
    │                                         │
    │                          ┌─────────────┴──────────┐
    │                          │ 1. Valida dados        │
    │                          │ 2. Hash senha          │
    │                          │ 3. Salva no banco      │
    │                          │ 4. Gera JWT token      │
    │                          └─────────────┬──────────┘
    │                                         │
    │ { usuario, token }                      │
    ◄────────────────────────────────────────┤
    │                                         │
    │ GET /atividades                         │
    ├────────────────────────────────────────►
    │ Authorization: Bearer {token}           │
    │                                         │
    │                          ┌─────────────┴──────────┐
    │                          │ 1. Verifica token      │
    │                          │ 2. Busca usuário       │
    │                          │ 3. Autoriza acesso     │
    │                          │ 4. Retorna dados       │
    │                          └─────────────┬──────────┘
    │                                         │
    │ [atividades]                            │
    ◄────────────────────────────────────────┤
    │                                         │
```

---

## 🔒 Segurança

### Camadas de Segurança

1. **Autenticação (JWT)**
   - Tokens assinados com secret
   - Expiração configurável
   - Validação em cada request

2. **Autorização (RBAC)**
   - Controle baseado em tipo de usuário
   - Middleware de autorização
   - Validação de propriedade de recursos

3. **Validação de Dados**
   - Validação na camada de domínio
   - Validação na camada de apresentação
   - Sanitização de entradas

4. **Proteção de Senhas**
   - Hash com bcrypt (10 rounds)
   - Nunca retorna senha em respostas
   - Validação de força de senha

5. **CORS**
   - Configuração restritiva
   - Apenas origens permitidas
   - Headers controlados

---

## 📈 Performance

### Otimizações Implementadas

1. **Índices no MongoDB**
   - Índice único em `Usuario.email`
   - Índices compostos em `Atividade`
   - Índices para queries frequentes

2. **Populate Seletivo**
   - Apenas campos necessários
   - Evita over-fetching

3. **Validação Early Return**
   - Validações rápidas primeiro
   - Falha rápida para requests inválidos

4. **Connection Pooling**
   - Pool de conexões MongoDB
   - Reuso de conexões

---

## 🧪 Testabilidade

### Estratégia de Testes

```
┌────────────────────────────────────────┐
│         Testes E2E (Supertest)         │
│     Testa API de ponta a ponta         │
└────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────┐
│      Testes de Integração (Jest)       │
│   Testa interação entre camadas        │
└────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────┐
│       Testes Unitários (Jest)          │
│  Testa componentes isoladamente        │
└────────────────────────────────────────┘
```

### Vantagens da Arquitetura para Testes

- ✅ **Domain Layer**: Testes unitários puros (sem mocks)
- ✅ **Application Layer**: Mocks apenas de repositórios
- ✅ **Infrastructure Layer**: Testes de integração com MongoDB
- ✅ **Presentation Layer**: Testes E2E com Supertest

---

## 🚀 Escalabilidade

### Horizontal Scaling

A arquitetura suporta escalabilidade horizontal:

```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴───┬───────┬───────┐
   │       │       │       │
   ▼       ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ API │ │ API │ │ API │ │ API │
│  1  │ │  2  │ │  3  │ │  4  │
└──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
   │       │       │       │
   └───┬───┴───┬───┴───┬───┘
       │       │       │
       ▼       ▼       ▼
    ┌─────────────────────┐
    │   MongoDB Cluster   │
    │  (Replica Set)      │
    └─────────────────────┘
```

**Vantagens**:
- ✅ Stateless (JWT)
- ✅ Sem sessões no servidor
- ✅ Múltiplas instâncias
- ✅ Auto-scaling facilitado

---

## 📚 Referências

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Performance Best Practices](https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/)

---

<div align="center">

**🏗️ AulaPronta - Architecture Documentation**

Versão 1.0.0 | Atualizado em: Fevereiro 2024

</div>
