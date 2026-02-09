const express = require('express');
const RespostaController = require('../controllers/RespostaController');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();
const respostaController = new RespostaController();

/**
 * @swagger
 * /api/respostas:
 *   post:
 *     tags:
 *       - Respostas
 *     summary: Cria/atualiza respostas de uma atividade
 *     description: Insere ou atualiza respostas de uma atividade. Sobrescreve respostas existentes do usuário se finalizado=false
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
 *               - respostas
 *             properties:
 *               atividadeId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               respostas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - perguntaId
 *                     - resposta
 *                   properties:
 *                     perguntaId:
 *                       type: string
 *                       example: 69893e2c53a6ef5bfb1ed198
 *                     resposta:
 *                       type: string
 *                       example: 12
 *     responses:
 *       200:
 *         description: Respostas salvas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 atividade:
 *                   type: object
 *                 mensagem:
 *                   type: string
 *                   example: Respostas salvas com sucesso.
 *       400:
 *         description: Dados inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Atividade finalizada ou sem permissão
 *       404:
 *         description: Atividade não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/',
  autenticar,
  (req, res, next) => respostaController.criar(req, res, next)
);

/**
 * @swagger
 * /api/respostas:
 *   get:
 *     tags:
 *       - Respostas
 *     summary: Lista respostas de uma atividade
 *     description: Professor vê todas as respostas da sua atividade, aluno vê apenas as suas
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
 *         description: Lista de respostas retornada com sucesso
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
 *                 finalizado:
 *                   type: boolean
 *                   example: false
 *                 respostas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       alunoId:
 *                         type: string
 *                       perguntaId:
 *                         type: string
 *                       resposta:
 *                         type: string
 *                       criadoEm:
 *                         type: string
 *                         format: date-time
 *                       atualizadoEm:
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
 *         description: Sem permissão para visualizar respostas
 *       404:
 *         description: Atividade não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/',
  autenticar,
  (req, res, next) => respostaController.listar(req, res, next)
);

/**
 * @swagger
 * /api/respostas/{id}:
 *   delete:
 *     tags:
 *       - Respostas
 *     summary: Deleta uma resposta específica
 *     description: Remove uma resposta específica da atividade se finalizado=false
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da resposta
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
 *         description: Resposta deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Resposta deletada com sucesso.
 *       400:
 *         description: atividadeId não fornecido
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Atividade finalizada ou sem permissão
 *       404:
 *         description: Atividade ou resposta não encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete(
  '/:id',
  autenticar,
  (req, res, next) => respostaController.deletar(req, res, next)
);

module.exports = router;
