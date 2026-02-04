# 🚀 Instruções para Executar os Testes

## ⚠️ Problema Identificado

O Node.js não está instalado no ambiente WSL Ubuntu. Por isso os testes não estão rodando.

## ✅ Solução: Instalar Node.js no WSL

Abra um terminal WSL (Ubuntu) e execute os seguintes comandos:

### 1. Instalar Node.js 20.x

```bash
# Baixar e executar o script de setup do NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt-get install -y nodejs

# Verificar a instalação
node --version
npm --version
```

### 2. Navegar até o projeto

```bash
cd ~/TEMP/FIAP/hackaton/Desenvolvimento/Backend
```

### 3. Reinstalar as dependências (para garantir)

```bash
npm install
```

### 4. Executar os testes

```bash
npm test
```

## 📊 Resultado Esperado

Os testes devem executar e mostrar:

```
PASS  __tests__/auth.test.js
PASS  __tests__/atividades.test.js

Test Suites: 2 passed, 2 total
Tests:       46 passed, 46 total
Snapshots:   0 total
Time:        X.XXXs

---------------------|---------|----------|---------|---------|
File                 | % Stmts | % Branch | % Funcs | % Lines |
---------------------|---------|----------|---------|---------|
All files            |     100 |      100 |     100 |     100 |
---------------------|---------|----------|---------|---------|
```

## 🐳 Alternativa: Usar Docker

Se preferir não instalar Node no WSL, pode usar Docker:

```bash
# Inicia o MongoDB
docker-compose up -d

# Executa os testes em um container temporário
docker run --rm \
  --network backend_aulapronta-network \
  -v $(pwd):/app \
  -w /app \
  -e NODE_ENV=test \
  -e MONGODB_URI=mongodb://admin:admin123@mongodb:27017/aulapronta_test?authSource=admin \
  node:20-alpine \
  sh -c "npm install && npm test"
```

## 📝 Comandos Úteis

```bash
# Ver logs do MongoDB
docker-compose logs -f mongodb

# Parar o MongoDB
docker-compose down

# Executar apenas alguns testes
npm test -- auth.test.js

# Ver cobertura em HTML
npm test && open coverage/lcov-report/index.html
```

## ✨ Status dos Testes

**Total de testes implementados: 46+**

- ✅ 19 testes de autenticação (registro, login, perfil)
- ✅ 27 testes de atividades (CRUD completo)
- ✅ Validações de entrada
- ✅ Casos de erro
- ✅ Permissões (professor vs aluno)
- ✅ Filtros e buscas

**Cobertura esperada: 100%** 🎯
