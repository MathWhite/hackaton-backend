/**
 * Use Case: Listar Alunos
 * Lista todos os alunos cadastrados no sistema
 */
class ListarAlunosUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async executar() {
    const alunos = await this.usuarioRepository.buscarPorTipo('aluno');

    return {
      alunos,
      total: alunos.length,
      mensagem: 'Alunos listados com sucesso.'
    };
  }
}

module.exports = ListarAlunosUseCase;
