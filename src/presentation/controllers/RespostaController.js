const AtividadeRepository = require('../../infrastructure/repositories/AtividadeRepository');
const CriarRespostasUseCase = require('../../application/use-cases/CriarRespostasUseCase');
const DeletarRespostaUseCase = require('../../application/use-cases/DeletarRespostaUseCase');
const ListarRespostasUseCase = require('../../application/use-cases/ListarRespostasUseCase');

class RespostaController {
  constructor() {
    this.atividadeRepository = new AtividadeRepository();
    this.criarRespostasUseCase = new CriarRespostasUseCase(this.atividadeRepository);
    this.deletarRespostaUseCase = new DeletarRespostaUseCase(this.atividadeRepository);
    this.listarRespostasUseCase = new ListarRespostasUseCase(this.atividadeRepository);
  }

  /**
   * Cria/atualiza respostas de uma atividade
   * Sobrescreve respostas existentes do usuário
   */
  async criar(req, res, next) {
    try {
      const { atividadeId, respostas } = req.body;
      const usuarioId = req.usuario.id;
      const usuarioTipo = req.usuario.tipo;

      if (!atividadeId) {
        return res.status(400).json({ erro: 'atividadeId é obrigatório.' });
      }

      const resultado = await this.criarRespostasUseCase.executar(
        atividadeId,
        respostas,
        usuarioId,
        usuarioTipo
      );

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Lista respostas de uma atividade
   * Professor vê todas, aluno vê apenas as suas
   */
  async listar(req, res, next) {
    try {
      const { atividadeId } = req.query;
      const usuarioId = req.usuario.id;
      const usuarioTipo = req.usuario.tipo;

      if (!atividadeId) {
        return res.status(400).json({ erro: 'atividadeId é obrigatório.' });
      }

      const resultado = await this.listarRespostasUseCase.executar(
        atividadeId,
        usuarioId,
        usuarioTipo
      );

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Deleta uma resposta específica
   */
  async deletar(req, res, next) {
    try {
      const { id: respostaId } = req.params;
      const { atividadeId } = req.query;
      const usuarioId = req.usuario.id;
      const usuarioTipo = req.usuario.tipo;

      if (!atividadeId) {
        return res.status(400).json({ erro: 'atividadeId é obrigatório.' });
      }

      const resultado = await this.deletarRespostaUseCase.executar(
        atividadeId,
        respostaId,
        usuarioId,
        usuarioTipo
      );

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = RespostaController;
