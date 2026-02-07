const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../../src/infrastructure/database/models/UsuarioModel');
const config = require('../../src/config/env');

/**
 * Cria um usuário de teste no banco
 */
async function criarUsuarioTeste(dadosUsuario = {}) {
  const usuarioPadrao = {
    nome: 'Usuario Teste',
    email: 'teste@exemplo.com',
    senha: '123456',
    tipo: 'professor'
  };

  const usuario = { ...usuarioPadrao, ...dadosUsuario };
  const senhaHash = await bcrypt.hash(usuario.senha, 10);

  const usuarioCriado = await UsuarioModel.create({
    ...usuario,
    senha: senhaHash
  });

  return {
    usuario: usuarioCriado,
    senhaPlain: usuario.senha
  };
}

/**
 * Gera um token JWT para testes
 */
function gerarTokenTeste(usuario) {
  return jwt.sign(
    {
      id: usuario._id.toString(),
      email: usuario.email,
      tipo: usuario.tipo
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * Cria um professor de teste com token
 */
async function criarProfessorComToken(emailSuffix = '') {
  const timestamp = Date.now();
  const suffix = emailSuffix || timestamp;
  const { usuario, senhaPlain } = await criarUsuarioTeste({
    nome: `Professor Teste ${suffix}`,
    email: `professor${suffix}@teste.com`,
    tipo: 'professor'
  });

  const token = gerarTokenTeste(usuario);

  return {
    professor: usuario,
    senhaPlain,
    token
  };
}

/**
 * Cria um aluno de teste com token
 */
async function criarAlunoComToken(emailSuffix = '') {
  const timestamp = Date.now();
  const suffix = emailSuffix || timestamp;
  const { usuario, senhaPlain } = await criarUsuarioTeste({
    nome: `Aluno Teste ${suffix}`,
    email: `aluno${suffix}@teste.com`,
    tipo: 'aluno'
  });

  const token = gerarTokenTeste(usuario);

  return {
    aluno: usuario,
    senhaPlain,
    token
  };
}

/**
 * Limpa o banco de dados de teste
 */
async function limparBanco() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = {
  criarUsuarioTeste,
  gerarTokenTeste,
  criarProfessorComToken,
  criarAlunoComToken,
  limparBanco
};
