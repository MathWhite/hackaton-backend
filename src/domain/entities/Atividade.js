/**
 * Entidade Atividade (Domain)
 * Representa a lógica de negócio pura de uma atividade pedagógica
 */
class Atividade {
  constructor({
    id,
    titulo,
    descricao,
    disciplina,
    serie,
    objetivo,
    materiaisApoio,
    conteudo,
    respostas,
    finalizado,
    status,
    professorId,
    isPublica,
    dataEntrega,
    criadoEm,
    atualizadoEm
  }) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.disciplina = disciplina;
    this.serie = serie;
    this.objetivo = objetivo;
    this.materiaisApoio = materiaisApoio || [];
    this.conteudo = conteudo || [];
    this.respostas = respostas || [];
    this.finalizado = finalizado !== undefined ? finalizado : false;
    this.status = status || 'rascunho'; // 'rascunho' ou 'publicada'
    this.professorId = professorId;
    this.isPublica = isPublica || false;
    this.dataEntrega = dataEntrega;
    this.criadoEm = criadoEm || new Date();
    this.atualizadoEm = atualizadoEm || new Date();
  }

  // Regras de negócio
  publicar() {
    if (this.status === 'publicada') {
      throw new Error('Atividade já está publicada.');
    }
    this.status = 'publicada';
    this.atualizadoEm = new Date();
  }

  despublicar() {
    if (this.status === 'rascunho') {
      throw new Error('Atividade já está como rascunho.');
    }
    this.status = 'rascunho';
    this.atualizadoEm = new Date();
  }

  tornarPublica() {
    this.isPublica = true;
    this.atualizadoEm = new Date();
  }

  tornarPrivada() {
    this.isPublica = false;
    this.atualizadoEm = new Date();
  }

  isPertenceAoProfessor(professorId) {
    return this.professorId.toString() === professorId.toString();
  }

  adicionarMaterialApoio(material) {
    if (!material.tipo || !material.conteudo) {
      throw new Error('Material de apoio inválido. Deve conter tipo e conteúdo.');
    }
    this.materiaisApoio.push(material);
    this.atualizadoEm = new Date();
  }

  validar() {
    if (!this.titulo || this.titulo.trim().length === 0) {
      throw new Error('Título é obrigatório.');
    }

    if (!this.descricao || this.descricao.trim().length === 0) {
      throw new Error('Descrição é obrigatória.');
    }

    if (!this.disciplina || this.disciplina.trim().length === 0) {
      throw new Error('Disciplina é obrigatória.');
    }

    if (!this.serie || this.serie.trim().length === 0) {
      throw new Error('Série/Ano é obrigatório.');
    }

    if (!this.professorId) {
      throw new Error('Professor é obrigatório.');
    }

    const statusValidos = ['rascunho', 'publicada'];
    if (!statusValidos.includes(this.status)) {
      throw new Error('Status inválido.');
    }

    // Validar conteúdo
    if (this.conteudo && Array.isArray(this.conteudo)) {
      this.conteudo.forEach((item, index) => {
        if (!item.pergunta || item.pergunta.trim().length === 0) {
          throw new Error(`Conteúdo[${index}]: Pergunta é obrigatória.`);
        }
        
        const tiposValidos = ['alternativa', 'dissertativa'];
        if (!item.tipo || !tiposValidos.includes(item.tipo)) {
          throw new Error(`Conteúdo[${index}]: Tipo deve ser "alternativa" ou "dissertativa".`);
        }

        if (item.tipo === 'alternativa' && (!item.alternativas || item.alternativas.length === 0)) {
          throw new Error(`Conteúdo[${index}]: Questões de alternativa devem ter pelo menos uma alternativa.`);
        }
      });
    }
  }
}

module.exports = Atividade;
