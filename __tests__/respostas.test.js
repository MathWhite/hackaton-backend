const request = require('supertest');
const app = require('../src/app');
const AtividadeModel = require('../src/infrastructure/database/models/AtividadeModel');
const { criarProfessorComToken, criarAlunoComToken } = require('./helpers/testHelpers');

describe('Respostas API - CRUD', () => {

  describe('POST /api/respostas', () => {

    it('deve criar respostas para uma atividade (aluno)', async () => {
      const { professor, token: tokenProfessor } = await criarProfessorComToken();
      const { aluno, token: tokenAluno } = await criarAlunoComToken();

      // Criar atividade com conteúdo
      const atividade = {
        titulo: 'Atividade com Perguntas',
        descricao: 'Teste de respostas',
        disciplina: 'Matemática',
        serie: '8º ano',
        conteudo: [
          {
            pergunta: 'Quanto é 2+2?',
            tipo: 'alternativa',
            alternativas: ['3', '4', '5'],
            resposta: '4'
          },
          {
            pergunta: 'Explique a soma',
            tipo: 'dissertativa',
            alternativas: [],
            resposta: null
          }
        ],
        status: 'publicada',
        isPublica: true
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;
      const perguntaId1 = atividadeResponse.body.atividade.conteudo[0]._id;
      const perguntaId2 = atividadeResponse.body.atividade.conteudo[1]._id;

      // Aluno responde
      const respostas = {
        atividadeId,
        respostas: [
          { perguntaId: perguntaId1, resposta: '4' },
          { perguntaId: perguntaId2, resposta: 'A soma é a operação matemática básica' }
        ]
      };

      const response = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send(respostas)
        .expect(200);

      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.mensagem).toContain('Respostas salvas com sucesso');
      expect(response.body.atividade.respostas).toHaveLength(2);
    });

    it('deve sobrescrever respostas anteriores do mesmo usuário', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade Teste',
        descricao: 'Teste de sobrescrita',
        disciplina: 'História',
        serie: '7º ano',
        conteudo: [
          {
            pergunta: 'Quando foi descoberto o Brasil?',
            tipo: 'alternativa',
            alternativas: ['1492', '1500', '1600'],
            resposta: '1500'
          }
        ],
        status: 'publicada',
        isPublica: true
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;
      const perguntaId = atividadeResponse.body.atividade.conteudo[0]._id;

      // Primeira resposta
      await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({
          atividadeId,
          respostas: [{ perguntaId, resposta: '1492' }]
        })
        .expect(200);

      // Segunda resposta (sobrescreve)
      const response = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({
          atividadeId,
          respostas: [{ perguntaId, resposta: '1500' }]
        })
        .expect(200);

      expect(response.body.atividade.respostas).toHaveLength(1);
      expect(response.body.atividade.respostas[0].resposta).toBe('1500');
    });

    it('deve falhar ao tentar responder atividade finalizada', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      // Criar atividade finalizada
      const atividadeDoc = await AtividadeModel.create({
        titulo: 'Atividade Finalizada',
        descricao: 'Teste',
        disciplina: 'Geografia',
        serie: '6º ano',
        professorId: (await criarProfessorComToken()).professor._id,
        conteudo: [
          {
            pergunta: 'Pergunta teste',
            tipo: 'alternativa',
            alternativas: ['A', 'B'],
            resposta: 'A'
          }
        ],
        status: 'publicada',
        isPublica: true,
        finalizado: true
      });

      const response = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({
          atividadeId: atividadeDoc._id.toString(),
          respostas: [
            { perguntaId: atividadeDoc.conteudo[0]._id.toString(), resposta: 'A' }
          ]
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('finalizada');
    });

    it('deve falhar ao responder atividade privada (aluno)', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      // Criar atividade privada
      const atividade = {
        titulo: 'Atividade Privada',
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
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const response = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({
          atividadeId: atividadeResponse.body.atividade.id,
          respostas: [
            { 
              perguntaId: atividadeResponse.body.atividade.conteudo[0]._id, 
              resposta: 'Teste' 
            }
          ]
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar sem autenticação', async () => {
      const response = await request(app)
        .post('/api/respostas')
        .send({
          atividadeId: '507f1f77bcf86cd799439011',
          respostas: [{ perguntaId: 'xxx', resposta: 'teste' }]
        })
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar sem atividadeId', async () => {
      const { token } = await criarAlunoComToken();

      const response = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          respostas: [{ perguntaId: 'xxx', resposta: 'teste' }]
        })
        .expect(400);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar com perguntaId inválido', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

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
        isPublica: true
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const response = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({
          atividadeId: atividadeResponse.body.atividade.id,
          respostas: [{ perguntaId: 'id-inexistente', resposta: 'A' }]
        })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('não encontrada');
    });

  });

  describe('GET /api/respostas', () => {

    it('deve listar respostas do aluno (o próprio)', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      // Criar e responder atividade
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
        isPublica: true
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;
      const perguntaId = atividadeResponse.body.atividade.conteudo[0]._id;

      // Responder
      await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({
          atividadeId,
          respostas: [{ perguntaId, resposta: '10' }]
        })
        .expect(200);

      // Listar
      const response = await request(app)
        .get(`/api/respostas?atividadeId=${atividadeId}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(200);

      expect(response.body).toHaveProperty('respostas');
      expect(response.body).toHaveProperty('total');
      expect(response.body.respostas).toHaveLength(1);
      expect(response.body.finalizado).toBe(false);
    });

    it('deve listar todas as respostas (professor)', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno1 } = await criarAlunoComToken();
      const { token: tokenAluno2 } = await criarAlunoComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade Professor',
        descricao: 'Teste listagem professor',
        disciplina: 'Física',
        serie: '9º ano',
        conteudo: [
          {
            pergunta: 'Lei de Newton?',
            tipo: 'dissertativa',
            alternativas: [],
            resposta: null
          }
        ],
        status: 'publicada',
        isPublica: true
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;
      const perguntaId = atividadeResponse.body.atividade.conteudo[0]._id;

      // Aluno 1 responde
      await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno1}`)
        .send({
          atividadeId,
          respostas: [{ perguntaId, resposta: 'Resposta aluno 1' }]
        })
        .expect(200);

      // Aluno 2 responde
      await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno2}`)
        .send({
          atividadeId,
          respostas: [{ perguntaId, resposta: 'Resposta aluno 2' }]
        })
        .expect(200);

      // Professor lista todas
      const response = await request(app)
        .get(`/api/respostas?atividadeId=${atividadeId}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .expect(200);

      expect(response.body.respostas).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('deve falhar sem atividadeId', async () => {
      const { token } = await criarAlunoComToken();

      const response = await request(app)
        .get('/api/respostas')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('erro');
    });

  });

  describe('DELETE /api/respostas/:id', () => {

    it('deve deletar uma resposta específica', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

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
        isPublica: true
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;
      const perguntaId = atividadeResponse.body.atividade.conteudo[0]._id;

      // Responder
      const respostaResponse = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({
          atividadeId,
          respostas: [{ perguntaId, resposta: 'É a menor unidade da vida' }]
        })
        .expect(200);

      const respostaId = respostaResponse.body.atividade.respostas[0]._id;

      // Deletar
      const response = await request(app)
        .delete(`/api/respostas/${respostaId}?atividadeId=${atividadeId}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(200);

      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.mensagem).toContain('deletada com sucesso');
    });

    it('deve falhar ao deletar resposta de atividade finalizada', async () => {
      const { token: tokenAluno } = await criarAlunoComToken();
      const { professor } = await criarProfessorComToken();

      // Criar atividade finalizada com resposta
      const atividadeDoc = await AtividadeModel.create({
        titulo: 'Atividade Finalizada',
        descricao: 'Teste',
        disciplina: 'Química',
        serie: '8º ano',
        professorId: professor._id,
        conteudo: [
          {
            pergunta: 'Teste',
            tipo: 'alternativa',
            alternativas: ['A', 'B'],
            resposta: 'A'
          }
        ],
        respostas: [
          {
            alunoId: (await criarAlunoComToken()).aluno._id,
            perguntaId: 'xxx',
            resposta: 'A'
          }
        ],
        status: 'publicada',
        isPublica: true,
        finalizado: true
      });

      const respostaId = atividadeDoc.respostas[0]._id.toString();

      const response = await request(app)
        .delete(`/api/respostas/${respostaId}?atividadeId=${atividadeDoc._id}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('finalizada');
    });

    it('deve falhar ao deletar resposta de outro usuário', async () => {
      const { token: tokenProfessor } = await criarProfessorComToken();
      const { token: tokenAluno1 } = await criarAlunoComToken();
      const { token: tokenAluno2 } = await criarAlunoComToken();

      // Criar atividade
      const atividade = {
        titulo: 'Atividade Permissão',
        descricao: 'Teste permissão',
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
        isPublica: true
      };

      const atividadeResponse = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(atividade)
        .expect(201);

      const atividadeId = atividadeResponse.body.atividade.id;
      const perguntaId = atividadeResponse.body.atividade.conteudo[0]._id;

      // Aluno 1 responde
      const respostaResponse = await request(app)
        .post('/api/respostas')
        .set('Authorization', `Bearer ${tokenAluno1}`)
        .send({
          atividadeId,
          respostas: [{ perguntaId, resposta: 'My name is John' }]
        })
        .expect(200);

      const respostaId = respostaResponse.body.atividade.respostas[0]._id;

      // Aluno 2 tenta deletar
      const response = await request(app)
        .delete(`/api/respostas/${respostaId}?atividadeId=${atividadeId}`)
        .set('Authorization', `Bearer ${tokenAluno2}`)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('permissão');
    });

    it('deve falhar sem atividadeId', async () => {
      const { token } = await criarAlunoComToken();

      const response = await request(app)
        .delete('/api/respostas/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('erro');
    });

  });

});
