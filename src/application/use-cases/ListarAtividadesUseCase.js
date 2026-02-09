const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');

class ListarAtividadesUseCase {
  constructor(atividadeRepository, usuarioRepository = null) {
    this.atividadeRepository = atividadeRepository;
    this.usuarioRepository = usuarioRepository || new UsuarioRepository();
  }

  async executar(usuarioId, usuarioTipo, filtros = {}) {
    let atividades;

    // Se for professor, lista suas atividades + atividades públicas de outros
    if (usuarioTipo === 'professor') {
      atividades = await this.atividadeRepository.listarTodas(usuarioId, filtros);
    } 
    // Se for aluno, lista apenas atividades nas quais está inscrito
    else if (usuarioTipo === 'aluno') {
      // Busca o email do aluno
      const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
      if (!usuario) {
        throw new Error('Usuário não encontrado.');
      }
      
      atividades = await this.atividadeRepository.listarPorAlunoInscrito(usuario.email, filtros);
    } 
    else {
      throw new Error('Tipo de usuário inválido.');
    }

    return {
      atividades,
      total: atividades.length
    };
  }
}

module.exports = ListarAtividadesUseCase;
