const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/env');

class LoginUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async executar({ email, senha }) {
    // Validação básica
    if (!email || !senha) {
      throw new Error('Email e senha são obrigatórios.');
    }

    // Busca usuário por email (com senha)
    const usuario = await this.usuarioRepository.buscarPorEmail(email);
    
    if (!usuario) {
      throw new Error('Credenciais inválidas.');
    }

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      throw new Error('Credenciais inválidas.');
    }

    // Gera token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn
      }
    );

    // Remove a senha do retorno
    delete usuario.senha;

    return {
      usuario,
      token,
      mensagem: 'Login realizado com sucesso.'
    };
  }
}

module.exports = LoginUsuarioUseCase;
