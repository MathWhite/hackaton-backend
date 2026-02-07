const AtividadeModel = require('../database/models/AtividadeModel');
const Atividade = require('../../domain/entities/Atividade');

class AtividadeRepository {
  /**
   * Converte um documento MongoDB para a entidade de domínio
   */
  _toEntity(doc) {
    if (!doc) return null;
    
    // Lida com professorId populado ou não
    const professorId = doc.professorId._id 
      ? doc.professorId._id.toString() 
      : doc.professorId.toString();
    
    return new Atividade({
      id: doc._id.toString(),
      titulo: doc.titulo,
      descricao: doc.descricao,
      disciplina: doc.disciplina,
      serie: doc.serie,
      objetivo: doc.objetivo,
      materiaisApoio: doc.materiaisApoio,
      status: doc.status,
      professorId: professorId,
      isPublica: doc.isPublica,
      dataEntrega: doc.dataEntrega,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm
    });
  }

  /**
   * Cria uma nova atividade
   */
  async criar(atividade) {
    const novaAtividade = await AtividadeModel.create({
      titulo: atividade.titulo,
      descricao: atividade.descricao,
      disciplina: atividade.disciplina,
      serie: atividade.serie,
      objetivo: atividade.objetivo,
      materiaisApoio: atividade.materiaisApoio,
      status: atividade.status,
      professorId: atividade.professorId,
      isPublica: atividade.isPublica,
      dataEntrega: atividade.dataEntrega
    });

    return this._toEntity(novaAtividade);
  }

  /**
   * Busca atividade por ID
   */
  async buscarPorId(id) {
    const atividade = await AtividadeModel.findById(id).populate('professorId', 'nome email');
    return this._toEntity(atividade);
  }

  /**
   * Lista atividades de um professor
   */
  async listarPorProfessor(professorId, filtros = {}) {
    const query = { professorId };
    
    if (filtros.status) {
      query.status = filtros.status;
    }
    
    if (filtros.disciplina) {
      query.disciplina = filtros.disciplina;
    }
    
    if (filtros.serie) {
      query.serie = filtros.serie;
    }

    const atividades = await AtividadeModel.find(query).sort({ criadoEm: -1 });
    return atividades.map(a => this._toEntity(a));
  }

  /**
   * Lista atividades públicas
   */
  async listarPublicas(filtros = {}) {
    const query = { isPublica: true, status: 'publicada' };
    
    if (filtros.disciplina) {
      query.disciplina = filtros.disciplina;
    }
    
    if (filtros.serie) {
      query.serie = filtros.serie;
    }

    const atividades = await AtividadeModel.find(query)
      .populate('professorId', 'nome')
      .sort({ criadoEm: -1 });
    return atividades.map(a => this._toEntity(a));
  }

  /**
   * Atualiza uma atividade
   */
  async atualizar(id, dadosAtualizados) {
    const atividade = await AtividadeModel.findByIdAndUpdate(
      id,
      { ...dadosAtualizados, atualizadoEm: new Date() },
      { new: true, runValidators: true }
    );
    return this._toEntity(atividade);
  }

  /**
   * Deleta uma atividade
   */
  async deletar(id) {
    const resultado = await AtividadeModel.findByIdAndDelete(id);
    return resultado !== null;
  }

  /**
   * Duplica uma atividade
   */
  async duplicar(id, novoProfessorId) {
    const atividadeOriginal = await AtividadeModel.findById(id);
    
    if (!atividadeOriginal) {
      return null;
    }

    const novaAtividade = await AtividadeModel.create({
      titulo: `${atividadeOriginal.titulo} (cópia)`,
      descricao: atividadeOriginal.descricao,
      disciplina: atividadeOriginal.disciplina,
      serie: atividadeOriginal.serie,
      objetivo: atividadeOriginal.objetivo,
      materiaisApoio: atividadeOriginal.materiaisApoio,
      status: 'rascunho',
      professorId: novoProfessorId,
      isPublica: false
    });

    return this._toEntity(novaAtividade);
  }
}

module.exports = AtividadeRepository;
