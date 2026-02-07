const { verificarProfessor, verificarAluno, verificarTipos } = require('../src/presentation/middlewares/autorizacao');
const autenticar = require('../src/presentation/middlewares/autenticar');
const tratarErros = require('../src/presentation/middlewares/tratarErros');

describe('Middlewares Unitários', () => {
  describe('verificarProfessor', () => {
    it('deve bloquear se req.usuario não existir', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verificarProfessor(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Usuário não autenticado.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve bloquear se usuário não for professor', () => {
      const req = { usuario: { tipo: 'aluno' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verificarProfessor(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Acesso negado. Apenas professores podem realizar esta ação.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve permitir acesso de professor', () => {
      const req = { usuario: { tipo: 'professor' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verificarProfessor(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve tratar erros inesperados', () => {
      const req = { usuario: null };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Força um erro ao acessar propriedade de null
      req.usuario = { get tipo() { throw new Error('Erro inesperado'); } };

      verificarProfessor(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Erro ao verificar permissão.'
      });
    });
  });

  describe('verificarAluno', () => {
    it('deve bloquear se req.usuario não existir', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verificarAluno(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Usuário não autenticado.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve bloquear se usuário não for aluno', () => {
      const req = { usuario: { tipo: 'professor' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verificarAluno(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Acesso negado. Apenas alunos podem realizar esta ação.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve permitir acesso de aluno', () => {
      const req = { usuario: { tipo: 'aluno' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verificarAluno(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve tratar erros inesperados', () => {
      const req = { usuario: { get tipo() { throw new Error('Erro'); } } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      verificarAluno(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Erro ao verificar permissão.'
      });
    });
  });

  describe('verificarTipos', () => {
    it('deve bloquear se req.usuario não existir', () => {
      const middleware = verificarTipos('professor', 'aluno');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve bloquear se tipo não for permitido', () => {
      const middleware = verificarTipos('professor');
      const req = { usuario: { tipo: 'aluno' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('deve permitir se tipo for permitido', () => {
      const middleware = verificarTipos('professor', 'aluno');
      const req = { usuario: { tipo: 'professor' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve tratar erros inesperados', () => {
      const middleware = verificarTipos('professor');
      const req = { usuario: { get tipo() { throw new Error('Erro'); } } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('tratarErros', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
      console.error = jest.fn(); // Mock console.error
    });

    it('deve tratar ValidationError do Mongoose', () => {
      const err = {
        name: 'ValidationError',
        errors: {
          campo1: { message: 'Campo 1 é obrigatório' },
          campo2: { message: 'Campo 2 é inválido' }
        }
      };

      tratarErros(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Erro de validação',
        detalhes: expect.arrayContaining(['Campo 1 é obrigatório', 'Campo 2 é inválido'])
      });
    });

    it('deve tratar CastError do Mongoose', () => {
      const err = {
        name: 'CastError'
      };

      tratarErros(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'ID inválido'
      });
    });

    it('deve tratar erro de chave duplicada (11000)', () => {
      const err = {
        code: 11000,
        keyPattern: { email: 1 }
      };

      tratarErros(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'email já está em uso.'
      });
    });

    it('deve tratar erro com statusCode customizado', () => {
      const err = {
        statusCode: 404,
        message: 'Recurso não encontrado'
      };

      tratarErros(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Recurso não encontrado'
      });
    });

    it('deve tratar erro genérico', () => {
      const err = new Error('Erro genérico');

      tratarErros(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Erro genérico'
      });
    });

    it('deve tratar erro sem mensagem', () => {
      const err = {};

      tratarErros(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Erro interno do servidor'
      });
    });
  });

  describe('autenticar - catch block', () => {
    it('deve tratar exceção durante verificação do token', () => {
      const req = {
        headers: {
          authorization: 'Bearer token-valido'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Mock jwt.verify para lançar exceção
      const jwt = require('jsonwebtoken');
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn(() => {
        throw new Error('Erro inesperado');
      });

      autenticar(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Falha na autenticação.'
      });

      // Restaura o método original
      jwt.verify = originalVerify;
    });
  });
});
