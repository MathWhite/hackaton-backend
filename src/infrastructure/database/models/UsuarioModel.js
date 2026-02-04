const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
      select: false // Não retorna a senha por padrão nas queries
    },
    tipo: {
      type: String,
      required: [true, 'Tipo é obrigatório'],
      enum: {
        values: ['professor', 'aluno'],
        message: 'Tipo deve ser "professor" ou "aluno"'
      }
    }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices para otimizar queries
UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ tipo: 1 });

module.exports = mongoose.model('Usuario', UsuarioSchema);
