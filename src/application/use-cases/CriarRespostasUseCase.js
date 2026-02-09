/**
 * Use Case: Criar/Atualizar Respostas
 * Insere ou atualiza respostas de uma atividade
 * Sobrescreve respostas existentes se finalizado = false
 */
class CriarRespostasUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(atividadeId, payloadResposta, usuarioId, usuarioTipo) {
    // Busca a atividade
    const atividade = await this.atividadeRepository.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // Verifica se a atividade está finalizada
    if (atividade.finalizado) {
      throw new Error('Não é possível modificar respostas de uma atividade finalizada.');
    }

    // Extrai dados do payload
    const alunoId = payloadResposta.alunoId || usuarioId; // Se não enviado, usa o usuário logado
    const enviado = payloadResposta.enviado !== undefined ? payloadResposta.enviado : false;
    const respostas = payloadResposta.resposta || []; // Array de {perguntaId, resposta}

    // Verifica permissões: alunos só podem responder atividades publicadas e públicas
    if (usuarioTipo === 'aluno') {
      if (atividade.status !== 'publicada' || !atividade.isPublica) {
        throw new Error('Esta atividade não está disponível para respostas.');
      }
      // Alunos só podem criar respostas para si mesmos
      if (alunoId !== usuarioId) {
        throw new Error('Você não pode criar respostas para outro aluno.');
      }
    }

    // Professores só podem criar respostas em suas próprias atividades
    if (usuarioTipo === 'professor' && !atividade.isPertenceAoProfessor(usuarioId)) {
      throw new Error('Você não tem permissão para criar respostas nesta atividade.');
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

    // Busca se já existe um documento de resposta para este aluno
    const respostasExistentes = atividade.respostas || [];
    const respostaIndex = respostasExistentes.findIndex(
      r => r.alunoId?.toString() === alunoId
    );

    // Prepara as novas respostas no formato do array
    const itensResposta = respostas.map(r => ({
      perguntaId: r.perguntaId,
      resposta: r.resposta.toString()
    }));

    let respostasAtualizadas;
    
    if (respostaIndex !== -1) {
      // Atualiza o documento existente do aluno (sobrescreve completamente)
      respostasAtualizadas = respostasExistentes.map((r, index) => {
        if (index === respostaIndex) {
          return {
            alunoId: alunoId,
            enviado: enviado,
            resposta: itensResposta
          };
        }
        return r;
      });
    } else {
      // Cria novo documento de resposta para o aluno
      const novaRespostaAluno = {
        alunoId: alunoId,
        enviado: enviado,
        resposta: itensResposta
      };
      respostasAtualizadas = [...respostasExistentes, novaRespostaAluno];
    }

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
