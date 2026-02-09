const AtividadeRepository = require('../../infrastructure/repositories/AtividadeRepository');
const CriarAtividadeUseCase = require('../../application/use-cases/CriarAtividadeUseCase');
const ListarAtividadesUseCase = require('../../application/use-cases/ListarAtividadesUseCase');
const AtualizarAtividadeUseCase = require('../../application/use-cases/AtualizarAtividadeUseCase');
const DeletarAtividadeUseCase = require('../../application/use-cases/DeletarAtividadeUseCase');
const DuplicarAtividadeUseCase = require('../../application/use-cases/DuplicarAtividadeUseCase');

class AtividadeController {
  constructor() {
    this.atividadeRepository = new AtividadeRepository();
    this.criarAtividadeUseCase = new CriarAtividadeUseCase(this.atividadeRepository);
    this.listarAtividadesUseCase = new ListarAtividadesUseCase(this.atividadeRepository);
    this.atualizarAtividadeUseCase = new AtualizarAtividadeUseCase(this.atividadeRepository);
    this.deletarAtividadeUseCase = new DeletarAtividadeUseCase(this.atividadeRepository);
    this.duplicarAtividadeUseCase = new DuplicarAtividadeUseCase(this.atividadeRepository);
  }

  /**
   * Cria uma nova atividade (somente professores)
   */
  async criar(req, res, next) {
    try {
      const dadosAtividade = req.body;
      const professorId = req.usuario.id;

      const resultado = await this.criarAtividadeUseCase.executar(dadosAtividade, professorId);

      return res.status(201).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Lista atividades
   * - Professores: suas próprias atividades
   * - Alunos: atividades públicas
   */
  async listar(req, res, next) {
    try {
      const { status, disciplina, serie, professorId } = req.query;
      const filtros = {};

      if (status) filtros.status = status;
      if (disciplina) filtros.disciplina = disciplina;
      if (serie) filtros.serie = serie;
      if (professorId) filtros.professorId = professorId;

      const resultado = await this.listarAtividadesUseCase.executar(
        req.usuario.id,
        req.usuario.tipo,
        filtros
      );

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Busca uma atividade por ID
   */
  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const atividade = await this.atividadeRepository.buscarPorId(id);

      if (!atividade) {
        return res.status(404).json({
          erro: 'Atividade não encontrada.'
        });
      }

      // Verifica permissões: professor deve ser o dono OU a atividade deve ser pública
      if (req.usuario.tipo === 'professor') {
        if (!atividade.isPertenceAoProfessor(req.usuario.id) && !atividade.isPublica) {
          return res.status(403).json({
            erro: 'Você não tem permissão para visualizar esta atividade.'
          });
        }
      } else if (req.usuario.tipo === 'aluno') {
        if (!atividade.isPublica || atividade.status !== 'publicada') {
          return res.status(403).json({
            erro: 'Você não tem permissão para visualizar esta atividade.'
          });
        }
      }

      return res.status(200).json({ atividade });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Atualiza uma atividade (somente o professor dono)
   */
  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const dadosAtualizados = req.body;
      const professorId = req.usuario.id;

      const resultado = await this.atualizarAtividadeUseCase.executar(
        id,
        dadosAtualizados,
        professorId
      );

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Deleta uma atividade (somente o professor dono)
   */
  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const professorId = req.usuario.id;

      const resultado = await this.deletarAtividadeUseCase.executar(id, professorId);

      return res.status(200).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Duplica uma atividade
   */
  async duplicar(req, res, next) {
    try {
      const { id } = req.params;
      const professorId = req.usuario.id;

      const resultado = await this.duplicarAtividadeUseCase.executar(id, professorId);

      return res.status(201).json(resultado);
    } catch (erro) {
      next(erro);
    }
  }
}

module.exports = AtividadeController;
