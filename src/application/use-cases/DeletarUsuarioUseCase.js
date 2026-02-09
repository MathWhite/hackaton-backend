/**
 * Use Case: Deletar Usuário
 * Remove um aluno ou professor do sistema
 */
class DeletarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async executar(id, usuarioLogado) {
    // Busca o usuário a ser deletado
    const usuario = await this.usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }

    // Verifica permissões: usuário só pode deletar a si mesmo, exceto se for professor
    if (usuarioLogado.tipo === 'aluno' && usuarioLogado.id !== id) {
      throw new Error('Você não tem permissão para deletar este usuário.');
    }

    // Deleta do repositório
    const sucesso = await this.usuarioRepository.deletar(id);

    if (!sucesso) {
      throw new Error('Erro ao deletar usuário.');
    }

    return {
      mensagem: 'Usuário deletado com sucesso.'
    };
  }
}

module.exports = DeletarUsuarioUseCase;
