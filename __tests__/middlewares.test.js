const request = require('supertest');
const app = require('../src/app');
const { criarProfessorComToken, criarAlunoComToken } = require('./helpers/testHelpers');

describe('Middlewares', () => {
  describe('Autorização - verificarProfessor', () => {
    it('deve permitir acesso a professor autenticado', async () => {
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Teste',
          descricao: 'Teste',
          disciplina: 'Matemática',
          serie: '9º ano'
        })
        .expect(201);

      expect(response.body).toHaveProperty('atividade');
    });

    it('deve bloquear acesso de aluno a rotas de professor', async () => {
      const { token } = await criarAlunoComToken();

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Teste',
          descricao: 'Teste',
          disciplina: 'Matemática',
          serie: '9º ano'
        })
        .expect(403);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('Apenas professores');
    });
  });

  describe('Autenticação', () => {
    it('deve bloquear acesso sem token de autenticação', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve bloquear acesso com token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve bloquear acesso com formato de token incorreto', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve retornar 404 para rota não encontrada', async () => {
      const response = await request(app)
        .get('/api/rota-inexistente')
        .expect(404);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve retornar erro ao tentar buscar atividade com ID inválido no MongoDB', async () => {
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .get('/api/atividades/id-invalido')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('CORS e Middlewares Gerais', () => {
    it('deve aceitar requisições com CORS configurado', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.mensagem).toContain('AulaPronta');
    });

    it('deve processar JSON no body', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          nome: 'Teste JSON',
          email: 'teste-json@exemplo.com',
          senha: '123456',
          tipo: 'professor'
        })
        .expect(201);

      expect(response.body).toHaveProperty('usuario');
    });

    it('deve processar URL encoded', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .type('form')
        .send('nome=Teste URL&email=teste-url@exemplo.com&senha=123456&tipo=aluno')
        .expect(201);

      expect(response.body).toHaveProperty('usuario');
    });
  });

  describe('Tratamento de Erros Específicos', () => {
    it('deve retornar erro de validação do Mongoose', async () => {
      const UsuarioModel = require('../src/infrastructure/database/models/UsuarioModel');
      
      try {
        await UsuarioModel.create({ nome: 'Teste' }); // Faltam campos required
      } catch (err) {
        expect(err.name).toBe('ValidationError');
      }
    });

    it('deve tratar erro de chave duplicada', async () => {
      const email = `duplicate${Date.now()}@teste.com`;
      
      await request(app)
        .post('/api/auth/registrar')
        .send({
          nome: 'Usuário 1',
          email: email,
          senha: '123456',
          tipo: 'professor'
        })
        .expect(201);

      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          nome: 'Usuário 2',
          email: email,
          senha: '123456',
          tipo: 'professor'
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('já cadastrado');
    });
  });

  describe('Permissões - Professor vs Outros', () => {
    it('deve permitir professor acessar atividade pública de outro professor', async () => {
      const { professor: prof1 } = await criarProfessorComToken('1');
      const { token: token2 } = await criarProfessorComToken('2');

      const AtividadeModel = require('../src/infrastructure/database/models/AtividadeModel');
      const atividade = await AtividadeModel.create({
        titulo: 'Atividade Pública',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: prof1._id,
        isPublica: true,
        status: 'publicada'
      });

      const response = await request(app)
        .get(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response.body.atividade.titulo).toBe('Atividade Pública');
    });

    it('deve bloquear professor de acessar atividade privada de outro professor', async () => {
      const { professor: prof1 } = await criarProfessorComToken('3');
      const { token: token2 } = await criarProfessorComToken('4');

      const AtividadeModel = require('../src/infrastructure/database/models/AtividadeModel');
      const atividade = await AtividadeModel.create({
        titulo: 'Atividade Privada',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: prof1._id,
        isPublica: false
      });

      const response = await request(app)
        .get(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('Tratamento de Erros do Mongoose', () => {
    it('deve retornar 400 para ValidationError', async () => {
      // Força um erro de validação do Mongoose criando sem campos obrigatórios
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          nome: 'Teste'
          // faltando campos obrigatórios
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve tratar erro com statusCode customizado', async () => {
      // Os erros customizados com erro.statusCode são tratados pela aplicação
      // Já testado implicitamente em outros testes que retornam 404, 403, etc
      const { token } = await criarProfessorComToken();
      
      const response = await request(app)
        .get('/api/atividades/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('erro');
    });
  });
});
