/**
 * Use Case: Deletar Inscrição
 * Remove uma inscrição específica de uma atividade
 * Apenas o professor dono da atividade pode remover inscrições
 */
class DeletarInscricaoUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(atividadeId, inscricaoId, usuarioId, usuarioTipo) {
    // Apenas professores podem remover inscrições
    if (usuarioTipo !== 'professor') {
      throw new Error('Apenas professores podem remover inscrições.');
    }

    // Busca a atividade
    const atividade = await this.atividadeRepository.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // Verifica se o professor é dono da atividade
    if (!atividade.isPertenceAoProfessor(usuarioId)) {
      throw new Error('Você não tem permissão para remover inscrições desta atividade.');
    }

    // Busca a inscrição específica
    const inscricoes = atividade.inscricoes || [];
    const inscricaoIndex = inscricoes.findIndex(i => i._id?.toString() === inscricaoId);

    if (inscricaoIndex === -1) {
      throw new Error('Inscrição não encontrada.');
    }

    // Remove a inscrição
    inscricoes.splice(inscricaoIndex, 1);

    // Atualiza a atividade
    await this.atividadeRepository.atualizar(atividadeId, { inscricoes });

    return {
      mensagem: 'Inscrição removida com sucesso.'
    };
  }
}

module.exports = DeletarInscricaoUseCase;
