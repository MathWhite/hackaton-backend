const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');
const ListarAlunosUseCase = require('../../application/use-cases/ListarAlunosUseCase');
const ListarProfessoresUseCase = require('../../application/use-cases/ListarProfessoresUseCase');
const AtualizarUsuarioUseCase = require('../../application/use-cases/AtualizarUsuarioUseCase');
const DeletarUsuarioUseCase = require('../../application/use-cases/DeletarUsuarioUseCase');

class UsuarioController {
  constructor() {
    this.usuarioRepository = new UsuarioRepository();
    this.listarAlunosUseCase = new ListarAlunosUseCase(this.usuarioRepository);
    this.listarProfessoresUseCase = new ListarProfessoresUseCase(this.usuarioRepository);
    this.atualizarUsuarioUseCase = new AtualizarUsuarioUseCase(this.usuarioRepository);
    this.deletarUsuarioUseCase = new DeletarUsuarioUseCase(this.usuarioRepository);
  }

  /**
   * Lista todos os alunos
   */
  async listarAlunos(req, res, next) {
    try {
      const resultado = await this.listarAlunosUseCase.executar();
      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Lista todos os professores
   */
  async listarProfessores(req, res, next) {
    try {
      const resultado = await this.listarProfessoresUseCase.executar();
      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Atualiza um aluno
   */
  async atualizarAluno(req, res, next) {
    try {
      const { id } = req.params;
      const dadosAtualizados = req.body;
      const usuarioLogado = req.usuario;

      // Verifica se o usuário a ser atualizado é realmente um aluno
      const usuario = await this.usuarioRepository.buscarPorId(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Aluno não encontrado.' });
      }
      
      if (usuario.tipo !== 'aluno') {
        return res.status(400).json({ erro: 'O usuário especificado não é um aluno.' });
      }

      const resultado = await this.atualizarUsuarioUseCase.executar(
        id,
        dadosAtualizados,
        usuarioLogado
      );

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Atualiza um professor
   */
  async atualizarProfessor(req, res, next) {
    try {
      const { id } = req.params;
      const dadosAtualizados = req.body;
      const usuarioLogado = req.usuario;

      // Verifica se o usuário a ser atualizado é realmente um professor
      const usuario = await this.usuarioRepository.buscarPorId(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Professor não encontrado.' });
      }
      
      if (usuario.tipo !== 'professor') {
        return res.status(400).json({ erro: 'O usuário especificado não é um professor.' });
      }

      const resultado = await this.atualizarUsuarioUseCase.executar(
        id,
        dadosAtualizados,
        usuarioLogado
      );

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Deleta um aluno
   */
  async deletarAluno(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioLogado = req.usuario;

      // Verifica se o usuário a ser deletado é realmente um aluno
      const usuario = await this.usuarioRepository.buscarPorId(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Aluno não encontrado.' });
      }
      
      if (usuario.tipo !== 'aluno') {
        return res.status(400).json({ erro: 'O usuário especificado não é um aluno.' });
      }

      const resultado = await this.deletarUsuarioUseCase.executar(id, usuarioLogado);

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Deleta um professor
   */
  async deletarProfessor(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioLogado = req.usuario;

      // Verifica se o usuário a ser deletado é realmente um professor
      const usuario = await this.usuarioRepository.buscarPorId(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Professor não encontrado.' });
      }
      
      if (usuario.tipo !== 'professor') {
        return res.status(400).json({ erro: 'O usuário especificado não é um professor.' });
      }

      const resultado = await this.deletarUsuarioUseCase.executar(id, usuarioLogado);

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = UsuarioController;
