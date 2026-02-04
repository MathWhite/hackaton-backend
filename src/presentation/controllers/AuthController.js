const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');
const RegistrarUsuarioUseCase = require('../../application/use-cases/RegistrarUsuarioUseCase');
const LoginUsuarioUseCase = require('../../application/use-cases/LoginUsuarioUseCase');

class AuthController {
  constructor() {
    this.usuarioRepository = new UsuarioRepository();
    this.registrarUsuarioUseCase = new RegistrarUsuarioUseCase(this.usuarioRepository);
    this.loginUsuarioUseCase = new LoginUsuarioUseCase(this.usuarioRepository);
  }

  /**
   * Registra um novo usuário
   */
  async registrar(req, res, next) {
    try {
      const { nome, email, senha, tipo } = req.body;

      const resultado = await this.registrarUsuarioUseCase.executar({
        nome,
        email,
        senha,
        tipo
      });

      return res.status(201).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Realiza login
   */
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      const resultado = await this.loginUsuarioUseCase.executar({
        email,
        senha
      });

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Retorna dados do usuário autenticado
   */
  async perfil(req, res, next) {
    try {
      const usuario = await this.usuarioRepository.buscarPorId(req.usuario.id);

      if (!usuario) {
        return res.status(404).json({
          erro: 'Usuário não encontrado.'
        });
      }

      // Remove a senha
      delete usuario.senha;

      return res.status(200).json({ usuario });
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = AuthController;
