const mongoose = require('mongoose');

const MaterialApoioSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['texto', 'link', 'pdf']
  },
  conteudo: {
    type: String,
    required: true
  },
  titulo: {
    type: String
  }
}, { _id: true });

const AtividadeSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true
    },
    descricao: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true
    },
    disciplina: {
      type: String,
      required: [true, 'Disciplina é obrigatória'],
      trim: true
    },
    serie: {
      type: String,
      required: [true, 'Série/Ano é obrigatório'],
      trim: true
    },
    objetivo: {
      type: String,
      trim: true
    },
    materiaisApoio: [MaterialApoioSchema],
    status: {
      type: String,
      enum: {
        values: ['rascunho', 'publicada'],
        message: 'Status deve ser "rascunho" ou "publicada"'
      },
      default: 'rascunho'
    },
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Professor é obrigatório']
    },
    isPublica: {
      type: Boolean,
      default: false
    },
    dataEntrega: {
      type: Date
    }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices para otimizar queries
AtividadeSchema.index({ professorId: 1 });
AtividadeSchema.index({ disciplina: 1 });
AtividadeSchema.index({ serie: 1 });
AtividadeSchema.index({ status: 1 });
AtividadeSchema.index({ isPublica: 1 });

module.exports = mongoose.model('Atividade', AtividadeSchema);
