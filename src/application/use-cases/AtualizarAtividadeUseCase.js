class AtualizarAtividadeUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(atividadeId, dadosAtualizados, professorId) {
    // Busca a atividade
    const atividade = await this.atividadeRepository.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // Verifica se a atividade pertence ao professor
    if (!atividade.isPertenceAoProfessor(professorId)) {
      throw new Error('Você não tem permissão para editar esta atividade.');
    }

    // Atualiza a atividade
    const atividadeAtualizada = await this.atividadeRepository.atualizar(
      atividadeId,
      dadosAtualizados
    );

    return {
      atividade: atividadeAtualizada,
      mensagem: 'Atividade atualizada com sucesso.'
    };
  }
}

module.exports = AtualizarAtividadeUseCase;
