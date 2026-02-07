# 📖 Guia Rápido - API AulaPronta

Guia prático para começar a usar a API AulaPronta.

## 🚀 Início Rápido

### 1. Inicie o servidor

```bash
# Com Docker
docker-compose up -d
npm run dev

# Sem Docker (MongoDB local)
npm run dev
```

### 2. Acesse a documentação interativa

Abra seu navegador em: **http://localhost:3000/api-docs**

## 📝 Exemplos de Uso

### Passo 1: Registrar um Professor

```bash
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Prof. Maria Silva",
    "email": "maria.silva@escola.com",
    "senha": "senha123",
    "tipo": "professor"
  }'
```

**Resposta:**
```json
{
  "usuario": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "nome": "Prof. Maria Silva",
    "email": "maria.silva@escola.com",
    "tipo": "professor",
    "criadoEm": "2026-02-07T10:30:00.000Z"
  },
  "mensagem": "Usuário registrado com sucesso."
}
```

### Passo 2: Fazer Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.silva@escola.com",
    "senha": "senha123"
  }'
```

**Resposta:**
```json
{
  "usuario": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjFhMmIzYzRkNWU2ZjdnOGg5aTBqMSIsImVtYWlsIjoibWFyaWEuc2lsdmFAZXNjb2xhLmNvbSIsInRpcG8iOiJwcm9mZXNzb3IiLCJpYXQiOjE3MDcyOTg4MDAsImV4cCI6MTcwNzkwMzYwMH0.abc123xyz",
  "mensagem": "Login realizado com sucesso."
}
```

**💡 Importante**: Salve o token! Você usará em todas as requisições autenticadas.

### Passo 3: Criar uma Atividade

```bash
curl -X POST http://localhost:3000/api/atividades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "titulo": "Equações de Segundo Grau",
    "descricao": "Exercícios práticos sobre equações quadráticas com aplicações do cotidiano",
    "disciplina": "Matemática",
    "serie": "9º ano",
    "objetivo": "Desenvolver habilidades de resolução de equações de segundo grau",
    "materiaisApoio": [
      {
        "tipo": "pdf",
        "conteudo": "https://exemplo.com/material-equacoes.pdf"
      },
      {
        "tipo": "video",
        "conteudo": "https://youtube.com/watch?v=exemplo"
      }
    ],
    "status": "publicada",
    "isPublica": true,
    "dataEntrega": "2026-03-15T23:59:59.000Z"
  }'
```

### Passo 4: Listar Atividades

```bash
# Listar todas as suas atividades (professor)
curl -X GET http://localhost:3000/api/atividades \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Filtrar por disciplina
curl -X GET "http://localhost:3000/api/atividades?disciplina=Matemática" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Filtrar por série e status
curl -X GET "http://localhost:3000/api/atividades?serie=9º ano&status=publicada" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Passo 5: Buscar Atividade por ID

```bash
curl -X GET http://localhost:3000/api/atividades/65f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Passo 6: Atualizar Atividade

```bash
curl -X PUT http://localhost:3000/api/atividades/65f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "titulo": "Equações de Segundo Grau - Revisado",
    "status": "publicada",
    "isPublica": true
  }'
```

### Passo 7: Duplicar Atividade

```bash
curl -X POST http://localhost:3000/api/atividades/65f1a2b3c4d5e6f7g8h9i0j1/duplicar \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Passo 8: Deletar Atividade

```bash
curl -X DELETE http://localhost:3000/api/atividades/65f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🎯 Fluxo Completo para Alunos

### 1. Registrar Aluno

```bash
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Santos",
    "email": "joao.santos@aluno.com",
    "senha": "senha123",
    "tipo": "aluno"
  }'
```

### 2. Login do Aluno

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.santos@aluno.com",
    "senha": "senha123"
  }'
```

### 3. Ver Perfil

```bash
curl -X GET http://localhost:3000/api/auth/perfil \
  -H "Authorization: Bearer TOKEN_DO_ALUNO"
```

### 4. Listar Atividades Públicas

