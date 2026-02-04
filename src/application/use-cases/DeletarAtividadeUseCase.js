class DeletarAtividadeUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(atividadeId, professorId) {
    // Busca a atividade
    const atividade = await this.atividadeRepository.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // Verifica se a atividade pertence ao professor
    if (!atividade.isPertenceAoProfessor(professorId)) {
      throw new Error('Você não tem permissão para deletar esta atividade.');
    }

    // Deleta a atividade
    await this.atividadeRepository.deletar(atividadeId);

    return {
      mensagem: 'Atividade deletada com sucesso.'
    };
  }
}

module.exports = DeletarAtividadeUseCase;
