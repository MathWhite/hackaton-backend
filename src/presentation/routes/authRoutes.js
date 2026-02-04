const express = require('express');
const AuthController = require('../controllers/AuthController');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();
const authController = new AuthController();

/**
 * @route POST /api/auth/registrar
 * @desc Registra um novo usuário (professor ou aluno)
 * @access Public
 */
router.post('/registrar', (req, res, next) => authController.registrar(req, res, next));

/**
 * @route POST /api/auth/login
 * @desc Realiza login e retorna token JWT
 * @access Public
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @route GET /api/auth/perfil
 * @desc Retorna dados do usuário autenticado
 * @access Private
 */
router.get('/perfil', autenticar, (req, res, next) => authController.perfil(req, res, next));

module.exports = router;