```bash
# Alunos só veem atividades públicas e publicadas
curl -X GET http://localhost:3000/api/atividades \
  -H "Authorization: Bearer TOKEN_DO_ALUNO"
```

## 🧪 Testando com JavaScript

### Usando Fetch API (navegador)

```javascript
// Registrar usuário
const registrar = async () => {
  const response = await fetch('http://localhost:3000/api/auth/registrar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nome: 'Teste User',
      email: 'teste@email.com',
      senha: 'senha123',
      tipo: 'professor'
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Login
const login = async () => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'teste@email.com',
      senha: 'senha123'
    })
  });
  
  const data = await response.json();
  const token = data.token;
  localStorage.setItem('token', token);
  return token;
};

// Criar atividade
const criarAtividade = async (token) => {
  const response = await fetch('http://localhost:3000/api/atividades', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      titulo: 'Minha Atividade',
      descricao: 'Descrição da atividade',
      disciplina: 'Matemática',
      serie: '9º ano'
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Listar atividades
const listarAtividades = async (token) => {
  const response = await fetch('http://localhost:3000/api/atividades', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data.atividades);
};
```

### Usando Axios (Node.js/Front-end)

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Criar instância do axios com configurações
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Exemplos de uso
const exemploCompleto = async () => {
  try {
    // 1. Registrar
    const registroRes = await api.post('/auth/registrar', {
      nome: 'Professor Teste',
      email: 'prof@teste.com',
      senha: 'senha123',
      tipo: 'professor'
    });
    console.log('Registrado:', registroRes.data);

    // 2. Login
    const loginRes = await api.post('/auth/login', {
      email: 'prof@teste.com',
      senha: 'senha123'
    });
    const token = loginRes.data.token;
    localStorage.setItem('token', token);
    console.log('Token:', token);

    // 3. Criar atividade
    const atividadeRes = await api.post('/atividades', {
      titulo: 'Nova Atividade',
      descricao: 'Descrição',
      disciplina: 'Português',
      serie: '8º ano'
    });
    console.log('Atividade criada:', atividadeRes.data);

    // 4. Listar atividades
    const listaRes = await api.get('/atividades');
    console.log('Atividades:', listaRes.data);

  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
};

exemploCompleto();
```

## 🔐 Autenticação JWT

O token JWT deve ser incluído no header `Authorization` de todas as requisições protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Estrutura do Token

O token contém:
- `id` - ID do usuário
- `email` - Email do usuário
- `tipo` - Tipo do usuário (professor/aluno)
- `iat` - Data de emissão
- `exp` - Data de expiração (7 dias)

## 📱 Códigos de Status HTTP

| Código | Significado | Quando ocorre |
|--------|-------------|---------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Sem permissão para acessar |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro no servidor |

## 🐛 Tratamento de Erros

Todos os erros seguem o mesmo formato:

```json
{
  "erro": "Mensagem de erro descritiva",
  "detalhes": ["Detalhes adicionais (opcional)"]
}
```

Exemplo de erro de validação:

```json
{
  "erro": "Erro de validação",
  "detalhes": [
    "Email é obrigatório",
    "Senha deve ter no mínimo 6 caracteres"
  ]
}
```

## 💡 Dicas e Boas Práticas

1. **Sempre salve o token** após o login
2. **Use HTTPS em produção** para proteger o token
3. **Implemente refresh token** para melhor UX
4. **Valide dados no cliente** antes de enviar
5. **Trate erros adequadamente** na UI
6. **Use o Swagger** para testar antes de integrar
7. **Monitore rate limits** em produção

## 🔗 Links Úteis

- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

## ❓ Perguntas Frequentes

### Como renovar o token expirado?
Faça login novamente para obter um novo token.

### Posso usar a API sem token?
Apenas os endpoints de registro, login e health check são públicos.

### Como um aluno acessa atividades?
Alunos veem apenas atividades públicas e com status "publicada".

### Posso duplicar atividades de outros professores?
Sim, mas apenas atividades públicas.

### Como filtrar atividades?
Use query parameters: `?disciplina=Matemática&serie=9º ano&status=publicada`

---

**📚 Documentação Completa**: [README.md](./README.md)
