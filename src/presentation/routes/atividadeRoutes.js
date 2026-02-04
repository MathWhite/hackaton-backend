const express = require('express');
const AtividadeController = require('../controllers/AtividadeController');
const autenticar = require('../middlewares/autenticar');
const { verificarProfessor } = require('../middlewares/autorizacao');

const router = express.Router();
const atividadeController = new AtividadeController();

/**
 * @route POST /api/atividades
 * @desc Cria uma nova atividade
 * @access Private (Somente Professores)
 */
router.post(
  '/',
  autenticar,
  verificarProfessor,
  (req, res, next) => atividadeController.criar(req, res, next)
);

/**
 * @route GET /api/atividades
 * @desc Lista atividades (professor: suas atividades | aluno: atividades públicas)
 * @access Private
 */
router.get(
  '/',
  autenticar,
  (req, res, next) => atividadeController.listar(req, res, next)
);

/**
 * @route GET /api/atividades/:id
 * @desc Busca uma atividade por ID
 * @access Private
 */
router.get(
  '/:id',
  autenticar,
  (req, res, next) => atividadeController.buscarPorId(req, res, next)
);

/**
 * @route PUT /api/atividades/:id
 * @desc Atualiza uma atividade
 * @access Private (Somente Professor Dono)
 */
router.put(
  '/:id',
  autenticar,
  verificarProfessor,
  (req, res, next) => atividadeController.atualizar(req, res, next)
);

/**
 * @route DELETE /api/atividades/:id
 * @desc Deleta uma atividade
 * @access Private (Somente Professor Dono)
 */
router.delete(
  '/:id',
  autenticar,
  verificarProfessor,
  (req, res, next) => atividadeController.deletar(req, res, next)
);

/**
 * @route POST /api/atividades/:id/duplicar
 * @desc Duplica uma atividade
 * @access Private (Somente Professores)
 */
router.post(
  '/:id/duplicar',
  autenticar,
  verificarProfessor,
  (req, res, next) => atividadeController.duplicar(req, res, next)
);

module.exports = router;
