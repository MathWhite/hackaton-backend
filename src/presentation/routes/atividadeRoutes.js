const express = require('express');
const AtividadeController = require('../controllers/AtividadeController');
const autenticar = require('../middlewares/autenticar');
const { verificarProfessor } = require('../middlewares/autorizacao');

const router = express.Router();
const atividadeController = new AtividadeController();

/**
 * @swagger
 * /api/atividades:
 *   post:
 *     tags:
 *       - Atividades
 *     summary: Cria uma nova atividade
 *     description: Endpoint para professores criarem atividades pedagógicas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descricao
 *               - disciplina
 *               - serie
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Equações de Segundo Grau
 *               descricao:
 *                 type: string
 *                 example: Exercícios práticos sobre equações quadráticas
 *               disciplina:
 *                 type: string
 *                 example: Matemática
 *               serie:
 *                 type: string
 *                 example: 9º ano
 *               objetivo:
 *                 type: string
 *                 example: Desenvolver habilidades de resolução de equações
 *               materiaisApoio:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tipo:
 *                       type: string
 *                       example: pdf
 *                     conteudo:
 *                       type: string
 *                       example: https://exemplo.com/material.pdf
 *               conteudo:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: xxx
 *                     pergunta:
 *                       type: string
 *                       example: Qual é a capital do Brasil?
 *                     tipo:
 *                       type: string
 *                       enum: [alternativa, dissertativa]
 *                       example: alternativa
 *                     alternativas:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"]
 *                     resposta:
 *                       type: string
 *                       nullable: true
 *                       example: Brasília
 *               status:
 *                 type: string
 *                 enum: [rascunho, publicada]
 *                 example: rascunho
 *               isPublica:
 *                 type: boolean
 *                 example: false
 *               dataEntrega:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Atividade criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 atividade:
 *                   $ref: '#/components/schemas/Atividade'
 *                 mensagem:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/',
  autenticar,
  verificarProfessor,
  (req, res, next) => atividadeController.criar(req, res, next)
);

/**
 * @swagger
 * /api/atividades:
 *   get:
 *     tags:
 *       - Atividades
 *     summary: Lista atividades
 *     description: Para professores retorna suas atividades, para alunos retorna apenas atividades públicas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: disciplina
 *         schema:
 *           type: string
 *         description: Filtrar por disciplina
 *       - in: query
 *         name: serie
 *         schema:
 *           type: string
 *         description: Filtrar por série/ano
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, publicada]
 *         description: Filtrar por status
 *       - in: query
 *         name: professorId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do professor
 *     responses:
 *       200:
 *         description: Lista de atividades retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 atividades:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Atividade'
 *                 total:
 *                   type: number
 *                   example: 10
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/',
  autenticar,
  (req, res, next) => atividadeController.listar(req, res, next)
);

/**
 * @swagger
 * /api/atividades/{id}:
 *   get:
 *     tags:
 *       - Atividades
 *     summary: Busca uma atividade por ID
 *     description: Retorna detalhes de uma atividade específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da atividade
 *     responses:
 *       200:
 *         description: Atividade encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 atividade:
 *                   $ref: '#/components/schemas/Atividade'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/:id',
  autenticar,
  (req, res, next) => atividadeController.buscarPorId(req, res, next)
);

/**
 * @swagger
 * /api/atividades/{id}:
 *   put:
 *     tags:
 *       - Atividades
 *     summary: Atualiza uma atividade
 *     description: Apenas o professor dono pode atualizar a atividade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da atividade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               disciplina:
 *                 type: string
 *               serie:
 *                 type: string
 *               objetivo:
 *                 type: string
 *               conteudo:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: xxx
 *                     pergunta:
 *                       type: string
 *                       example: Qual é a capital do Brasil?
 *                     tipo:
 *                       type: string
 *                       enum: [alternativa, dissertativa]
 *                       example: alternativa
 *                     alternativas:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"]
 *                     resposta:
 *                       type: string
 *                       nullable: true
 *                       example: Brasília
 *               status:
 *                 type: string
 *                 enum: [rascunho, publicada]
 *               isPublica:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Atividade atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 atividade:
 *                   $ref: '#/components/schemas/Atividade'
 *                 mensagem:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put(
  '/:id',
  autenticar,
  verificarProfessor,
  (req, res, next) => atividadeController.atualizar(req, res, next)
);

/**
 * @swagger
 * /api/atividades/{id}:
 *   delete:
 *     tags:
 *       - Atividades
 *     summary: Deleta uma atividade
 *     description: Apenas o professor dono pode deletar a atividade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da atividade
 *     responses:
 *       200:
 *         description: Atividade deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Atividade deletada com sucesso.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete(
  '/:id',
  autenticar,
  verificarProfessor,
  (req, res, next) => atividadeController.deletar(req, res, next)
);

/**
 * @swagger
 * /api/atividades/{id}/duplicar:
 *   post:
 *     tags:
 *       - Atividades
 *     summary: Duplica uma atividade
 *     description: Professores podem duplicar suas próprias atividades ou atividades públicas de outros professores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da atividade a ser duplicada
 *     responses:
 *       201:
 *         description: Atividade duplicada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 atividade:
 *                   $ref: '#/components/schemas/Atividade'
 *                 mensagem:
 *                   type: string
 *                   example: Atividade duplicada com sucesso.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/:id/duplicar',
  autenticar,
  verificarProfessor,
  (req, res, next) => atividadeController.duplicar(req, res, next)
);

module.exports = router;
