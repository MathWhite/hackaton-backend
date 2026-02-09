const request = require('supertest');
const app = require('../src/app');
const { criarProfessorComToken, criarAlunoComToken } = require('./helpers/testHelpers');

describe('Inscrições API - CRUD', () => {

  describe('POST /api/inscricoes', () => {

    it('deve inscrever alunos em uma atividade (professor)', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade com Inscrições',
        descricao: 'Teste de inscrições',
        disciplina: 'Matemática',
        serie: '8º ano',
        conteudo: [
          {
            pergunta: 'Quanto é 2+2?',
            tipo: 'alternativa',
            alternativas: ['3', '4', '5'],
            resposta: '4'
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;

      // Inscrever alunos
      const inscricoes = {
        atividadeId,
        emails: ['aluno1@email.com', 'aluno2@email.com']
      };

      const response = await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(inscricoes)
        .expect(200);

      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.mensagem).toContain('inscrito(s) com sucesso');
      expect(response.body.novosInscritos).toBe(2);
      expect(response.body.atividade.inscricoes).toHaveLength(2);
    });

    it('deve evitar duplicação de emails já inscritos', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade Teste',
        descricao: 'Teste de duplicação',
        disciplina: 'História',
        serie: '7º ano',
        conteudo: [
          {
            pergunta: 'Teste',
            tipo: 'alternativa',
            alternativas: ['A', 'B'],
            resposta: 'A'
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;

      // Primeira inscrição
      await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send({
          atividadeId,
          emails: ['aluno@email.com']
        })
        .expect(200);

      // Segunda inscrição com mesmo email
      const response = await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send({
          atividadeId,
          emails: ['aluno@email.com']
        })
        .expect(200);

      expect(response.body.mensagem).toContain('já estão inscritos');
    });

    it('deve falhar ao tentar inscrever sem ser professor', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade Teste',
        descricao: 'Teste',
        disciplina: 'Geografia',
        serie: '6º ano',
        conteudo: [
          {
            pergunta: 'Teste',
            tipo: 'alternativa',
            alternativas: ['A', 'B'],
            resposta: 'A'
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const response = await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({
          atividadeId: atividadeResponse.body.atividade.id,
          emails: ['teste@email.com']
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('Apenas professores');
    });

    it('deve falhar ao tentar inscrever em atividade de outro professor', async () => {
      const { token: tokenProfessor1 } = await criarProfessorComToken();
      const { token: tokenProfessor2 } = await criarProfessorComToken();

      // Criar atividade com professor 1
      const atividade = {
        titulo: 'Atividade Professor 1',
        descricao: 'Teste',
        disciplina: 'Português',
        serie: '9º ano',
        conteudo: [
          {
            pergunta: 'Teste',
            tipo: 'dissertativa',
            alternativas: [],
            resposta: null
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor1}`)
        .send(atividade)
        .expect(201);

      // Professor 2 tenta inscrever alunos
      const response = await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor2}`)
        .send({
          atividadeId: atividadeResponse.body.atividade.id,
          emails: ['aluno@email.com']
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('permissão');
    });

    it('deve falhar sem autenticação', async () => {
      const response = await request(app)
        .post('/api/inscricoes')
        .send({
          atividadeId: '507f1f77bcf86cd799439011',
          emails: ['teste@email.com']
        })
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar sem atividadeId', async () => {
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          emails: ['teste@email.com']
        })
        .expect(400);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar com email inválido', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade',
        descricao: 'Teste',
        disciplina: 'Ciências',
        serie: '8º ano',
        conteudo: [
          {
            pergunta: 'Teste',
            tipo: 'alternativa',
            alternativas: ['A', 'B'],
            resposta: 'A'
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const response = await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send({
          atividadeId: atividadeResponse.body.atividade.id,
          emails: ['email-invalido']
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('inválido');
    });

  });

  describe('GET /api/inscricoes', () => {

    it('deve listar inscrições de uma atividade (professor)', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade Lista',
        descricao: 'Teste de listagem',
        disciplina: 'Matemática',
        serie: '5º ano',
        conteudo: [
          {
            pergunta: 'Quanto é 5+5?',
            tipo: 'alternativa',
            alternativas: ['8', '9', '10'],
            resposta: '10'
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;

      // Inscrever alunos
      await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send({
          atividadeId,
          emails: ['aluno1@email.com', 'aluno2@email.com', 'aluno3@email.com']
        })
        .expect(200);

      // Listar
      const response = await request(app)
        .get(`/api/inscricoes?atividadeId=${atividadeId}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .expect(200);

      expect(response.body).toHaveProperty('inscricoes');
      expect(response.body).toHaveProperty('total');
      expect(response.body.inscricoes).toHaveLength(3);
      expect(response.body.total).toBe(3);
    });

    it('deve falhar ao listar inscrições sendo aluno', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade Teste',
        descricao: 'Teste',
        disciplina: 'Física',
        serie: '9º ano',
        conteudo: [
          {
            pergunta: 'Teste',
            tipo: 'dissertativa',
            alternativas: [],
            resposta: null
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;

      // Aluno tenta listar
      const response = await request(app)
        .get(`/api/inscricoes?atividadeId=${atividadeId}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('permissão');
    });

    it('deve falhar sem atividadeId', async () => {
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .get('/api/inscricoes')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('erro');
    });

  });

  describe('DELETE /api/inscricoes/:id', () => {

    it('deve deletar uma inscrição específica', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade Delete',
        descricao: 'Teste delete',
        disciplina: 'Biologia',
        serie: '7º ano',
        conteudo: [
          {
            pergunta: 'O que é célula?',
            tipo: 'dissertativa',
            alternativas: [],
            resposta: null
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;

      // Inscrever aluno
      const inscricaoResponse = await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send({
          atividadeId,
          emails: ['aluno@email.com']
        })
        .expect(200);

      const inscricaoId = inscricaoResponse.body.atividade.inscricoes[0]._id;

      // Deletar
      const response = await request(app)
        .delete(`/api/inscricoes/${inscricaoId}?atividadeId=${atividadeId}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .expect(200);

      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.mensagem).toContain('removida com sucesso');
    });

    it('deve falhar ao deletar inscrição sendo aluno', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade Permissão',
        descricao: 'Teste permissão',
        disciplina: 'Química',
        serie: '8º ano',
        conteudo: [
          {
            pergunta: 'Teste',
            tipo: 'alternativa',
            alternativas: ['A', 'B'],
            resposta: 'A'
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;

      // Inscrever aluno
      const inscricaoResponse = await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send({
          atividadeId,
          emails: ['aluno@email.com']
        })
        .expect(200);

      const inscricaoId = inscricaoResponse.body.atividade.inscricoes[0]._id;

      // Aluno tenta deletar
      const response = await request(app)
        .delete(`/api/inscricoes/${inscricaoId}?atividadeId=${atividadeId}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('Apenas professores');
    });

    it('deve falhar ao deletar inscrição de atividade de outro professor', async () => {
      const { token: tokenProfessor1 } = await criarProfessorComToken();
      const { token: tokenProfessor2 } = await criarProfessorComToken();

      // Criar atividade com professor 1
      const atividade = {
        titulo: 'Atividade Prof 1',
        descricao: 'Teste',
        disciplina: 'Inglês',
        serie: '6º ano',
        conteudo: [
          {
            pergunta: 'What is your name?',
            tipo: 'dissertativa',
            alternativas: [],
            resposta: null
          }
        ],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor1}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;

      // Professor 1 inscreve aluno
      const inscricaoResponse = await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor1}`)
        .send({
          atividadeId,
          emails: ['aluno@email.com']
        })
        .expect(200);

      const inscricaoId = inscricaoResponse.body.atividade.inscricoes[0]._id;

      // Professor 2 tenta deletar
      const response = await request(app)
        .delete(`/api/inscricoes/${inscricaoId}?atividadeId=${atividadeId}`)
        .set('Authorization', `Bearer ${tokenProfessor2}`)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('permissão');
    });

    it('deve falhar sem atividadeId', async () => {
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .delete('/api/inscricoes/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('erro');
    });

  });

  describe('Integração com Visualização de Atividades', () => {

    it('aluno deve ver apenas atividades nas quais está inscrito', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { aluno, token: tokenAluno } = await criarAlunoComToken();

      // Criar atividade 1 e inscrever o aluno
      const atividade1 = {
        titulo: 'Atividade Inscrito',
        descricao: 'Aluno está inscrito',
        disciplina: 'Matemática',
        serie: '8º ano',
        conteudo: [{ pergunta: 'Teste', tipo: 'alternativa', alternativas: ['A'], resposta: 'A' }],
        status: 'publicada',
        isPublica: false
      };

      const atividadeResponse1 = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade1)
        .expect(201);

      await request(app)
        .post('/api/inscricoes')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send({
          atividadeId: atividadeResponse1.body.atividade.id,
          emails: [aluno.email]
        })
        .expect(200);

      // Criar atividade 2 sem inscrever o aluno
      const atividade2 = {
        titulo: 'Atividade Não Inscrito',
        descricao: 'Aluno NÃO está inscrito',
        disciplina: 'História',
        serie: '8º ano',
        conteudo: [{ pergunta: 'Teste', tipo: 'alternativa', alternativas: ['A'], resposta: 'A' }],
        status: 'publicada',
        isPublica: false
      };

      await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade2)
        .expect(201);

      // Aluno lista atividades
      const response = await request(app)
        .get('/api/atividades')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(200);

      expect(response.body.atividades).toHaveLength(1);
      expect(response.body.atividades[0].titulo).toBe('Atividade Inscrito');
    });

    it('professor deve ver todas as atividades (suas e de outros professores)', async () => {
      const { token: tokenProfessor1 } = await criarProfessorComToken();
      const { token: tokenProfessor2 } = await criarProfessorComToken();

      // Professor 1 cria atividade
      const atividade1 = {
        titulo: 'Atividade Professor 1',
        descricao: 'Criada por professor 1',
        disciplina: 'Matemática',
        serie: '8º ano',
        conteudo: [{ pergunta: 'Teste', tipo: 'alternativa', alternativas: ['A'], resposta: 'A' }],
        status: 'publicada',
        isPublica: true
      };

      await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor1}`)
        .send(atividade1)
        .expect(201);

      // Professor 2 cria atividade
      const atividade2 = {
        titulo: 'Atividade Professor 2',
        descricao: 'Criada por professor 2',
        disciplina: 'História',
        serie: '8º ano',
        conteudo: [{ pergunta: 'Teste', tipo: 'alternativa', alternativas: ['A'], resposta: 'A' }],
        status: 'publicada',
        isPublica: true
      };

      await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor2}`)
        .send(atividade2)
        .expect(201);

      // Professor 1 lista atividades (deve ver ambas)
      const response1 = await request(app)
        .get('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor1}`)
        .expect(200);

      expect(response1.body.atividades.length).toBeGreaterThanOrEqual(2);

      // Professor 2 lista atividades (deve ver ambas)
      const response2 = await request(app)
        .get('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor2}`)
        .expect(200);

      expect(response2.body.atividades.length).toBeGreaterThanOrEqual(2);
    });

  });

});
