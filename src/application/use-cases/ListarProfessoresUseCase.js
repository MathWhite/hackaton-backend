/**
 * Use Case: Listar Professores
 * Lista todos os professores cadastrados no sistema
 */
class ListarProfessoresUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async executar() {
    const professores = await this.usuarioRepository.buscarPorTipo('professor');

    return {
      professores,
      total: professores.length,
      mensagem: 'Professores listados com sucesso.'
    };
  }
}

module.exports = ListarProfessoresUseCase;
