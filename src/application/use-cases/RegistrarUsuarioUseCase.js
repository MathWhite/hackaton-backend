const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../../domain/entities/Usuario');
const config = require('../../config/env');

class RegistrarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async executar({ nome, email, senha, tipo }) {
    // Validação básica
    if (!nome || !email || !senha || !tipo) {
      throw new Error('Todos os campos são obrigatórios.');
    }

    // Verifica se email já existe
    const emailExiste = await this.usuarioRepository.emailJaExiste(email);
    if (emailExiste) {
      throw new Error('Email já cadastrado.');
    }

    // Cria a entidade e valida
    const usuario = new Usuario({ nome, email, senha, tipo });
    usuario.validar();

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    usuario.senha = senhaHash;

    // Salva no repositório
    const usuarioCriado = await this.usuarioRepository.criar(usuario);

    // Remove a senha do retorno
    delete usuarioCriado.senha;

    return {
      usuario: usuarioCriado,
      mensagem: 'Usuário registrado com sucesso.'
    };
  }
}

module.exports = RegistrarUsuarioUseCase;
