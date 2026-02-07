const AtividadeRepository = require('../src/infrastructure/repositories/AtividadeRepository');
const UsuarioRepository = require('../src/infrastructure/repositories/UsuarioRepository');
const AtividadeModel = require('../src/infrastructure/database/models/AtividadeModel');
const UsuarioModel = require('../src/infrastructure/database/models/UsuarioModel');
const { criarProfessorComToken, criarAlunoComToken } = require('./helpers/testHelpers');

describe('Repositories', () => {
  describe('AtividadeRepository', () => {
    let repository;
    let professorId;

    beforeEach(async () => {
      repository = new AtividadeRepository();
      const { professor } = await criarProfessorComToken();
      professorId = professor._id.toString();
    });

    it('deve listar atividades públicas com filtros', async () => {
      // Cria algumas atividades públicas
      await AtividadeModel.create({
        titulo: 'Atividade Pública 1',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professorId,
        isPublica: true,
        status: 'publicada'
      });

      await AtividadeModel.create({
        titulo: 'Atividade Pública 2',
        descricao: 'Descrição',
        disciplina: 'Português',
        serie: '8º ano',
        professorId: professorId,
        isPublica: true,
        status: 'publicada'
      });

      const atividades = await repository.listarPublicas({ disciplina: 'Matemática' });
      expect(atividades).toHaveLength(1);
      expect(atividades[0].disciplina).toBe('Matemática');
    });

    it('deve listar atividades públicas filtradas por série', async () => {
      await AtividadeModel.create({
        titulo: 'Atividade Pública',
        descricao: 'Descrição',
        disciplina: 'História',
        serie: '7º ano',
        professorId: professorId,
        isPublica: true,
        status: 'publicada'
      });

      const atividades = await repository.listarPublicas({ serie: '7º ano' });
      expect(atividades).toHaveLength(1);
      expect(atividades[0].serie).toBe('7º ano');
    });

    it('deve retornar null ao duplicar atividade inexistente', async () => {
      const resultado = await repository.duplicar('507f1f77bcf86cd799439011', professorId);
      expect(resultado).toBeNull();
    });

    it('deve atualizar uma atividade existente', async () => {
      const atividade = await AtividadeModel.create({
        titulo: 'Atividade Original',
        descricao: 'Descrição',
        disciplina: 'Ciências',
        serie: '9º ano',
        professorId: professorId
      });

      const atualizada = await repository.atualizar(atividade._id.toString(), {
        titulo: 'Atividade Atualizada'
      });

      expect(atualizada.titulo).toBe('Atividade Atualizada');
    });

    it('deve deletar uma atividade existente', async () => {
      const atividade = await AtividadeModel.create({
        titulo: 'Atividade para Deletar',
        descricao: 'Descrição',
        disciplina: 'Geografia',
        serie: '9º ano',
        professorId: professorId
      });

      const resultado = await repository.deletar(atividade._id.toString());
      expect(resultado).toBe(true);

      const atividadeDeletada = await AtividadeModel.findById(atividade._id);
      expect(atividadeDeletada).toBeNull();
    });

    it('deve retornar false ao tentar deletar atividade inexistente', async () => {
      const resultado = await repository.deletar('507f1f77bcf86cd799439011');
      expect(resultado).toBe(false);
    });
  });

  describe('UsuarioRepository', () => {
    let repository;

    beforeEach(() => {
      repository = new UsuarioRepository();
    });

    it('deve listar usuários por tipo', async () => {
      await criarProfessorComToken();
      await criarAlunoComToken();

      const professores = await repository.buscarPorTipo('professor');
      expect(professores.length).toBeGreaterThanOrEqual(1);
      expect(professores.every(u => u.tipo === 'professor')).toBe(true);
    });

    it('deve listar todos os usuários', async () => {
      await criarProfessorComToken();
      await criarAlunoComToken();

      const usuarios = await repository.listarTodos();
      expect(usuarios.length).toBeGreaterThanOrEqual(2);
    });

    it('deve atualizar um usuário existente', async () => {
      const { professor } = await criarProfessorComToken();
      
      const usuarioAtualizado = await repository.atualizar(
        professor._id.toString(),
        { nome: 'Nome Atualizado' }
      );

      expect(usuarioAtualizado.nome).toBe('Nome Atualizado');
    });

    it('deve deletar um usuário existente', async () => {
      const { professor } = await criarProfessorComToken();
      
      const resultado = await repository.deletar(professor._id.toString());
      expect(resultado).toBe(true);

      const usuarioDeletado = await UsuarioModel.findById(professor._id);
      expect(usuarioDeletado).toBeNull();
    });

    it('deve retornar false ao tentar deletar usuário inexistente', async () => {
      const resultado = await repository.deletar('507f1f77bcf86cd799439011');
      expect(resultado).toBe(false);
    });

    it('deve verificar se email já existe', async () => {
      const { professor } = await criarProfessorComToken();
      
      const existe = await repository.emailJaExiste(professor.email);
      expect(existe).toBe(true);
    });

    it('deve retornar false para email que não existe', async () => {
      const existe = await repository.emailJaExiste('email-inexistente@teste.com');
      expect(existe).toBe(false);
    });
  });
});
