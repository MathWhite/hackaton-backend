const express = require('express');
const authRoutes = require('./authRoutes');
const atividadeRoutes = require('./atividadeRoutes');

const router = express.Router();

// Rota de healthcheck
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    mensagem: 'API AulaPronta está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de atividades
router.use('/atividades', atividadeRoutes);

module.exports = router;
