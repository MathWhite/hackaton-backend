const express = require('express');
const authRoutes = require('./authRoutes');
const atividadeRoutes = require('./atividadeRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const respostaRoutes = require('./respostaRoutes');
const inscricaoRoutes = require('./inscricaoRoutes');

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verifica o status da API
 *     description: Endpoint público para verificar se a API está funcionando
 *     responses:
 *       200:
 *         description: API está funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 mensagem:
 *                   type: string
 *                   example: API AulaPronta está funcionando!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
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

// Rotas de usuários
router.use('/usuarios', usuarioRoutes);

// Rotas de respostas
router.use('/respostas', respostaRoutes);

// Rotas de inscrições
router.use('/inscricoes', inscricaoRoutes);

module.exports = router;
