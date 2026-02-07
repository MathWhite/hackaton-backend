# 🤝 Guia de Contribuição - AulaPronta Backend

Obrigado por considerar contribuir com o projeto **AulaPronta**! Este documento fornece diretrizes para contribuir com o backend da plataforma.

## 📋 Índice

- [Código de Conduta](#-código-de-conduta)
- [Como Contribuir](#-como-contribuir)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Padrões de Código](#-padrões-de-código)
- [Processo de Pull Request](#-processo-de-pull-request)
- [Testes](#-testes)
- [Commits](#-commits)
- [Reportar Bugs](#-reportar-bugs)
- [Sugerir Melhorias](#-sugerir-melhorias)

## 📜 Código de Conduta

Este projeto segue um código de conduta para garantir um ambiente acolhedor:

- ✅ Seja respeitoso e inclusivo
- ✅ Aceite críticas construtivas
- ✅ Foque no que é melhor para a comunidade
- ✅ Mostre empatia com outros membros

## 🚀 Como Contribuir

### 1. Fork o Repositório

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/aulapronta-backend.git
cd aulapronta-backend

# Adicione o repositório original como upstream
git remote add upstream https://github.com/aulapronta/backend.git
```

### 2. Crie uma Branch

Use nomes descritivos para suas branches:

```bash
# Para novas features
git checkout -b feature/nome-da-feature

# Para correções de bugs
git checkout -b fix/descricao-do-bug

# Para melhorias
git checkout -b improvement/descricao
```

### 3. Faça suas Alterações

Siga os padrões de código e arquitetura do projeto.

### 4. Teste suas Alterações

```bash
# Execute todos os testes
npm test

# Verifique a cobertura
npm run test:coverage

# A cobertura deve permanecer em 100%
```

### 5. Commit suas Mudanças

Siga o padrão de commits (veja seção [Commits](#-commits)).

### 6. Push para seu Fork

```bash
git push origin feature/nome-da-feature
```

### 7. Abra um Pull Request

Vá até o repositório original no GitHub e clique em "New Pull Request".

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js 20.x ou superior
- MongoDB 7.x ou superior
- Git

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env com suas configurações
```

### Executar em modo de desenvolvimento

```bash
npm run dev
```

### Executar testes

```bash
# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

## 📏 Padrões de Código

### Arquitetura

O projeto segue **Clean Architecture**:

```
src/
├── domain/           # Entidades e regras de negócio
│   └── entities/     # Entidades do domínio
├── application/      # Casos de uso
│   └── use-cases/    # Lógica de aplicação
├── infrastructure/   # Implementações técnicas
│   ├── database/     # Modelos do banco de dados
│   └── repositories/ # Implementação de repositórios
└── presentation/     # Camada de apresentação
    ├── controllers/  # Controladores HTTP
    ├── middlewares/  # Middlewares Express
    └── routes/       # Definição de rotas
```

### Princípios SOLID

- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

### Nomenclatura

#### Arquivos

- Use PascalCase para classes: `UsuarioRepository.js`
- Use camelCase para utilitários: `validarEmail.js`
- Use kebab-case para rotas: `auth-routes.js`

#### Variáveis e Funções

```javascript
// Variáveis: camelCase
const nomeCompleto = "Maria Silva";

// Constantes: UPPER_SNAKE_CASE
const MAX_TENTATIVAS = 3;

// Funções: camelCase com verbos
function criarUsuario() {}
function validarEmail() {}

// Classes: PascalCase
class Usuario {}
class AtividadeRepository {}
```

#### Entidades

```javascript
// Use nomes descritivos
class Usuario {
  constructor(dados) {
    this.nome = dados.nome;
    this.email = dados.email;
    // ...
  }
}
```

### Formatação

```javascript
// Use const para valores que não mudam
const PORTA = 3000;

// Use let para valores que mudam
let contador = 0;

// Evite var
// ❌ var x = 10;
// ✅ const x = 10;

// Use arrow functions quando apropriado
const somar = (a, b) => a + b;

// Use async/await ao invés de promises
// ❌
function buscarUsuario() {
  return Usuario.findById(id)
    .then(usuario => usuario)
    .catch(erro => console.error(erro));
}

// ✅
async function buscarUsuario() {
  try {
    const usuario = await Usuario.findById(id);
    return usuario;
  } catch (erro) {
    console.error(erro);
  }
}
```

### Tratamento de Erros

```javascript
// Use classes personalizadas de erro
class ErroValidacao extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroValidacao';
  }
}

// Lance erros específicos
if (!email) {
  throw new ErroValidacao('Email é obrigatório');
}

// Use try/catch em operações assíncronas
try {
  const usuario = await Usuario.criar(dados);
  return usuario;
} catch (erro) {
  if (erro.code === 11000) {
    throw new ErroValidacao('Email já cadastrado');
  }
  throw erro;
}
```

## 🔄 Processo de Pull Request

### Checklist antes de enviar

- [ ] Código segue os padrões do projeto
- [ ] Todos os testes passam (`npm test`)
- [ ] Cobertura de código mantém-se em 100%
- [ ] Documentação atualizada (se necessário)
- [ ] Commits seguem o padrão estabelecido
- [ ] Branch está atualizada com `main`

### Template de Pull Request

```markdown
## Descrição

Descreva suas mudanças aqui.

## Tipo de Mudança

- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist

- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Cobertura mantida em 100%

## Testes

Descreva os testes que você executou.

## Screenshots (se aplicável)

Adicione screenshots se houver mudanças visuais.
```

### Revisão de Código

- Seja respeitoso e construtivo
- Foque no código, não na pessoa
- Explique o "porquê" dos seus comentários
- Aceite feedback com gratidão

## 🧪 Testes

### Tipos de Testes

1. **Testes de Unidade**: Testam funções isoladas
2. **Testes de Integração**: Testam fluxos completos
3. **Testes E2E**: Testam a API como um todo

### Estrutura de Teste

```javascript
describe('UsuarioRepository', () => {
  describe('criar', () => {
    it('deve criar um usuário com dados válidos', async () => {
      // Arrange
      const dados = {
        nome: 'Maria Silva',
        email: 'maria@exemplo.com',
        senha: 'senha123',
        tipo: 'professor'
      };
      
      // Act
      const usuario = await usuarioRepository.criar(dados);
      
      // Assert
      expect(usuario).toBeDefined();
      expect(usuario.email).toBe(dados.email);
    });
    
    it('deve lançar erro para email duplicado', async () => {
      // Arrange & Act & Assert
      await expect(
        usuarioRepository.criar(dadosExistentes)
      ).rejects.toThrow('Email já cadastrado');
    });
  });
});
```

### Boas Práticas

- ✅ Teste casos de sucesso e falha
- ✅ Use nomes descritivos para testes
- ✅ Teste edge cases
- ✅ Mantenha testes independentes
- ✅ Use mocks quando necessário
- ✅ Limpe dados após cada teste

### Cobertura

O projeto exige **100% de cobertura**:

```bash
npm run test:coverage

# Deve mostrar:
# Statements   : 100%
# Branches     : 100%
# Functions    : 100%
# Lines        : 100%
```

## 📝 Commits

### Padrão de Commits

Use o padrão **Conventional Commits**:

```bash
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alteração em documentação
- `style`: Formatação (sem mudança de código)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Manutenção do projeto

### Exemplos

```bash
# Nova feature
feat(auth): adicionar autenticação JWT

# Correção de bug
fix(atividades): corrigir filtro por disciplina

# Documentação
docs(readme): atualizar instruções de instalação

# Refatoração
refactor(repositories): simplificar consultas ao banco

# Testes
test(auth): adicionar testes para registro de usuário

# Manutenção
chore(deps): atualizar dependências
```

### Escopo

Use escopos relevantes:

- `auth`: Autenticação
- `atividades`: Atividades
- `usuarios`: Usuários
- `database`: Banco de dados
- `tests`: Testes
- `docs`: Documentação

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifique se o bug já foi reportado
2. Use a versão mais recente do código
3. Colete informações sobre o bug

### Template de Bug Report

```markdown
**Descrição**
Descrição clara do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Execute '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que está acontecendo.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [ex: Ubuntu 22.04]
- Node.js: [ex: 20.10.0]
- MongoDB: [ex: 7.0.0]

**Informações Adicionais**
Qualquer outra informação relevante.
```

## 💡 Sugerir Melhorias

### Template de Feature Request

```markdown
**Descrição da Feature**
Descrição clara da feature sugerida.

**Motivação**
Por que essa feature seria útil?

**Alternativas Consideradas**
Outras soluções que você pensou.

**Contexto Adicional**
Qualquer outra informação relevante.
```

## 📚 Recursos Úteis

### Documentação

- [Node.js](https://nodejs.org/docs)
- [Express.js](https://expressjs.com)
- [MongoDB](https://docs.mongodb.com)
- [Mongoose](https://mongoosejs.com/docs)
- [Jest](https://jestjs.io/docs)

### Arquitetura

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

### Padrões

- [Conventional Commits](https://www.conventionalcommits.org)
- [Semantic Versioning](https://semver.org)

## ❓ Dúvidas?

Se tiver dúvidas sobre como contribuir:

1. Abra uma **Issue** com sua dúvida
2. Entre em contato com a equipe
3. Consulte a documentação existente

## 🙏 Agradecimentos

Obrigado por contribuir com o **AulaPronta**! Sua ajuda é fundamental para melhorar a educação através da tecnologia.

---

<div align="center">

**🎓 AulaPronta - Transformando a Educação através da Tecnologia**

Feito com ❤️ para professores e alunos da rede pública

</div>
