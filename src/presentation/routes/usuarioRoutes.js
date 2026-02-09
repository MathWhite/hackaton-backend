const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();
const usuarioController = new UsuarioController();

/**
 * @swagger
 * /api/usuarios/alunos:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Lista todos os alunos
 *     description: Retorna a lista de todos os alunos cadastrados no sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alunos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alunos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *                 total:
 *                   type: number
 *                   example: 10
 *                 mensagem:
 *                   type: string
 *                   example: Alunos listados com sucesso.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/alunos',
  autenticar,
  (req, res, next) => usuarioController.listarAlunos(req, res, next)
);

/**
 * @swagger
 * /api/usuarios/professores:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Lista todos os professores
 *     description: Retorna a lista de todos os professores cadastrados no sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de professores retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 professores:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *                 total:
 *                   type: number
 *                   example: 5
 *                 mensagem:
 *                   type: string
 *                   example: Professores listados com sucesso.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/professores',
  autenticar,
  (req, res, next) => usuarioController.listarProfessores(req, res, next)
);

/**
 * @swagger
 * /api/usuarios/alunos/{id}:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Atualiza um aluno
 *     description: Atualiza os dados de um aluno específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do aluno
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva Atualizado
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao.novo@escola.com
 *     responses:
 *       200:
 *         description: Aluno atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 mensagem:
 *                   type: string
 *                   example: Usuário atualizado com sucesso.
 *       400:
 *         description: Dados inválidos ou usuário não é um aluno
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Aluno não encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put(
  '/alunos/:id',
  autenticar,
  (req, res, next) => usuarioController.atualizarAluno(req, res, next)
);

/**
 * @swagger
 * /api/usuarios/professores/{id}:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Atualiza um professor
 *     description: Atualiza os dados de um professor específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do professor
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Maria Santos Atualizada
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria.nova@escola.com
 *     responses:
 *       200:
 *         description: Professor atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 mensagem:
 *                   type: string
 *                   example: Usuário atualizado com sucesso.
 *       400:
 *         description: Dados inválidos ou usuário não é um professor
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Professor não encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put(
  '/professores/:id',
  autenticar,
  (req, res, next) => usuarioController.atualizarProfessor(req, res, next)
);

/**
 * @swagger
 * /api/usuarios/alunos/{id}:
 *   delete:
 *     tags:
 *       - Usuários
 *     summary: Deleta um aluno
 *     description: Remove um aluno do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do aluno
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Aluno deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Usuário deletado com sucesso.
 *       400:
 *         description: Usuário não é um aluno
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Aluno não encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete(
  '/alunos/:id',
  autenticar,
  (req, res, next) => usuarioController.deletarAluno(req, res, next)
);

/**
 * @swagger
 * /api/usuarios/professores/{id}:
 *   delete:
 *     tags:
 *       - Usuários
 *     summary: Deleta um professor
 *     description: Remove um professor do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do professor
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Professor deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Usuário deletado com sucesso.
 *       400:
 *         description: Usuário não é um professor
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Professor não encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete(
  '/professores/:id',
  autenticar,
  (req, res, next) => usuarioController.deletarProfessor(req, res, next)
);

module.exports = router;
