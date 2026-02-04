/**
 * Middleware global de tratamento de erros
 */
const tratarErros = (err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const erros = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      erro: 'Erro de validação',
      detalhes: erros
    });
  }

  // Erro de cast do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      erro: 'ID inválido'
    });
  }

  // Erro de chave duplicada do MongoDB
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      erro: `${campo} já está em uso.`
    });
  }

  // Erro customizado com status
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      erro: err.message
    });
  }

  // Erro genérico
  return res.status(500).json({
    erro: err.message || 'Erro interno do servidor'
  });
};

module.exports = tratarErros;
