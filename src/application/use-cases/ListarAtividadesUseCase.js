class ListarAtividadesUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(usuarioId, usuarioTipo, filtros = {}) {
    let atividades;

    // Se for professor, lista suas próprias atividades
    if (usuarioTipo === 'professor') {
      atividades = await this.atividadeRepository.listarPorProfessor(usuarioId, filtros);
    } 
    // Se for aluno, lista apenas atividades públicas
    else if (usuarioTipo === 'aluno') {
      atividades = await this.atividadeRepository.listarPublicas(filtros);
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
