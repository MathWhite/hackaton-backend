const CriarAtividadeUseCase = require('../src/application/use-cases/CriarAtividadeUseCase');
const AtualizarAtividadeUseCase = require('../src/application/use-cases/AtualizarAtividadeUseCase');
const DeletarAtividadeUseCase = require('../src/application/use-cases/DeletarAtividadeUseCase');
const DuplicarAtividadeUseCase = require('../src/application/use-cases/DuplicarAtividadeUseCase');
const ListarAtividadesUseCase = require('../src/application/use-cases/ListarAtividadesUseCase');
const AtividadeRepository = require('../src/infrastructure/repositories/AtividadeRepository');
const AtividadeModel = require('../src/infrastructure/database/models/AtividadeModel');
const { criarProfessorComToken, criarAlunoComToken } = require('./helpers/testHelpers');

describe('Use Cases', () => {
  let repository;
  let professorId;

  beforeEach(async () => {
    repository = new AtividadeRepository();
    const { professor } = await criarProfessorComToken();
    professorId = professor._id.toString();
  });

  describe('CriarAtividadeUseCase', () => {
    it('deve lançar erro se professorId não for fornecido', async () => {
      const useCase = new CriarAtividadeUseCase(repository);
      const dadosAtividade = {
        titulo: 'Teste',
        descricao: 'Teste',
        disciplina: 'Matemática',
        serie: '9º ano'
      };

      await expect(useCase.executar(dadosAtividade, null))
        .rejects.toThrow('Professor não identificado.');
    });
  });

  describe('AtualizarAtividadeUseCase', () => {
    it('deve lançar erro se atividade não for encontrada', async () => {
      const useCase = new AtualizarAtividadeUseCase(repository);
      const idInexistente = '507f1f77bcf86cd799439011';

      await expect(useCase.executar(idInexistente, { titulo: 'Novo' }, professorId))
        .rejects.toThrow('Atividade não encontrada.');
    });
  });

  describe('DeletarAtividadeUseCase', () => {
    it('deve lançar erro se atividade não for encontrada', async () => {
      const useCase = new DeletarAtividadeUseCase(repository);
      const idInexistente = '507f1f77bcf86cd799439011';

      await expect(useCase.executar(idInexistente, professorId))
        .rejects.toThrow('Atividade não encontrada.');
    });
  });

  describe('DuplicarAtividadeUseCase', () => {
    it('deve lançar erro se atividade não for encontrada', async () => {
      const useCase = new DuplicarAtividadeUseCase(repository);
      const idInexistente = '507f1f77bcf86cd799439011';

      await expect(useCase.executar(idInexistente, professorId))
        .rejects.toThrow('Atividade não encontrada.');
    });
  });

  describe('ListarAtividadesUseCase', () => {
    it('deve lançar erro para tipo de usuário inválido', async () => {
      const useCase = new ListarAtividadesUseCase(repository);
      
      await expect(useCase.executar('user123', 'admin', {}))
        .rejects.toThrow('Tipo de usuário inválido.');
    });

    it('deve listar atividades do professor', async () => {
      await AtividadeModel.create({
        titulo: 'Atividade Teste',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professorId
      });

      const useCase = new ListarAtividadesUseCase(repository);
      const resultado = await useCase.executar(professorId, 'professor', {});

      expect(resultado.atividades).toHaveLength(1);
      expect(resultado.total).toBe(1);
    });

    it('deve listar apenas atividades nas quais o aluno está inscrito', async () => {
      const { aluno } = await criarAlunoComToken();

      await AtividadeModel.create({
        titulo: 'Atividade Inscrito',
        descricao: 'Descrição',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: professorId,
        inscricoes: [{ alunoEmail: aluno.email }],
        status: 'publicada'
      });

      await AtividadeModel.create({
        titulo: 'Atividade Não Inscrito',
        descricao: 'Descrição',
        disciplina: 'Português',
        serie: '9º ano',
        professorId: professorId,
        inscricoes: [],
        isPublica: false
      });

      const useCase = new ListarAtividadesUseCase(repository);
      const resultado = await useCase.executar(aluno._id, 'aluno', {});

      expect(resultado.atividades).toHaveLength(1);
      expect(resultado.atividades[0].titulo).toBe('Atividade Inscrito');
    });
  });
});
