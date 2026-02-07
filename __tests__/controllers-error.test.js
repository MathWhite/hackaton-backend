const AtividadeController = require('../src/presentation/controllers/AtividadeController');
const AuthController = require('../src/presentation/controllers/AuthController');
const AtividadeRepository = require('../src/infrastructure/repositories/AtividadeRepository');
const UsuarioRepository = require('../src/infrastructure/repositories/UsuarioRepository');

describe('Controllers - Error Handling', () => {
  describe('AtividadeController', () => {
    it('deve chamar next(erro) quando ocorrer exceção em buscarPorId', async () => {
      const controller = new AtividadeController();
      
      // Mock do repository que lança erro
      controller.atividadeRepository.buscarPorId = jest.fn().mockRejectedValue(
        new Error('Erro no banco de dados')
      );

      const req = {
        params: { id: '123' },
        usuario: { id: 'prof1', tipo: 'professor' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await controller.buscarPorId(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Erro no banco de dados');
    });

    it('deve chamar next(erro) quando ocorrer exceção em listar', async () => {
      const controller = new AtividadeController();
      
      // Mock que lança erro
      controller.listarAtividadesUseCase.executar = jest.fn().mockRejectedValue(
        new Error('Erro ao listar')
      );

      const req = {
        query: {},
        usuario: { id: 'prof1', tipo: 'professor' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await controller.listar(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('AuthController', () => {
    it('deve chamar next(erro) quando ocorrer exceção em perfil', async () => {
      const controller = new AuthController();
      
      // Mock que lança erro
      controller.usuarioRepository.buscarPorId = jest.fn().mockRejectedValue(
        new Error('Erro ao buscar usuário')
      );

      const req = {
        usuario: { id: 'user1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await controller.perfil(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Erro ao buscar usuário');
    });

    it('deve chamar next(erro) quando ocorrer exceção em registrar', async () => {
      const controller = new AuthController();
      
      // Mock que lança erro
      controller.registrarUsuarioUseCase.executar = jest.fn().mockRejectedValue(
        new Error('Erro ao registrar')
      );

      const req = {
        body: {
          nome: 'Teste',
          email: 'teste@teste.com',
          senha: '123456',
          tipo: 'professor'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await controller.registrar(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('deve chamar next(erro) quando ocorrer exceção em login', async () => {
      const controller = new AuthController();
      
      // Mock que lança erro
      controller.loginUsuarioUseCase.executar = jest.fn().mockRejectedValue(
        new Error('Erro ao fazer login')
      );

      const req = {
        body: {
          email: 'teste@teste.com',
          senha: '123456'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
