/**
 * Use Case: Listar Inscrições
 * Lista inscrições de uma atividade
 * Apenas o professor dono da atividade pode listar as inscrições
 */
class ListarInscricoesUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(atividadeId, usuarioId, usuarioTipo) {
    // Busca a atividade
    const atividade = await this.atividadeRepository.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // Verifica permissões
    if (usuarioTipo === 'professor') {
      // Professor só pode ver inscrições das suas atividades
      if (!atividade.isPertenceAoProfessor(usuarioId)) {
        throw new Error('Você não tem permissão para visualizar inscrições desta atividade.');
      }
      
      // Retorna todas as inscrições
      return {
        atividadeId: atividade.id,
        titulo: atividade.titulo,
        inscricoes: atividade.inscricoes || [],
        total: (atividade.inscricoes || []).length
      };
    } else if (usuarioTipo === 'aluno') {
      // Alunos não podem listar inscrições
      throw new Error('Alunos não têm permissão para visualizar a lista de inscrições.');
    } else {
      throw new Error('Tipo de usuário inválido.');
    }
  }
}

module.exports = ListarInscricoesUseCase;
