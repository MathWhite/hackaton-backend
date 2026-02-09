const Usuario = require('../../domain/entities/Usuario');

/**
 * Use Case: Atualizar Usuário
 * Atualiza os dados de um aluno ou professor
 */
class AtualizarUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async executar(id, dadosAtualizados, usuarioLogado) {
    // Busca o usuário a ser atualizado
    const usuarioExistente = await this.usuarioRepository.buscarPorId(id);

    if (!usuarioExistente) {
      throw new Error('Usuário não encontrado.');
    }

    // Verifica permissões: usuário só pode atualizar a si mesmo, exceto se for professor
    if (usuarioLogado.tipo === 'aluno' && usuarioLogado.id !== id) {
      throw new Error('Você não tem permissão para atualizar este usuário.');
    }

    // Remove campos que não podem ser atualizados diretamente
    const { senha, tipo, id: _, email, ...dadosPermitidos } = dadosAtualizados;

    // Se estiver tentando mudar o email, verifica se já existe
    if (dadosAtualizados.email && dadosAtualizados.email !== usuarioExistente.email) {
      const emailExiste = await this.usuarioRepository.emailJaExiste(dadosAtualizados.email);
      if (emailExiste) {
        throw new Error('Email já está em uso.');
      }
      dadosPermitidos.email = dadosAtualizados.email;
    }

    // Validar dados (sem validar senha hash)
    if (dadosPermitidos.nome && dadosPermitidos.nome.trim().length === 0) {
      throw new Error('Nome não pode ser vazio.');
    }

    // Validar email se foi alterado
    if (dadosPermitidos.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dadosPermitidos.email)) {
        throw new Error('Email inválido.');
      }
    }

    // Atualiza no repositório
    const resultado = await this.usuarioRepository.atualizar(id, {
      ...dadosPermitidos,
      atualizadoEm: new Date()
    });

    return {
      usuario: resultado,
      mensagem: 'Usuário atualizado com sucesso.'
    };
  }
}

module.exports = AtualizarUsuarioUseCase;
