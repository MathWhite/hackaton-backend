const express = require('express');
const InscricaoController = require('../controllers/InscricaoController');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();
const inscricaoController = new InscricaoController();

/**
 * @swagger
 * /api/inscricoes:
 *   post:
 *     tags:
 *       - Inscrições
 *     summary: Inscreve alunos em uma atividade
 *     description: Adiciona emails de alunos à lista de inscritos de uma atividade. Apenas o professor dono pode inscrever alunos.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - atividadeId
 *               - emails
 *             properties:
 *               atividadeId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 example: ["aluno1@email.com", "aluno2@email.com"]
 *     responses:
 *       200:
 *         description: Alunos inscritos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 atividade:
 *                   type: object
 *                 mensagem:
 *                   type: string
 *                   example: 2 aluno(s) inscrito(s) com sucesso.
 *                 novosInscritos:
 *                   type: number
 *                   example: 2
 *       400:
 *         description: Dados inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Atividade não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/',
  autenticar,
  (req, res, next) => inscricaoController.criar(req, res, next)
);

/**
 * @swagger
 * /api/inscricoes:
 *   get:
 *     tags:
 *       - Inscrições
 *     summary: Lista inscrições de uma atividade
 *     description: Apenas o professor dono da atividade pode listar as inscrições
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da atividade
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Lista de inscrições retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 atividadeId:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439011
 *                 titulo:
 *                   type: string
 *                   example: Equações de Segundo Grau
 *                 inscricoes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       alunoEmail:
 *                         type: string
 *                         format: email
 *                         example: aluno@email.com
 *                       inscritoEm:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: number
 *                   example: 5
 *       400:
 *         description: atividadeId não fornecido
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Sem permissão para visualizar inscrições
 *       404:
 *         description: Atividade não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/',
  autenticar,
  (req, res, next) => inscricaoController.listar(req, res, next)
);

/**
 * @swagger
 * /api/inscricoes/{id}:
 *   delete:
 *     tags:
 *       - Inscrições
 *     summary: Remove uma inscrição específica
 *     description: Remove um aluno da lista de inscritos de uma atividade. Apenas o professor dono pode remover.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da inscrição
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da atividade
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Inscrição removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Inscrição removida com sucesso.
 *       400:
 *         description: atividadeId não fornecido
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Atividade ou inscrição não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete(
  '/:id',
  autenticar,
  (req, res, next) => inscricaoController.deletar(req, res, next)
);

module.exports = router;
