/**
 * Use Case: Deletar Resposta
 * Remove todas as respostas de um aluno de uma atividade
 * Apenas se finalizado = false
 * Regras de permissão:
 * - Alunos não podem deletar respostas
 * - Professores só podem deletar respostas de suas próprias atividades
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

    // Verifica permissões
    if (usuarioTipo === 'aluno') {
      throw new Error('Alunos não têm permissão para deletar respostas.');
    }

    if (usuarioTipo === 'professor') {
      // Professor só pode deletar respostas de suas próprias atividades
      if (!atividade.isPertenceAoProfessor(usuarioId)) {
        throw new Error('Você não tem permissão para deletar respostas desta atividade.');
      }
    }

    // Busca o documento de resposta do aluno
    const respostas = atividade.respostas || [];
    const respostaIndex = respostas.findIndex(r => r._id?.toString() === respostaId);

    if (respostaIndex === -1) {
      throw new Error('Resposta não encontrada.');
    }

    // Remove o documento de resposta do aluno
    respostas.splice(respostaIndex, 1);

    // Atualiza a atividade
    await this.atividadeRepository.atualizar(atividadeId, { respostas });

    return {
      mensagem: 'Resposta deletada com sucesso.'
    };
  }
}

module.exports = DeletarRespostaUseCase;
