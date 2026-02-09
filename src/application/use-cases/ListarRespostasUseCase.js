/**
 * Use Case: Listar Respostas
 * Lista respostas de uma atividade
 * - Professor vê todas as respostas da sua atividade
 * - Aluno vê apenas suas próprias respostas
 */
class ListarRespostasUseCase {
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
      // Professor só pode ver respostas das suas atividades
      if (!atividade.isPertenceAoProfessor(usuarioId)) {
        throw new Error('Você não tem permissão para visualizar respostas desta atividade.');
      }
      
      // Retorna todas as respostas
      return {
        atividadeId: atividade.id,
        titulo: atividade.titulo,
        finalizado: atividade.finalizado,
        respostas: atividade.respostas || [],
        total: (atividade.respostas || []).length
      };
    } else if (usuarioTipo === 'aluno') {
      // Aluno só pode ver suas próprias respostas de atividades públicas
      if (!atividade.isPublica || atividade.status !== 'publicada') {
        throw new Error('Esta atividade não está disponível para visualização.');
      }
      
      // Filtra apenas as respostas do aluno
      const respostasDoAluno = (atividade.respostas || []).filter(
        r => r.alunoId?.toString() === usuarioId
      );
      
      return {
        atividadeId: atividade.id,
        titulo: atividade.titulo,
        finalizado: atividade.finalizado,
        respostas: respostasDoAluno,
        total: respostasDoAluno.length
      };
    } else {
      throw new Error('Tipo de usuário inválido.');
    }
  }
}

module.exports = ListarRespostasUseCase;
