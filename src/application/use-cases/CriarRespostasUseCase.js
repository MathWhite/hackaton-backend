/**
 * Use Case: Criar/Atualizar Respostas
 * Insere ou atualiza respostas de uma atividade
 * Sobrescreve respostas existentes se finalizado = false
 */
class CriarRespostasUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(atividadeId, respostas, usuarioId, usuarioTipo) {
    // Busca a atividade
    const atividade = await this.atividadeRepository.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // Verifica se a atividade está finalizada
    if (atividade.finalizado) {
      throw new Error('Não é possível modificar respostas de uma atividade finalizada.');
    }

    // Verifica permissões: alunos só podem responder atividades publicadas e públicas
    if (usuarioTipo === 'aluno') {
      if (atividade.status !== 'publicada' || !atividade.isPublica) {
        throw new Error('Esta atividade não está disponível para respostas.');
      }
    }

    // Professores só podem responder suas próprias atividades
    if (usuarioTipo === 'professor' && !atividade.isPertenceAoProfessor(usuarioId)) {
      throw new Error('Você não tem permissão para responder esta atividade.');
    }

    // Valida as respostas
    if (!Array.isArray(respostas) || respostas.length === 0) {
      throw new Error('É necessário fornecer pelo menos uma resposta.');
    }

    // Valida cada resposta
    const perguntasIds = atividade.conteudo.map(c => c._id?.toString());
    
    for (const resposta of respostas) {
      if (!resposta.perguntaId) {
        throw new Error('Todas as respostas devem ter um perguntaId.');
      }
      if (resposta.resposta === undefined || resposta.resposta === null) {
        throw new Error('Todas as respostas devem ter um valor.');
      }
      
      // Verifica se a pergunta existe no conteúdo da atividade
      if (!perguntasIds.includes(resposta.perguntaId)) {
        throw new Error(`Pergunta com ID ${resposta.perguntaId} não encontrada nesta atividade.`);
      }
    }

    // Remove respostas existentes do usuário para essa atividade e adiciona as novas
    const respostasExistentes = atividade.respostas || [];
    const respostasFiltradas = respostasExistentes.filter(
      r => r.alunoId?.toString() !== usuarioId
    );

    // Adiciona as novas respostas
    const novasRespostas = respostas.map(r => ({
      alunoId: usuarioId,
      perguntaId: r.perguntaId,
      resposta: r.resposta.toString()
    }));

    const respostasAtualizadas = [...respostasFiltradas, ...novasRespostas];

    // Atualiza a atividade
    const atividadeAtualizada = await this.atividadeRepository.atualizar(
      atividadeId,
      { respostas: respostasAtualizadas }
    );

    return {
      atividade: atividadeAtualizada,
      mensagem: 'Respostas salvas com sucesso.'
    };
  }
}

module.exports = CriarRespostasUseCase;
