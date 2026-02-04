class DuplicarAtividadeUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(atividadeId, professorId) {
    // Busca a atividade original
    const atividadeOriginal = await this.atividadeRepository.buscarPorId(atividadeId);

    if (!atividadeOriginal) {
      throw new Error('Atividade não encontrada.');
    }

    // Se a atividade não é pública, verifica se pertence ao professor
    if (!atividadeOriginal.isPublica && !atividadeOriginal.isPertenceAoProfessor(professorId)) {
      throw new Error('Você não tem permissão para duplicar esta atividade.');
    }

    // Duplica a atividade
    const atividadeDuplicada = await this.atividadeRepository.duplicar(atividadeId, professorId);

    return {
      atividade: atividadeDuplicada,
      mensagem: 'Atividade duplicada com sucesso.'
    };
  }
}

module.exports = DuplicarAtividadeUseCase;
