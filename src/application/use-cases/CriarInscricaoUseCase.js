/**
 * Use Case: Criar/Adicionar Inscrições
 * Insere emails de alunos na lista de inscritos de uma atividade
 * Apenas professores donos da atividade podem fazer inscrições
 */
class CriarInscricaoUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(atividadeId, emails, usuarioId, usuarioTipo) {
    // Apenas professores podem inscrever alunos
    if (usuarioTipo !== 'professor') {
      throw new Error('Apenas professores podem inscrever alunos em atividades.');
    }

    // Busca a atividade
    const atividade = await this.atividadeRepository.buscarPorId(atividadeId);

    if (!atividade) {
      throw new Error('Atividade não encontrada.');
    }

    // Verifica se o professor é dono da atividade
    if (!atividade.isPertenceAoProfessor(usuarioId)) {
      throw new Error('Você não tem permissão para inscrever alunos nesta atividade.');
    }

    // Valida os emails
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new Error('É necessário fornecer pelo menos um email de aluno.');
    }

    // Valida formato dos emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        throw new Error(`Email inválido: ${email}`);
      }
    }

    // Obtém inscrições existentes
    const inscricoesExistentes = atividade.inscricoes || [];
    const emailsExistentes = inscricoesExistentes.map(i => i.alunoEmail);

    // Adiciona apenas emails que ainda não estão inscritos
    const novasInscricoes = [];
    for (const email of emails) {
      const emailNormalizado = email.toLowerCase().trim();
      if (!emailsExistentes.includes(emailNormalizado)) {
        novasInscricoes.push({
          alunoEmail: emailNormalizado,
          inscritoEm: new Date()
        });
      }
    }

    if (novasInscricoes.length === 0) {
      return {
        atividade,
        mensagem: 'Todos os emails já estão inscritos nesta atividade.'
      };
    }

    // Adiciona as novas inscrições
    const inscricoesAtualizadas = [...inscricoesExistentes, ...novasInscricoes];

    // Atualiza a atividade
    const atividadeAtualizada = await this.atividadeRepository.atualizar(
      atividadeId,
      { inscricoes: inscricoesAtualizadas }
    );

    return {
      atividade: atividadeAtualizada,
      mensagem: `${novasInscricoes.length} aluno(s) inscrito(s) com sucesso.`,
      novosInscritos: novasInscricoes.length
    };
  }
}

module.exports = CriarInscricaoUseCase;
