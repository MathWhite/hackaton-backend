# 📚 Documentação Completa da API - AulaPronta

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Autenticação](#-autenticação)
- [Endpoints](#-endpoints)
  - [Health Check](#health-check)
  - [Autenticação](#endpoints-de-autenticação)
  - [Usuários](#endpoints-de-usuários)
  - [Atividades](#endpoints-de-atividades)
- [Schemas](#-schemas)
- [Códigos de Status](#-códigos-de-status)
- [Tratamento de Erros](#-tratamento-de-erros)
- [Exemplos Práticos](#-exemplos-práticos)

## 🌐 Visão Geral

**Base URL**: `http://localhost:3000/api`

**Formato**: JSON

**Autenticação**: JWT Bearer Token

**Headers Padrão**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

## 🔐 Autenticação

A API usa **JSON Web Tokens (JWT)** para autenticação.

### Fluxo de Autenticação

1. Registrar um novo usuário (`POST /auth/registrar`)
2. Fazer login (`POST /auth/login`)
3. Receber o token JWT
4. Incluir o token no header `Authorization: Bearer {token}`
5. Acessar endpoints protegidos

### Token JWT

**Validade**: 7 dias (configurável via `JWT_EXPIRES_IN`)

**Formato do Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Payload do Token**:
```json
{
  "id": "65abc123def456789",
  "email": "usuario@exemplo.com",
  "tipo": "professor",
  "iat": 1704067200,
  "exp": 1704672000
}
```

## 🔌 Endpoints

### Health Check

#### `GET /api/health`

Verifica se a API está funcionando.

**Autenticação**: Não requerida

**Resposta de Sucesso** (200):
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Exemplo cURL**:
```bash
curl http://localhost:3000/api/health
```

---

### Endpoints de Autenticação

#### `POST /api/auth/registrar`

Registra um novo usuário (professor ou aluno).

**Autenticação**: Não requerida

**Request Body**:
```json
{
  "nome": "Maria Silva",
  "email": "maria.silva@escola.com",
  "senha": "senha123",
  "tipo": "professor"
}
```

**Campos**:
- `nome` (string, obrigatório): Nome completo do usuário
- `email` (string, obrigatório): Email único do usuário
- `senha` (string, obrigatório): Senha (mínimo 6 caracteres)
- `tipo` (string, obrigatório): "professor" ou "aluno"

**Resposta de Sucesso** (201):
```json
{
  "mensagem": "Usuário registrado com sucesso",
  "usuario": {
    "id": "65abc123def456789",
    "nome": "Maria Silva",
    "email": "maria.silva@escola.com",
    "tipo": "professor"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros Possíveis**:
- `400`: Dados inválidos
- `409`: Email já cadastrado

**Exemplo cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria.silva@escola.com",
    "senha": "senha123",
    "tipo": "professor"
  }'
```

---

#### `POST /api/auth/login`

Autentica um usuário e retorna um token JWT.

**Autenticação**: Não requerida

**Request Body**:
```json
{
  "email": "maria.silva@escola.com",
  "senha": "senha123"
}
```

**Campos**:
- `email` (string, obrigatório): Email do usuário
- `senha` (string, obrigatório): Senha do usuário

**Resposta de Sucesso** (200):
```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "65abc123def456789",
    "nome": "Maria Silva",
    "email": "maria.silva@escola.com",
    "tipo": "professor"
  }
}
```

**Erros Possíveis**:
- `400`: Dados inválidos
- `401`: Credenciais inválidas

**Exemplo cURL**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.silva@escola.com",
    "senha": "senha123"
  }'
```

---

#### `GET /api/auth/perfil`

Retorna os dados do usuário autenticado.

**Autenticação**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
{
  "id": "65abc123def456789",
  "nome": "Maria Silva",
  "email": "maria.silva@escola.com",
  "tipo": "professor",
  "criadoEm": "2024-01-01T12:00:00.000Z"
}
```

**Erros Possíveis**:
- `401`: Token inválido ou ausente
- `404`: Usuário não encontrado

**Exemplo cURL**:
```bash
curl http://localhost:3000/api/auth/perfil \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### Endpoints de Usuários

#### `GET /api/usuarios/alunos`

Lista todos os alunos cadastrados no sistema.

**Autenticação**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
{
  "alunos": [
    {
      "id": "65abc123def456789",
      "nome": "João Silva",
      "email": "joao.silva@escola.com",
      "tipo": "aluno",
      "criadoEm": "2024-01-01T10:00:00.000Z",
      "atualizadoEm": "2024-01-01T10:00:00.000Z"
    }
  ],
  "total": 1,
  "mensagem": "Alunos listados com sucesso."
}
```

**Erros Possíveis**:
- `401`: Token não fornecido ou inválido

**Exemplo cURL**:
```bash
curl http://localhost:3000/api/usuarios/alunos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

#### `GET /api/usuarios/professores`

Lista todos os professores cadastrados no sistema.

**Autenticação**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
{
  "professores": [
    {
      "id": "65abc123def456789",
      "nome": "Maria Santos",
      "email": "maria.santos@escola.com",
      "tipo": "professor",
      "criadoEm": "2024-01-01T09:00:00.000Z",
      "atualizadoEm": "2024-01-01T09:00:00.000Z"
    }
  ],
  "total": 1,
  "mensagem": "Professores listados com sucesso."
}
```

**Erros Possíveis**:
- `401`: Token não fornecido ou inválido

**Exemplo cURL**:
```bash
curl http://localhost:3000/api/usuarios/professores \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

#### `PUT /api/usuarios/alunos/:id`

Atualiza os dados de um aluno.

**Autenticação**: Requerida

**Permissões**: O próprio aluno pode atualizar seus dados, ou um professor pode atualizar qualquer aluno.

**Parâmetros de URL**:
- `id` (string): ID do aluno a ser atualizado

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "nome": "João Silva Atualizado",
  "email": "joao.novo@escola.com"
}
```

**Campos**:
- `nome` (string, opcional): Novo nome do aluno
- `email` (string, opcional): Novo email (deve ser único)

**Resposta de Sucesso** (200):
```json
{
  "usuario": {
    "id": "65abc123def456789",
    "nome": "João Silva Atualizado",
    "email": "joao.novo@escola.com",
    "tipo": "aluno",
    "criadoEm": "2024-01-01T10:00:00.000Z",
    "atualizadoEm": "2024-01-02T15:00:00.000Z"
  },
  "mensagem": "Usuário atualizado com sucesso."
}
```

**Erros Possíveis**:
- `400`: Usuário especificado não é um aluno
- `401`: Token não fornecido ou inválido
- `403`: Sem permissão para atualizar este usuário
- `404`: Aluno não encontrado

**Exemplo cURL**:
```bash
curl -X PUT http://localhost:3000/api/usuarios/alunos/65abc123def456789 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva Atualizado"
  }'
```

---

#### `PUT /api/usuarios/professores/:id`

Atualiza os dados de um professor.

**Autenticação**: Requerida

**Permissões**: O próprio professor pode atualizar seus dados, ou outro professor pode atualizar.

**Parâmetros de URL**:
- `id` (string): ID do professor a ser atualizado

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "nome": "Maria Santos Atualizada",
  "email": "maria.nova@escola.com"
}
```

**Resposta de Sucesso** (200):
```json
{
  "usuario": {
    "id": "65abc123def456789",
    "nome": "Maria Santos Atualizada",
    "email": "maria.nova@escola.com",
    "tipo": "professor",
    "criadoEm": "2024-01-01T09:00:00.000Z",
    "atualizadoEm": "2024-01-02T16:00:00.000Z"
  },
  "mensagem": "Usuário atualizado com sucesso."
}
```

**Erros Possíveis**:
- `400`: Usuário especificado não é um professor
- `401`: Token não fornecido ou inválido
- `403`: Sem permissão para atualizar este usuário
- `404`: Professor não encontrado

---

#### `DELETE /api/usuarios/alunos/:id`

Deleta um aluno do sistema.

**Autenticação**: Requerida

**Permissões**: O próprio aluno pode se deletar, ou um professor pode deletar qualquer aluno.

**Parâmetros de URL**:
- `id` (string): ID do aluno a ser deletado

**Headers**:
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
{
  "mensagem": "Usuário deletado com sucesso."
}
```

**Erros Possíveis**:
- `400`: Usuário especificado não é um aluno
- `401`: Token não fornecido ou inválido
- `403`: Sem permissão para deletar este usuário
- `404`: Aluno não encontrado

**Exemplo cURL**:
```bash
curl -X DELETE http://localhost:3000/api/usuarios/alunos/65abc123def456789 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

#### `DELETE /api/usuarios/professores/:id`

Deleta um professor do sistema.

**Autenticação**: Requerida

**Permissões**: O próprio professor pode se deletar, ou outro professor pode deletar.

**Parâmetros de URL**:
- `id` (string): ID do professor a ser deletado

**Headers**:
```
Authorization: Bearer {token}
```

**Resposta de Sucesso** (200):
```json
{
  "mensagem": "Usuário deletado com sucesso."
}
```

**Erros Possíveis**:
- `400`: Usuário especificado não é um professor
- `401`: Token não fornecido ou inválido
- `403`: Sem permissão para deletar este usuário
- `404`: Professor não encontrado

**Exemplo cURL**:
```bash
curl -X DELETE http://localhost:3000/api/usuarios/professores/65abc123def456789 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### Endpoints de Atividades

#### `POST /api/atividades`

Cria uma nova atividade pedagógica.

**Autenticação**: Requerida (apenas professores)

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "titulo": "Equações de Segundo Grau",
  "descricao": "Exercícios práticos sobre equações quadráticas",
  "disciplina": "Matemática",
  "serie": "9º ano",
  "objetivo": "Desenvolver habilidades de resolução de equações",
  "materiaisApoio": [
    {
      "tipo": "pdf",
      "conteudo": "https://exemplo.com/material.pdf"
    },
    {
      "tipo": "video",
      "conteudo": "https://youtube.com/watch?v=exemplo"
    }
  ],
  "conteudo": [
    {
      "_id": "xxx",
      "pergunta": "Qual é a capital do Brasil?",
      "tipo": "alternativa",
      "alternativas": ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
      "resposta": "Brasília"
    },
    {
      "_id": "yyy",
      "pergunta": "Explique o conceito de fotossíntese",
      "tipo": "dissertativa",
      "alternativas": [],
      "resposta": null
    }
  ],
  "status": "publicada",
  "isPublica": true
}
```

**Campos**:
- `titulo` (string, obrigatório): Título da atividade
- `descricao` (string, opcional): Descrição detalhada
- `disciplina` (string, obrigatório): Disciplina (ex: Matemática, Português)
- `serie` (string, obrigatório): Série/ano escolar
- `objetivo` (string, opcional): Objetivo pedagógico
- `materiaisApoio` (array, opcional): Lista de materiais de apoio
  - `tipo` (string): Tipo do material (pdf, video, link, imagem)
  - `conteudo` (string): URL ou conteúdo do material
- `conteudo` (array, opcional): Lista de perguntas/questões da atividade
  - `_id` (string, opcional): ID da questão (gerado automaticamente)
  - `pergunta` (string, obrigatório): Texto da pergunta
  - `tipo` (string, obrigatório): "alternativa" ou "dissertativa"
  - `alternativas` (array de strings, opcional): Opções para questões de alternativa
  - `resposta` (string, opcional): Resposta correta ou null para dissertativas
- `status` (string, opcional): "rascunho" ou "publicada" (padrão: "rascunho")
- `isPublica` (boolean, opcional): Se a atividade é pública (padrão: false)

**Resposta de Sucesso** (201):
```json
{
  "id": "65def456abc789123",
  "titulo": "Equações de Segundo Grau",
  "descricao": "Exercícios práticos sobre equações quadráticas",
  "disciplina": "Matemática",
  "serie": "9º ano",
  "objetivo": "Desenvolver habilidades de resolução de equações",
  "materiaisApoio": [
    {
      "tipo": "pdf",
      "conteudo": "https://exemplo.com/material.pdf"
    }
  ],
  "professorId": {
    "id": "65abc123def456789",
    "nome": "Maria Silva"
  },
  "status": "publicada",
  "isPublica": true,
  "criadaEm": "2024-01-01T12:00:00.000Z",
  "atualizadaEm": "2024-01-01T12:00:00.000Z"
}
```

**Erros Possíveis**:
- `400`: Dados inválidos
- `401`: Token inválido ou ausente
- `403`: Usuário não é professor

**Exemplo cURL**:
```bash
curl -X POST http://localhost:3000/api/atividades \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Equações de Segundo Grau",
    "descricao": "Exercícios práticos",
    "disciplina": "Matemática",
    "serie": "9º ano",
    "status": "publicada",
    "isPublica": true
  }'
```

---

#### `GET /api/atividades`

Lista atividades com filtros opcionais.

**Autenticação**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters** (todos opcionais):
- `disciplina` (string): Filtrar por disciplina
- `serie` (string): Filtrar por série
- `status` (string): Filtrar por status ("rascunho" ou "publicada")

**Regras de Visualização**:
- **Professores**: Podem ver suas próprias atividades (públicas e privadas) + atividades públicas de outros
- **Alunos**: Podem ver apenas atividades públicas e publicadas

**Resposta de Sucesso** (200):
```json
[
  {
    "id": "65def456abc789123",
    "titulo": "Equações de Segundo Grau",
    "descricao": "Exercícios práticos",
    "disciplina": "Matemática",
    "serie": "9º ano",
    "objetivo": "Desenvolver habilidades",
    "materiaisApoio": [],
    "professorId": {
      "id": "65abc123def456789",
      "nome": "Maria Silva"
    },
    "status": "publicada",
    "isPublica": true,
    "criadaEm": "2024-01-01T12:00:00.000Z",
    "atualizadaEm": "2024-01-01T12:00:00.000Z"
  }
]
```

**Erros Possíveis**:
- `401`: Token inválido ou ausente

**Exemplos cURL**:

Listar todas:
```bash
curl http://localhost:3000/api/atividades \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Filtrar por disciplina:
```bash
curl "http://localhost:3000/api/atividades?disciplina=Matemática" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Filtrar por série:
```bash
curl "http://localhost:3000/api/atividades?serie=9º%20ano" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Filtrar por status:
```bash
curl "http://localhost:3000/api/atividades?status=publicada" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Múltiplos filtros:
```bash
curl "http://localhost:3000/api/atividades?disciplina=Matemática&serie=9º%20ano&status=publicada" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

#### `GET /api/atividades/:id`

Busca uma atividade específica por ID.

**Autenticação**: Requerida

**Headers**:
```
Authorization: Bearer {token}
```

**Path Parameters**:
- `id` (string): ID da atividade

**Regras de Acesso**:
- **Professores**: Podem ver suas próprias atividades + atividades públicas de outros
- **Alunos**: Podem ver apenas atividades públicas e publicadas

**Resposta de Sucesso** (200):
```json
{
  "id": "65def456abc789123",
  "titulo": "Equações de Segundo Grau",
  "descricao": "Exercícios práticos sobre equações quadráticas",
  "disciplina": "Matemática",
  "serie": "9º ano",
  "objetivo": "Desenvolver habilidades de resolução de equações",
  "materiaisApoio": [
    {
      "tipo": "pdf",
      "conteudo": "https://exemplo.com/material.pdf"
    }
  ],
  "professorId": {
    "id": "65abc123def456789",
    "nome": "Maria Silva"
  },
  "status": "publicada",
  "isPublica": true,
  "criadaEm": "2024-01-01T12:00:00.000Z",
  "atualizadaEm": "2024-01-01T12:00:00.000Z"
}
```

**Erros Possíveis**:
- `400`: ID inválido
- `401`: Token inválido ou ausente
- `403`: Sem permissão para visualizar
- `404`: Atividade não encontrada

**Exemplo cURL**:
```bash
curl http://localhost:3000/api/atividades/65def456abc789123 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

#### `PUT /api/atividades/:id`

Atualiza uma atividade existente.

**Autenticação**: Requerida (apenas o professor criador)

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters**:
- `id` (string): ID da atividade

**Request Body** (todos os campos são opcionais):
```json
{
  "titulo": "Equações de Segundo Grau - Revisão",
  "descricao": "Exercícios de revisão",
  "status": "publicada",
  "isPublica": true
}
```

**Resposta de Sucesso** (200):
```json
{
  "id": "65def456abc789123",
  "titulo": "Equações de Segundo Grau - Revisão",
  "descricao": "Exercícios de revisão",
  "disciplina": "Matemática",
  "serie": "9º ano",
  "objetivo": "Desenvolver habilidades de resolução de equações",
  "materiaisApoio": [],
  "professorId": {
    "id": "65abc123def456789",
    "nome": "Maria Silva"
  },
  "status": "publicada",
  "isPublica": true,
  "criadaEm": "2024-01-01T12:00:00.000Z",
  "atualizadaEm": "2024-01-02T14:30:00.000Z"
}
```

**Erros Possíveis**:
- `400`: Dados inválidos ou ID inválido
- `401`: Token inválido ou ausente
- `403`: Sem permissão (não é o professor criador)
- `404`: Atividade não encontrada

**Exemplo cURL**:
```bash
curl -X PUT http://localhost:3000/api/atividades/65def456abc789123 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Equações de Segundo Grau - Revisão",
    "status": "publicada"
  }'
```

---

#### `DELETE /api/atividades/:id`

Deleta uma atividade.

**Autenticação**: Requerida (apenas o professor criador)

**Headers**:
```
Authorization: Bearer {token}
```

**Path Parameters**:
- `id` (string): ID da atividade

**Resposta de Sucesso** (200):
```json
{
  "mensagem": "Atividade deletada com sucesso"
}
```

**Erros Possíveis**:
- `400`: ID inválido
- `401`: Token inválido ou ausente
- `403`: Sem permissão (não é o professor criador)
- `404`: Atividade não encontrada

**Exemplo cURL**:
```bash
curl -X DELETE http://localhost:3000/api/atividades/65def456abc789123 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

#### `POST /api/atividades/:id/duplicar`

Duplica uma atividade existente.

**Autenticação**: Requerida (apenas professores)

**Headers**:
```
Authorization: Bearer {token}
```

**Path Parameters**:
- `id` (string): ID da atividade a ser duplicada

**Comportamento**:
- Cria uma cópia completa da atividade
- O título recebe o sufixo " (Cópia)"
- O professor autenticado se torna o dono da cópia
- A cópia é criada como rascunho e privada

**Regras de Acesso**:
- Apenas professores podem duplicar
- Podem duplicar suas próprias atividades ou atividades públicas de outros

**Resposta de Sucesso** (201):
```json
{
  "id": "65xyz789def123456",
  "titulo": "Equações de Segundo Grau (Cópia)",
  "descricao": "Exercícios práticos sobre equações quadráticas",
  "disciplina": "Matemática",
  "serie": "9º ano",
  "objetivo": "Desenvolver habilidades de resolução de equações",
  "materiaisApoio": [
    {
      "tipo": "pdf",
      "conteudo": "https://exemplo.com/material.pdf"
    }
  ],
  "professorId": {
    "id": "65abc123def456789",
    "nome": "Maria Silva"
  },
  "status": "rascunho",
  "isPublica": false,
  "criadaEm": "2024-01-02T15:00:00.000Z",
  "atualizadaEm": "2024-01-02T15:00:00.000Z"
}
```

**Erros Possíveis**:
- `400`: ID inválido
- `401`: Token inválido ou ausente
- `403`: Sem permissão (não é professor ou atividade não é acessível)
- `404`: Atividade não encontrada

**Exemplo cURL**:
```bash
curl -X POST http://localhost:3000/api/atividades/65def456abc789123/duplicar \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📦 Schemas

### Schema: Usuario

```json
{
  "id": "string (ObjectId)",
  "nome": "string",
  "email": "string (único)",
  "senha": "string (hash bcrypt)",
  "tipo": "professor | aluno",
  "criadoEm": "Date (ISO 8601)",
  "atualizadoEm": "Date (ISO 8601)"
}
```

### Schema: Atividade

```json
{
  "id": "string (ObjectId)",
  "titulo": "string",
  "descricao": "string (opcional)",
  "disciplina": "string",
  "serie": "string",
  "objetivo": "string (opcional)",
  "materiaisApoio": [
    {
      "tipo": "pdf | video | link | imagem",
      "conteudo": "string (URL)"
    }
  ],
  "professorId": {
    "id": "string (ObjectId)",
    "nome": "string"
  },
  "status": "rascunho | publicada",
  "isPublica": "boolean",
  "criadaEm": "Date (ISO 8601)",
  "atualizadaEm": "Date (ISO 8601)"
}
```

### Schema: Material de Apoio

```json
{
  "tipo": "pdf | video | link | imagem",
  "conteudo": "string (URL)"
}
```

---

## 🚦 Códigos de Status

### Sucesso

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso

### Erros do Cliente

- `400 Bad Request`: Dados inválidos ou malformados
- `401 Unauthorized`: Token ausente ou inválido
- `403 Forbidden`: Sem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: email duplicado)

### Erros do Servidor

- `500 Internal Server Error`: Erro interno do servidor

---

## ⚠️ Tratamento de Erros

Todos os erros seguem o formato padrão:

```json
{
  "erro": "Mensagem descritiva do erro"
}
```

### Exemplos de Erros

**400 - Dados Inválidos**:
```json
{
  "erro": "Campos obrigatórios ausentes: titulo, disciplina"
}
```

**401 - Token Inválido**:
```json
{
  "erro": "Token inválido ou expirado"
}
```

**403 - Sem Permissão**:
```json
{
  "erro": "Apenas professores podem criar atividades"
}
```

**404 - Não Encontrado**:
```json
{
  "erro": "Atividade não encontrada"
}
```

**409 - Conflito**:
```json
{
  "erro": "Email já cadastrado"
}
```

**500 - Erro Interno**:
```json
{
  "erro": "Erro interno do servidor"
}
```

---

## 💻 Exemplos Práticos

### Fluxo Completo de Uso

#### 1. Registrar Professor

```bash
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Prof. Carlos Santos",
    "email": "carlos@escola.com",
    "senha": "senha123",
    "tipo": "professor"
  }'
```

Resposta:
```json
{
  "mensagem": "Usuário registrado com sucesso",
  "usuario": {
    "id": "65abc123",
    "nome": "Prof. Carlos Santos",
    "email": "carlos@escola.com",
    "tipo": "professor"
  },
  "token": "eyJhbGc..."
}
```

#### 2. Criar Atividade

```bash
TOKEN="eyJhbGc..."  # Token recebido no passo 1

curl -X POST http://localhost:3000/api/atividades \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Verbos Regulares",
    "descricao": "Exercícios de conjugação",
    "disciplina": "Português",
    "serie": "7º ano",
    "status": "publicada",
    "isPublica": true
  }'
```

Resposta:
```json
{
  "id": "65def456",
  "titulo": "Verbos Regulares",
  "disciplina": "Português",
  "serie": "7º ano",
  "professorId": {
    "id": "65abc123",
    "nome": "Prof. Carlos Santos"
  },
  "status": "publicada",
  "isPublica": true
}
```

#### 3. Registrar Aluno

```bash
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@aluno.com",
    "senha": "senha123",
    "tipo": "aluno"
  }'
```

#### 4. Aluno Lista Atividades Públicas

```bash
ALUNO_TOKEN="eyJhbG..."  # Token do aluno

curl http://localhost:3000/api/atividades \
  -H "Authorization: Bearer $ALUNO_TOKEN"
```

#### 5. Professor Duplica Atividade

```bash
ATIVIDADE_ID="65def456"  # ID da atividade a duplicar

curl -X POST http://localhost:3000/api/atividades/$ATIVIDADE_ID/duplicar \
  -H "Authorization: Bearer $TOKEN"
```

#### 6. Professor Atualiza Atividade

```bash
curl -X PUT http://localhost:3000/api/atividades/$ATIVIDADE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Verbos Regulares - Revisão",
    "status": "publicada"
  }'
```

#### 7. Professor Deleta Atividade

```bash
curl -X DELETE http://localhost:3000/api/atividades/$ATIVIDADE_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Exemplo com JavaScript (Axios)

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// 1. Registrar e fazer login
async function autenticar() {
  const loginResponse = await axios.post(`${API_URL}/auth/login`, {
    email: 'carlos@escola.com',
    senha: 'senha123'
  });
  
  return loginResponse.data.token;
}

// 2. Criar atividade
async function criarAtividade(token) {
  const response = await axios.post(
    `${API_URL}/atividades`,
    {
      titulo: 'Figuras Geométricas',
      descricao: 'Estudo de triângulos e quadriláteros',
      disciplina: 'Matemática',
      serie: '6º ano',
      status: 'publicada',
      isPublica: true
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
}

// 3. Listar atividades de Matemática
async function listarAtividades(token) {
  const response = await axios.get(
    `${API_URL}/atividades?disciplina=Matemática`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
}

// Executar
(async () => {
  try {
    const token = await autenticar();
    console.log('Autenticado com sucesso!');
    
    const novaAtividade = await criarAtividade(token);
    console.log('Atividade criada:', novaAtividade.titulo);
    
    const atividades = await listarAtividades(token);
    console.log(`Encontradas ${atividades.length} atividades`);
  } catch (erro) {
    console.error('Erro:', erro.response?.data || erro.message);
  }
})();
```

---

## 🔍 Dicas de Uso

### Segurança

1. **Nunca compartilhe seu JWT**: Trate como uma senha
2. **Use HTTPS em produção**: Nunca envie tokens via HTTP
3. **Tokens expiram**: Reautentique quando necessário
4. **Valide entradas**: A API valida, mas sempre sanitize no cliente

### Performance

1. **Use filtros**: Ao listar atividades, use query parameters para reduzir dados
2. **Cache local**: Armazene temporariamente dados que não mudam frequentemente
3. **Paginação**: Em ambientes de produção, implemente paginação

### Boas Práticas

1. **Trate erros**: Sempre implemente tratamento de erros
2. **Validação no cliente**: Valide antes de enviar para a API
3. **Feedback ao usuário**: Mostre mensagens claras de sucesso/erro
4. **Loading states**: Indique quando requests estão em andamento

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte o [README.md](./README.md)
2. Veja o [QUICKSTART.md](./QUICKSTART.md)
3. Acesse o Swagger: http://localhost:3000/api-docs
4. Use a coleção do Postman: [postman_collection.json](./postman_collection.json)
5. Abra uma issue no repositório

---

<div align="center">

**🎓 AulaPronta - API Documentation**

Versão 1.0.0 | Atualizado em: Fevereiro 2024

</div>
