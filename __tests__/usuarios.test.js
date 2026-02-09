const request = require('supertest');
const app = require('../src/app');
const UsuarioModel = require('../src/infrastructure/database/models/UsuarioModel');
const { criarProfessorComToken, criarAlunoComToken, criarUsuarioTeste } = require('./helpers/testHelpers');

describe('Usuarios API - CRUD de Alunos e Professores', () => {

  describe('GET /api/usuarios/alunos', () => {

    it('deve listar todos os alunos (autenticado como professor)', async () => {
      // Criar alguns alunos
      await criarUsuarioTeste({ tipo: 'aluno', email: 'aluno1@teste.com' });
      await criarUsuarioTeste({ tipo: 'aluno', email: 'aluno2@teste.com' });
      await criarUsuarioTeste({ tipo: 'aluno', email: 'aluno3@teste.com' });

      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .get('/api/usuarios/alunos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('alunos');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('mensagem');
      expect(Array.isArray(response.body.alunos)).toBe(true);
      expect(response.body.alunos.length).toBeGreaterThanOrEqual(3);
      
      // Verificar que todos são alunos
      response.body.alunos.forEach(aluno => {
        expect(aluno.tipo).toBe('aluno');
      });
    });

    it('deve listar todos os alunos (autenticado como aluno)', async () => {
      const { token } = await criarAlunoComToken();

      const response = await request(app)
        .get('/api/usuarios/alunos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('alunos');
    });

    it('deve falhar ao listar alunos sem autenticação', async () => {
      const response = await request(app)
        .get('/api/usuarios/alunos')
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

  });

  describe('GET /api/usuarios/professores', () => {

    it('deve listar todos os professores (autenticado)', async () => {
      // Criar alguns professores
      await criarUsuarioTeste({ tipo: 'professor', email: 'prof1@teste.com' });
      await criarUsuarioTeste({ tipo: 'professor', email: 'prof2@teste.com' });

      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .get('/api/usuarios/professores')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('professores');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('mensagem');
      expect(Array.isArray(response.body.professores)).toBe(true);
      expect(response.body.professores.length).toBeGreaterThanOrEqual(2);
      
      // Verificar que todos são professores
      response.body.professores.forEach(prof => {
        expect(prof.tipo).toBe('professor');
      });
    });

    it('deve falhar ao listar professores sem autenticação', async () => {
      const response = await request(app)
        .get('/api/usuarios/professores')
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

  });

  describe('PUT /api/usuarios/alunos/:id', () => {

    it('deve atualizar um aluno com sucesso (o próprio aluno)', async () => {
      const { aluno, token } = await criarAlunoComToken();

      const dadosAtualizados = {
        nome: 'Aluno Atualizado'
      };

      const response = await request(app)
        .put(`/api/usuarios/alunos/${aluno._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(dadosAtualizados)
        .expect(200);

      expect(response.body).toHaveProperty('usuario');
      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.usuario.nome).toBe(dadosAtualizados.nome);

      // Verifica no banco
      const alunoAtualizado = await UsuarioModel.findById(aluno._id);
      expect(alunoAtualizado.nome).toBe(dadosAtualizados.nome);
    });

    it('deve permitir professor atualizar qualquer aluno', async () => {
      const { aluno } = await criarAlunoComToken();
      const { token: tokenProfessor } = await criarProfessorComToken();

      const dadosAtualizados = {
        nome: 'Aluno Atualizado pelo Professor'
      };

      const response = await request(app)
        .put(`/api/usuarios/alunos/${aluno._id}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .send(dadosAtualizados)
        .expect(200);

      expect(response.body.usuario.nome).toBe(dadosAtualizados.nome);
    });

    it('deve falhar ao aluno tentar atualizar outro aluno', async () => {
      const { aluno: aluno1 } = await criarAlunoComToken();
      const { token: tokenAluno2 } = await criarAlunoComToken();

      const dadosAtualizados = {
        nome: 'Tentativa de Atualização'
      };

      const response = await request(app)
        .put(`/api/usuarios/alunos/${aluno1._id}`)
        .set('Authorization', `Bearer ${tokenAluno2}`)
        .send(dadosAtualizados)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('permissão');
    });

    it('deve falhar ao atualizar aluno inexistente', async () => {
      const { token } = await criarProfessorComToken();
      const idInexistente = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/usuarios/alunos/${idInexistente}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Teste' })
        .expect(404);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao tentar atualizar um professor pela rota de alunos', async () => {
      const { professor, token } = await criarProfessorComToken();

      const response = await request(app)
        .put(`/api/usuarios/alunos/${professor._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Teste' })
        .expect(400);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('não é um aluno');
    });

    it('deve falhar ao atualizar sem autenticação', async () => {
      const { aluno } = await criarAlunoComToken();

      const response = await request(app)
        .put(`/api/usuarios/alunos/${aluno._id}`)
        .send({ nome: 'Teste' })
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

  });

  describe('PUT /api/usuarios/professores/:id', () => {

    it('deve atualizar um professor com sucesso (o próprio professor)', async () => {
      const { professor, token } = await criarProfessorComToken();

      const dadosAtualizados = {
        nome: 'Professor Atualizado'
      };

      const response = await request(app)
        .put(`/api/usuarios/professores/${professor._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(dadosAtualizados)
        .expect(200);

      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario.nome).toBe(dadosAtualizados.nome);
    });

    it('deve permitir professor atualizar outro professor', async () => {
      const { professor: prof1 } = await criarProfessorComToken();
      const { token: tokenProf2 } = await criarProfessorComToken();

      const dadosAtualizados = {
        nome: 'Professor Atualizado'
      };

      const response = await request(app)
        .put(`/api/usuarios/professores/${prof1._id}`)
        .set('Authorization', `Bearer ${tokenProf2}`)
        .send(dadosAtualizados)
        .expect(200);

      expect(response.body.usuario.nome).toBe(dadosAtualizados.nome);
    });

    it('deve falhar ao tentar atualizar um aluno pela rota de professores', async () => {
      const { aluno } = await criarAlunoComToken();
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .put(`/api/usuarios/professores/${aluno._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Teste' })
        .expect(400);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('não é um professor');
    });

  });

  describe('DELETE /api/usuarios/alunos/:id', () => {

    it('deve deletar um aluno com sucesso (o próprio aluno)', async () => {
      const { aluno, token } = await criarAlunoComToken();

      const response = await request(app)
        .delete(`/api/usuarios/alunos/${aluno._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('mensagem');
      expect(response.body.mensagem).toContain('deletado com sucesso');

      // Verifica que foi deletado do banco
      const alunoNoBanco = await UsuarioModel.findById(aluno._id);
      expect(alunoNoBanco).toBeNull();
    });

    it('deve permitir professor deletar qualquer aluno', async () => {
      const { aluno } = await criarAlunoComToken();
      const { token: tokenProfessor } = await criarProfessorComToken();

      const response = await request(app)
        .delete(`/api/usuarios/alunos/${aluno._id}`)
        .set('Authorization', `Bearer ${tokenProfessor}`)
        .expect(200);

      expect(response.body.mensagem).toContain('deletado com sucesso');
    });

    it('deve falhar ao aluno tentar deletar outro aluno', async () => {
      const { aluno: aluno1 } = await criarAlunoComToken();
      const { token: tokenAluno2 } = await criarAlunoComToken();

      const response = await request(app)
        .delete(`/api/usuarios/alunos/${aluno1._id}`)
        .set('Authorization', `Bearer ${tokenAluno2}`)
        .expect(500);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('permissão');
    });

    it('deve falhar ao deletar aluno inexistente', async () => {
      const { token } = await criarProfessorComToken();
      const idInexistente = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/usuarios/alunos/${idInexistente}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('erro');
    });

    it('deve falhar ao tentar deletar um professor pela rota de alunos', async () => {
      const { professor, token } = await criarProfessorComToken();

      const response = await request(app)
        .delete(`/api/usuarios/alunos/${professor._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('não é um aluno');
    });

    it('deve falhar ao deletar sem autenticação', async () => {
      const { aluno } = await criarAlunoComToken();

      const response = await request(app)
        .delete(`/api/usuarios/alunos/${aluno._id}`)
        .expect(401);

      expect(response.body).toHaveProperty('erro');
    });

  });

  describe('DELETE /api/usuarios/professores/:id', () => {

    it('deve deletar um professor com sucesso (o próprio professor)', async () => {
      const { professor, token } = await criarProfessorComToken();

      const response = await request(app)
        .delete(`/api/usuarios/professores/${professor._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.mensagem).toContain('deletado com sucesso');

      // Verifica que foi deletado do banco
      const professorNoBanco = await UsuarioModel.findById(professor._id);
      expect(professorNoBanco).toBeNull();
    });

    it('deve permitir professor deletar outro professor', async () => {
      const { professor: prof1 } = await criarProfessorComToken();
      const { token: tokenProf2 } = await criarProfessorComToken();

      const response = await request(app)
        .delete(`/api/usuarios/professores/${prof1._id}`)
        .set('Authorization', `Bearer ${tokenProf2}`)
        .expect(200);

      expect(response.body.mensagem).toContain('deletado com sucesso');
    });

    it('deve falhar ao tentar deletar um aluno pela rota de professores', async () => {
      const { aluno } = await criarAlunoComToken();
      const { token } = await criarProfessorComToken();

      const response = await request(app)
        .delete(`/api/usuarios/professores/${aluno._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toContain('não é um professor');
    });

  });

});
