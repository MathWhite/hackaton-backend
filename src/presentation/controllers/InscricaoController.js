const AtividadeRepository = require('../../infrastructure/repositories/AtividadeRepository');
const CriarInscricaoUseCase = require('../../application/use-cases/CriarInscricaoUseCase');
const DeletarInscricaoUseCase = require('../../application/use-cases/DeletarInscricaoUseCase');
const ListarInscricoesUseCase = require('../../application/use-cases/ListarInscricoesUseCase');

class InscricaoController {
  constructor() {
    this.atividadeRepository = new AtividadeRepository();
    this.criarInscricaoUseCase = new CriarInscricaoUseCase(this.atividadeRepository);
    this.deletarInscricaoUseCase = new DeletarInscricaoUseCase(this.atividadeRepository);
    this.listarInscricoesUseCase = new ListarInscricoesUseCase(this.atividadeRepository);
  }

  /**
   * Cria/adiciona inscrições em uma atividade
   * Apenas o professor dono da atividade pode inscrever alunos
   */
  async criar(req, res, next) {
    try {
      const { atividadeId, emails } = req.body;
      const usuarioId = req.usuario.id;
      const usuarioTipo = req.usuario.tipo;

      if (!atividadeId) {
        return res.status(400).json({ erro: 'atividadeId é obrigatório.' });
      }

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ erro: 'É necessário fornecer pelo menos um email.' });
      }

      const resultado = await this.criarInscricaoUseCase.executar(
        atividadeId,
        emails,
        usuarioId,
        usuarioTipo
      );

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Lista inscrições de uma atividade
   * Apenas o professor dono da atividade pode listar
   */
  async listar(req, res, next) {
    try {
      const { atividadeId } = req.query;
      const usuarioId = req.usuario.id;
      const usuarioTipo = req.usuario.tipo;

      if (!atividadeId) {
        return res.status(400).json({ erro: 'atividadeId é obrigatório.' });
      }

      const resultado = await this.listarInscricoesUseCase.executar(
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
   * Deleta uma inscrição específica
   */
  async deletar(req, res, next) {
    try {
      const { id: inscricaoId } = req.params;
      const { atividadeId } = req.query;
      const usuarioId = req.usuario.id;
      const usuarioTipo = req.usuario.tipo;

      if (!atividadeId) {
        return res.status(400).json({ erro: 'atividadeId é obrigatório.' });
      }

      const resultado = await this.deletarInscricaoUseCase.executar(
        atividadeId,
        inscricaoId,
        usuarioId,
        usuarioTipo
      );

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = InscricaoController;
