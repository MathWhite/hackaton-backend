/**
 * Use Case: Deletar Resposta
 * Remove uma resposta específica de uma atividade
 * Apenas se finalizado = false
 */
class DeletarRespostaUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(atividadeId, respostaId, usuarioId, usuarioTipo) {
    // Busca a atividade
    const atividade = await this.atividadeRepository.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // Verifica se a atividade está finalizada
    if (atividade.finalizado) {
      throw new Error('Não é possível deletar respostas de uma atividade finalizada.');
    }

    // Busca a resposta específica
    const respostas = atividade.respostas || [];
    const respostaIndex = respostas.findIndex(r => r._id?.toString() === respostaId);

    if (respostaIndex === -1) {
      throw new Error('Resposta não encontrada.');
    }

    const resposta = respostas[respostaIndex];

    // Verifica permissões: usuário só pode deletar suas próprias respostas
    if (resposta.alunoId?.toString() !== usuarioId) {
      throw new Error('Você não tem permissão para deletar esta resposta.');
    }

    // Remove a resposta
    respostas.splice(respostaIndex, 1);

    // Atualiza a atividade
    await this.atividadeRepository.atualizar(atividadeId, { respostas });

    return {
      mensagem: 'Resposta deletada com sucesso.'
    };
  }
}

module.exports = DeletarRespostaUseCase;
