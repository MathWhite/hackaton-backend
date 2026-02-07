const request = require('supertest');
const app = require('../src/app');
const UsuarioModel = require('../src/infrastructure/database/models/UsuarioModel');
const { criarUsuarioTeste, gerarTokenTeste } = require('./helpers/testHelpers');

describe('Auth API - Autenticação', () => {
  
  describe('POST /api/auth/registrar', () => {
    
    it('deve registrar um novo professor com sucesso', async () => {
      const novoUsuario = {
        nome: 'Professor Novo',
        email: 'professor.novo@teste.com',
        senha: '123456',
        tipo: 'professor'
      };

      const response = await request(app)
        .post('/api/auth/registrar')
        .send(novoUsuario)
        .expect(201);

      expect(response.body).toHaveProperty('usuario');
      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.usuario.nome).toBe(novoUsuario.nome);
      expect(response.body.usuario.email).toBe(novoUsuario.email);
      expect(response.body.usuario.tipo).toBe(novoUsuario.tipo);
      expect(response.body.usuario).not.toHaveProperty('senha');

      // Verifica se foi salvo no banco
      const usuarioBanco = await UsuarioModel.findOne({ email: novoUsuario.email });
      expect(usuarioBanco).toBeTruthy();
      expect(usuarioBanco.nome).toBe(novoUsuario.nome);
    });

    it('deve registrar um novo aluno com sucesso', async () => {
      const novoAluno = {
        nome: 'Aluno Novo',
        email: 'aluno.novo@teste.com',
        senha: '123456',
        tipo: 'aluno'
      };

      const response = await request(app)
        .post('/api/auth/registrar')
        .send(novoAluno)
        .expect(201);

      expect(response.body.usuario.tipo).toBe('aluno');
    });

    it('deve falhar ao registrar com email duplicado', async () => {
      const usuario = {
        nome: 'Usuario 1',
        email: 'duplicado@teste.com',
        senha: '123456',
        tipo: 'professor'
      };

      // Primeiro registro
      await request(app)
        .post('/api/auth/registrar')
        .send(usuario)
        .expect(201);

      // Segundo registro com mesmo email
      const response = await request(app)
        .post('/api/auth/registrar')
        .send(usuario)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao registrar sem campos obrigatórios', async () => {
      const usuarioIncompleto = {
        nome: 'Teste',
        email: 'teste@teste.com'
        // faltando senha e tipo
      };

      const response = await request(app)
        .post('/api/auth/registrar')
        .send(usuarioIncompleto)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao registrar com email inválido', async () => {
      const usuarioEmailInvalido = {
        nome: 'Teste',
        email: 'email-invalido',
        senha: '123456',
        tipo: 'professor'
      };

      const response = await request(app)
        .post('/api/auth/registrar')
        .send(usuarioEmailInvalido)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao registrar com senha muito curta', async () => {
      const usuarioSenhaCurta = {
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123',
        tipo: 'professor'
      };

      const response = await request(app)
        .post('/api/auth/registrar')
        .send(usuarioSenhaCurta)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao registrar com tipo inválido', async () => {
      const usuarioTipoInvalido = {
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        tipo: 'admin' // tipo inválido
      };

      const response = await request(app)
        .post('/api/auth/registrar')
        .send(usuarioTipoInvalido)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('POST /api/auth/login', () => {
    
    it('deve fazer login com credenciais válidas de professor', async () => {
      const { usuario, senhaPlain } = await criarUsuarioTeste({
        email: 'professor@login.com',
        tipo: 'professor'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: usuario.email,
          senha: senhaPlain
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('usuario');
      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.usuario.email).toBe(usuario.email);
      expect(response.body.usuario).not.toHaveProperty('senha');
      expect(typeof response.body.token).toBe('string');
    });

    it('deve fazer login com credenciais válidas de aluno', async () => {
      const { usuario, senhaPlain } = await criarUsuarioTeste({
        email: 'aluno@login.com',
        tipo: 'aluno'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: usuario.email,
          senha: senhaPlain
        })
        .expect(200);

      expect(response.body.usuario.tipo).toBe('aluno');
      expect(response.body).toHaveProperty('token');
    });

    it('deve falhar ao fazer login com email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@teste.com',
          senha: '123456'
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao fazer login com senha incorreta', async () => {
      const { usuario } = await criarUsuarioTeste({
        email: 'teste@senha.com'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: usuario.email,
          senha: 'senhaerrada'
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao fazer login sem email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          senha: '123456'
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao fazer login sem senha', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@teste.com'
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('GET /api/auth/perfil', () => {
    
    it('deve retornar perfil do usuário autenticado', async () => {
      const { usuario, senhaPlain } = await criarUsuarioTeste({
        email: 'perfil@teste.com',
        nome: 'Usuario Perfil'
      });

      const token = gerarTokenTeste(usuario);

      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario.email).toBe(usuario.email);
      expect(response.body.usuario.nome).toBe(usuario.nome);
      expect(response.body.usuario).not.toHaveProperty('senha');
    });

    it('deve falhar ao acessar perfil sem token', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao acessar perfil com token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'Bearer token_invalido')
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao acessar perfil com formato de token incorreto', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao acessar perfil de usuário inexistente', async () => {
      const jwt = require('jsonwebtoken');
      const config = require('../src/config/env');
      
      // Cria token com ID falso
      const tokenFalso = jwt.sign(
        {
          id: '507f1f77bcf86cd799439011', // ID válido mas inexistente
          email: 'fake@teste.com',
          tipo: 'professor'
        },
        config.jwt.secret
      );

      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${tokenFalso}`)
        .expect(404);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('Rotas não existentes', () => {
    it('deve retornar 404 para rota não encontrada', async () => {
      const response = await request(app)
        .get('/api/rota-inexistente')
        .expect(404);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('Health Check', () => {
    it('deve retornar status OK no health check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('mensagem');
    });
  });
});
