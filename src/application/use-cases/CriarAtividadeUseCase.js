const Atividade = require('../../domain/entities/Atividade');

class CriarAtividadeUseCase {
  constructor(atividadeRepository) {
    this.atividadeRepository = atividadeRepository;
  }

  async executar(dadosAtividade, professorId) {
    // Valida que professorId está presente
    if (!professorId) {
      throw new Error('Professor não identificado.');
    }

    // Cria a entidade com professorId
    const atividade = new Atividade({
      ...dadosAtividade,
      professorId
    });

    // Valida a entidade
    atividade.validar();

    // Salva no repositório
    const atividadeCriada = await this.atividadeRepository.criar(atividade);

    return {
      atividade: atividadeCriada,
      mensagem: 'Atividade criada com sucesso.'
    };
  }
}

module.exports = CriarAtividadeUseCase;
