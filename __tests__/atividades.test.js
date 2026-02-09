const request = require('supertest');
const app = require('../src/app');
const AtividadeModel = require('../src/infrastructure/database/models/AtividadeModel');
const { criarProfessorComToken, criarAlunoComToken } = require('./helpers/testHelpers');

describe('Atividades API - CRUD', () => {

  describe('POST /api/atividades', () => {

    it('deve criar uma nova atividade com sucesso (professor)', async () => {
      const { professor, token } = await criarProfessorComToken();

      const novaAtividade = {
        titulo: 'Atividade de Matemática',
        descricao: 'Resolver equações de segundo grau',
        disciplina: 'Matemática',
        serie: '9º ano',
        objetivo: 'Aprender equações',
        status: 'rascunho'
      };

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send(novaAtividade)
        .expect(201);

      expect(response.body).toHaveProperty('atividade');
      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.atividade.titulo).toBe(novaAtividade.titulo);
      expect(response.body.atividade.descricao).toBe(novaAtividade.descricao);
      expect(response.body.atividade.disciplina).toBe(novaAtividade.disciplina);
      expect(response.body.atividade.professorId).toBe(professor._id.toString());

      // Verifica se foi salvo no banco
      const atividadeBanco = await AtividadeModel.findById(response.body.atividade.id);
      expect(atividadeBanco).toBeTruthy();
    });

    it('deve criar atividade com materiais de apoio', async () => {
      const { token } = await criarProfessorComToken();

      const atividade = {
        titulo: 'Atividade com Materiais',
        descricao: 'Teste',
        disciplina: 'História',
        serie: '8º ano',
        materiaisApoio: [
          { tipo: 'texto', conteudo: 'Material em texto' },
          { tipo: 'link', conteudo: 'https://exemplo.com' }
        ]
      };

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send(atividade)
        .expect(201);

      expect(response.body.atividade.materiaisApoio).toHaveLength(2);
    });

    it('deve criar atividade com conteúdo (perguntas alternativas e dissertativas)', async () => {
      const { token } = await criarProfessorComToken();

      const atividade = {
        titulo: 'Atividade com Conteúdo',
        descricao: 'Exercícios variados',
        disciplina: 'Geografia',
        serie: '7º ano',
        conteudo: [
          {
            pergunta: 'Qual é a capital do Brasil?',
            tipo: 'alternativa',
            alternativas: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'],
            resposta: 'Brasília'
          },
          {
            pergunta: 'Explique o conceito de fotossíntese',
            tipo: 'dissertativa',
            alternativas: [],
            resposta: null
          }
        ]
      };

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send(atividade)
        .expect(201);

      expect(response.body.atividade.conteudo).toHaveLength(2);
      expect(response.body.atividade.conteudo[0].pergunta).toBe('Qual é a capital do Brasil?');
      expect(response.body.atividade.conteudo[0].tipo).toBe('alternativa');
      expect(response.body.atividade.conteudo[0].alternativas).toHaveLength(4);
      expect(response.body.atividade.conteudo[1].tipo).toBe('dissertativa');
    });

    it('deve falhar ao criar atividade com conteúdo inválido (sem pergunta)', async () => {
      const { token } = await criarProfessorComToken();

      const atividade = {
        titulo: 'Atividade Inválida',
        descricao: 'Teste',
        disciplina: 'Matemática',
        serie: '8º ano',
        conteudo: [
          {
            tipo: 'alternativa',
            alternativas: ['A', 'B', 'C'],
            resposta: 'A'
          }
        ]
      };

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send(atividade)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('Pergunta é obrigatória');
    });

    it('deve falhar ao criar atividade com tipo de conteúdo inválido', async () => {
      const { token } = await criarProfessorComToken();

      const atividade = {
        titulo: 'Atividade Inválida',
        descricao: 'Teste',
        disciplina: 'Matemática',
        serie: '8º ano',
        conteudo: [
          {
            pergunta: 'Teste?',
            tipo: 'multipla_escolha', // tipo inválido
            alternativas: ['A', 'B'],
            resposta: 'A'
          }
        ]
      };

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send(atividade)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao criar questão alternativa sem alternativas', async () => {
      const { token } = await criarProfessorComToken();

      const atividade = {
        titulo: 'Atividade Inválida',
        descricao: 'Teste',
        disciplina: 'Matemática',
        serie: '8º ano',
        conteudo: [
          {
            pergunta: 'Qual é a resposta?',
            tipo: 'alternativa',
            alternativas: [],
            resposta: null
          }
        ]
      };

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send(atividade)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('alternativa devem ter pelo menos uma alternativa');
    });

    it('deve falhar ao criar atividade sem autenticação', async () => {
      const atividade = {
        titulo: 'Teste',
        descricao: 'Teste',
        disciplina: 'Matemática',
        serie: '9º ano'
      };

      const response = await request(app)
        .post('/api/atividades')
        .send(atividade)
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao criar atividade como aluno', async () => {
      const { token } = await criarAlunoComToken();

      const atividade = {
        titulo: 'Teste',
        descricao: 'Teste',
        disciplina: 'Matemática',
        serie: '9º ano'
      };

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send(atividade)
        .expect(403);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('professor');
    });

    it('deve falhar ao criar atividade sem título', async () => {
      const { token } = await criarProfessorComToken();

      const atividade = {
        descricao: 'Teste',
        disciplina: 'Matemática',
        serie: '9º ano'
      };

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send(atividade)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao criar atividade sem descrição', async () => {
      const { token } = await criarProfessorComToken();

      const atividade = {
        titulo: 'Teste',
        disciplina: 'Matemática',
        serie: '9º ano'
      };

      const response = await request(app)
        .post('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .send(atividade)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('GET /api/atividades', () => {

    it('deve listar atividades do professor autenticado', async () => {
      const { professor, token } = await criarProfessorComToken();

      // Cria algumas atividades
      await AtividadeModel.create([
        {
          titulo: 'Atividade 1',
          descricao: 'Desc 1',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professor._id
        },
        {
          titulo: 'Atividade 2',
          descricao: 'Desc 2',
          disciplina: 'Português',
          serie: '8º ano',
          professorId: professor._id
        }
      ]);

      const response = await request(app)
        .get('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('atividades');
      expect(response.body).toHaveProperty('total');
      expect(response.body.atividades).toHaveLength(2);
    });

    it('deve listar apenas atividades nas quais o aluno está inscrito', async () => {
      const { professor } = await criarProfessorComToken();
      const { aluno, token: tokenAluno } = await criarAlunoComToken();

      // Cria atividades - uma com o aluno inscrito, outra sem
      await AtividadeModel.create([
        {
          titulo: 'Atividade Inscrito',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professor._id,
          inscricoes: [{ alunoEmail: aluno.email }],
          isPublica: false,
          status: 'publicada'
        },
        {
          titulo: 'Atividade Não Inscrito',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professor._id,
          inscricoes: [],
          isPublica: false,
          status: 'publicada'
        }
      ]);

      const response = await request(app)
        .get('/api/atividades')
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(200);

      expect(response.body.atividades).toHaveLength(1);
      expect(response.body.atividades[0].titulo).toBe('Atividade Inscrito');
    });

    it('deve filtrar atividades por disciplina', async () => {
      const { professor, token } = await criarProfessorComToken();

      await AtividadeModel.create([
        {
          titulo: 'Atividade 1',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professor._id
        },
        {
          titulo: 'Atividade 2',
          descricao: 'Desc',
          disciplina: 'Português',
          serie: '9º ano',
          professorId: professor._id
        }
      ]);

      const response = await request(app)
        .get('/api/atividades?disciplina=Matemática')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.atividades).toHaveLength(1);
      expect(response.body.atividades[0].disciplina).toBe('Matemática');
    });

    it('deve filtrar atividades por série', async () => {
      const { professor, token } = await criarProfessorComToken();

      await AtividadeModel.create([
        {
          titulo: 'Atividade 1',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professor._id
        },
        {
          titulo: 'Atividade 2',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '8º ano',
          professorId: professor._id
        }
      ]);

      const response = await request(app)
        .get('/api/atividades?serie=8º ano')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.atividades).toHaveLength(1);
      expect(response.body.atividades[0].serie).toBe('8º ano');
    });

    it('deve filtrar atividades por status', async () => {
      const { professor, token } = await criarProfessorComToken();

      await AtividadeModel.create([
        {
          titulo: 'Atividade 1',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professor._id,
          status: 'publicada'
        },
        {
          titulo: 'Atividade 2',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professor._id,
          status: 'rascunho'
        }
      ]);

      const response = await request(app)
        .get('/api/atividades?status=publicada')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.atividades).toHaveLength(1);
      expect(response.body.atividades[0].status).toBe('publicada');
    });

    it('deve filtrar atividades por professorId', async () => {
      const { professor: professor1, token: token1 } = await criarProfessorComToken('filtro1');
      const { professor: professor2 } = await criarProfessorComToken('filtro2');

      await AtividadeModel.create([
        {
          titulo: 'Atividade Professor 1',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professor1._id,
          status: 'publicada',
          isPublica: true
        },
        {
          titulo: 'Atividade Professor 2',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professor2._id,
          status: 'publicada',
          isPublica: true
        }
      ]);

      const response = await request(app)
        .get(`/api/atividades?professorId=${professor2._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.atividades).toHaveLength(1);
      expect(response.body.atividades[0].titulo).toBe('Atividade Professor 2');
    });

    it('deve respeitar privacidade: professor vê suas atividades + públicas de outros', async () => {
      // Criar Professor A
      const { professor: professorA, token: tokenA } = await criarProfessorComToken('privA');
      // Criar Professor B
      const { professor: professorB, token: tokenB } = await criarProfessorComToken('privB');

      // Professor A cria 2 atividades: 1 pública e 1 privada
      await AtividadeModel.create([
        {
          titulo: 'Atividade Pública A',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professorA._id,
          status: 'publicada',
          isPublica: true
        },
        {
          titulo: 'Atividade Privada A',
          descricao: 'Desc',
          disciplina: 'Matemática',
          serie: '9º ano',
          professorId: professorA._id,
          status: 'publicada',
          isPublica: false
        }
      ]);

      // Professor B cria 1 atividade pública
      await AtividadeModel.create({
        titulo: 'Atividade Pública B',
        descricao: 'Desc',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professorB._id,
        status: 'publicada',
        isPublica: true
      });

      // Professor A lista: deve ver 3 (suas 2 + pública de B)
      const responseA = await request(app)
        .get('/api/atividades')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(responseA.body.atividades).toHaveLength(3);
      const titulosA = responseA.body.atividades.map(a => a.titulo).sort();
      expect(titulosA).toEqual(['Atividade Privada A', 'Atividade Pública A', 'Atividade Pública B']);

      // Professor B lista: deve ver 2 (sua 1 pública + pública de A, NÃO a privada de A)
      const responseB = await request(app)
        .get('/api/atividades')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(responseB.body.atividades).toHaveLength(2);
      const titulosB = responseB.body.atividades.map(a => a.titulo).sort();
      expect(titulosB).toEqual(['Atividade Pública A', 'Atividade Pública B']);
    });

    it('deve retornar lista vazia se não houver atividades', async () => {
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .get('/api/atividades')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.atividades).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /api/atividades/:id', () => {

    it('deve buscar uma atividade por ID (professor dono)', async () => {
      const { professor, token } = await criarProfessorComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Atividade Teste',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor._id
      });

      const response = await request(app)
        .get(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('atividade');
      expect(response.body.atividade.titulo).toBe(atividade.titulo);
    });

    it('deve buscar atividade pública como aluno', async () => {
      const { professor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Atividade Pública',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor._id,
        isPublica: true,
        status: 'publicada'
      });

      const response = await request(app)
        .get(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(200);

      expect(response.body.atividade.titulo).toBe(atividade.titulo);
    });

    it('deve falhar ao buscar atividade privada como aluno', async () => {
      const { professor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Atividade Privada',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor._id,
        isPublica: false
      });

      const response = await request(app)
        .get(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(403);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao buscar atividade com ID inválido', async () => {
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .get('/api/atividades/id_invalido')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve retornar 404 para atividade inexistente', async () => {
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .get('/api/atividades/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('PUT /api/atividades/:id', () => {

    it('deve atualizar uma atividade com sucesso', async () => {
      const { professor, token } = await criarProfessorComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Título Original',
        descricao: 'Descrição Original',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor._id
      });

      const dadosAtualizados = {
        titulo: 'Título Atualizado',
        descricao: 'Descrição Atualizada'
      };

      const response = await request(app)
        .put(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(dadosAtualizados)
        .expect(200);

      expect(response.body.atividade.titulo).toBe(dadosAtualizados.titulo);
      expect(response.body.atividade.descricao).toBe(dadosAtualizados.descricao);
    });

    it('deve falhar ao atualizar atividade de outro professor', async () => {
      const { professor: professor1 } = await criarProfessorComToken();
      const { token: token2 } = await criarProfessorComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Atividade do Professor 1',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor1._id
      });

      const response = await request(app)
        .put(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ titulo: 'Tentando Atualizar' })
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao atualizar como aluno', async () => {
      const { professor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Atividade',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor._id
      });

      const response = await request(app)
        .put(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send({ titulo: 'Tentando Atualizar' })
        .expect(403);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('DELETE /api/atividades/:id', () => {

    it('deve deletar uma atividade com sucesso', async () => {
      const { professor, token } = await criarProfessorComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Atividade para Deletar',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor._id
      });

      const response = await request(app)
        .delete(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('mensagem');

      // Verifica se foi deletada do banco
      const atividadeBanco = await AtividadeModel.findById(atividade._id);
      expect(atividadeBanco).toBeNull();
    });

    it('deve falhar ao deletar atividade de outro professor', async () => {
      const { professor: professor1 } = await criarProfessorComToken();
      const { token: token2 } = await criarProfessorComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Atividade do Professor 1',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor1._id
      });

      const response = await request(app)
        .delete(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(500);

      expect(response.body).toHaveProperty('erro');

      // Verifica que não foi deletada
      const atividadeBanco = await AtividadeModel.findById(atividade._id);
      expect(atividadeBanco).toBeTruthy();
    });

    it('deve falhar ao deletar como aluno', async () => {
      const { professor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Atividade',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor._id
      });

      const response = await request(app)
        .delete(`/api/atividades/${atividade._id}`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(403);

      expect(response.body).toHaveProperty('erro');
    });
  });

  describe('POST /api/atividades/:id/duplicar', () => {

    it('deve duplicar uma atividade própria com sucesso', async () => {
      const { professor, token } = await criarProfessorComToken();

      const atividadeOriginal = await AtividadeModel.create({
        titulo: 'Atividade Original',
        descricao: 'Descrição Original',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor._id,
        materiaisApoio: [{ tipo: 'texto', conteudo: 'Material 1' }]
      });

      const response = await request(app)
        .post(`/api/atividades/${atividadeOriginal._id}/duplicar`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(response.body).toHaveProperty('atividade');
      expect(response.body.atividade.titulo).toContain('cópia');
      expect(response.body.atividade.descricao).toBe(atividadeOriginal.descricao);
      expect(response.body.atividade.status).toBe('rascunho');
      expect(response.body.atividade.isPublica).toBe(false);
    });

    it('deve duplicar atividade pública de outro professor', async () => {
      const { professor: professor1 } = await criarProfessorComToken();
      const { token: token2 } = await criarProfessorComToken();

      const atividadePublica = await AtividadeModel.create({
        titulo: 'Atividade Pública',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor1._id,
        isPublica: true,
        status: 'publicada'
      });

      const response = await request(app)
        .post(`/api/atividades/${atividadePublica._id}/duplicar`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(201);

      expect(response.body.atividade).toBeTruthy();
    });

    it('deve falhar ao duplicar atividade privada de outro professor', async () => {
      const { professor: professor1 } = await criarProfessorComToken();
      const { token: token2 } = await criarProfessorComToken();

      const atividadePrivada = await AtividadeModel.create({
        titulo: 'Atividade Privada',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor1._id,
        isPublica: false
      });

      const response = await request(app)
        .post(`/api/atividades/${atividadePrivada._id}/duplicar`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao duplicar como aluno', async () => {
      const { professor } = await criarProfessorComToken();
      const { token: tokenAluno } = await criarAlunoComToken();

      const atividade = await AtividadeModel.create({
        titulo: 'Atividade',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professor._id,
        isPublica: true
      });

      const response = await request(app)
        .post(`/api/atividades/${atividade._id}/duplicar`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .expect(403);

      expect(response.body).toHaveProperty('erro');
    });
  });
});
