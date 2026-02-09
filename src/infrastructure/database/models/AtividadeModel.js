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

const ConteudoSchema = new mongoose.Schema({
  pergunta: {
    type: String,
    required: [true, 'Pergunta é obrigatória'],
    trim: true
  },
  tipo: {
    type: String,
    required: [true, 'Tipo é obrigatório'],
    enum: {
      values: ['alternativa', 'dissertativa'],
      message: 'Tipo deve ser "alternativa" ou "dissertativa"'
    }
  },
  alternativas: {
    type: [String],
    default: []
  },
  resposta: {
    type: String,
    default: null
  }
}, { _id: true });

// Schema para cada resposta individual dentro do array
const ItemRespostaSchema = new mongoose.Schema({
  perguntaId: {
    type: String,
    required: [true, 'ID da pergunta é obrigatório']
  },
  resposta: {
    type: String,
    required: [true, 'Resposta é obrigatória']
  }
}, { _id: false });

// Schema para respostas agrupadas por aluno
const RespostaSchema = new mongoose.Schema({
  alunoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'Aluno/Professor é obrigatório']
  },
  enviado: {
    type: Boolean,
    default: false
  },
  resposta: {
    type: [ItemRespostaSchema],
    default: []
  }
}, { 
  _id: true,
  timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' }
});

const InscricaoSchema = new mongoose.Schema({
  alunoEmail: {
    type: String,
    required: [true, 'Email do aluno é obrigatório'],
    trim: true,
    lowercase: true
  },
  inscritoEm: {
    type: Date,
    default: Date.now
  }
}, { 
  _id: true
});

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
    conteudo: [ConteudoSchema],
    respostas: [RespostaSchema],
    inscricoes: [InscricaoSchema],
    finalizado: {
      type: Boolean,
      default: false
    },
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
