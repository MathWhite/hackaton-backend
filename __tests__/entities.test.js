const Atividade = require('../src/domain/entities/Atividade');
const Usuario = require('../src/domain/entities/Usuario');

describe('Entidades de Domínio', () => {
  describe('Atividade', () => {
    let atividadeBase;

    beforeEach(() => {
      atividadeBase = {
        id: '123',
        titulo: 'Atividade Teste',
        descricao: 'Descrição teste',
        disciplina: 'Matemática',
        serie: '9º ano',
        professorId: 'prof123',
        status: 'rascunho'
      };
    });

    it('deve criar uma atividade com valores padrão', () => {
      const atividade = new Atividade(atividadeBase);
      expect(atividade.materiaisApoio).toEqual([]);
      expect(atividade.status).toBe('rascunho');
      expect(atividade.isPublica).toBe(false);
    });

    it('deve publicar uma atividade', () => {
      const atividade = new Atividade(atividadeBase);
      atividade.publicar();
      expect(atividade.status).toBe('publicada');
    });

    it('deve lançar erro ao tentar publicar atividade já publicada', () => {
      const atividade = new Atividade({ ...atividadeBase, status: 'publicada' });
      expect(() => atividade.publicar()).toThrow('Atividade já está publicada.');
    });

    it('deve despublicar uma atividade', () => {
      const atividade = new Atividade({ ...atividadeBase, status: 'publicada' });
      atividade.despublicar();
      expect(atividade.status).toBe('rascunho');
    });

    it('deve lançar erro ao tentar despublicar atividade já em rascunho', () => {
      const atividade = new Atividade(atividadeBase);
      expect(() => atividade.despublicar()).toThrow('Atividade já está como rascunho.');
    });

    it('deve tornar atividade pública', () => {
      const atividade = new Atividade(atividadeBase);
      atividade.tornarPublica();
      expect(atividade.isPublica).toBe(true);
    });

    it('deve tornar atividade privada', () => {
      const atividade = new Atividade({ ...atividadeBase, isPublica: true });
      atividade.tornarPrivada();
      expect(atividade.isPublica).toBe(false);
    });

    it('deve verificar se atividade pertence ao professor', () => {
      const atividade = new Atividade(atividadeBase);
      expect(atividade.isPertenceAoProfessor('prof123')).toBe(true);
      expect(atividade.isPertenceAoProfessor('prof456')).toBe(false);
    });

    it('deve adicionar material de apoio válido', () => {
      const atividade = new Atividade(atividadeBase);
      const material = { tipo: 'pdf', conteudo: 'conteudo.pdf' };
      atividade.adicionarMaterialApoio(material);
      expect(atividade.materiaisApoio).toHaveLength(1);
      expect(atividade.materiaisApoio[0]).toEqual(material);
    });

    it('deve lançar erro ao adicionar material sem tipo', () => {
      const atividade = new Atividade(atividadeBase);
      const material = { conteudo: 'conteudo.pdf' };
      expect(() => atividade.adicionarMaterialApoio(material))
        .toThrow('Material de apoio inválido. Deve conter tipo e conteúdo.');
    });

    it('deve lançar erro ao adicionar material sem conteúdo', () => {
      const atividade = new Atividade(atividadeBase);
      const material = { tipo: 'pdf' };
      expect(() => atividade.adicionarMaterialApoio(material))
        .toThrow('Material de apoio inválido. Deve conter tipo e conteúdo.');
    });

    it('deve validar atividade com todos os campos obrigatórios', () => {
      const atividade = new Atividade(atividadeBase);
      expect(() => atividade.validar()).not.toThrow();
    });

    it('deve lançar erro ao validar sem título', () => {
      const atividade = new Atividade({ ...atividadeBase, titulo: '' });
      expect(() => atividade.validar()).toThrow('Título é obrigatório.');
    });

    it('deve lançar erro ao validar sem descrição', () => {
      const atividade = new Atividade({ ...atividadeBase, descricao: '' });
      expect(() => atividade.validar()).toThrow('Descrição é obrigatória.');
    });

    it('deve lançar erro ao validar sem disciplina', () => {
      const atividade = new Atividade({ ...atividadeBase, disciplina: '' });
      expect(() => atividade.validar()).toThrow('Disciplina é obrigatória.');
    });

    it('deve lançar erro ao validar sem série', () => {
      const atividade = new Atividade({ ...atividadeBase, serie: '' });
      expect(() => atividade.validar()).toThrow('Série/Ano é obrigatório.');
    });

    it('deve lançar erro ao validar sem professorId', () => {
      const atividade = new Atividade({ ...atividadeBase, professorId: null });
      expect(() => atividade.validar()).toThrow('Professor é obrigatório.');
    });

    it('deve lançar erro ao validar com status inválido', () => {
      const atividade = new Atividade({ ...atividadeBase, status: 'invalido' });
      expect(() => atividade.validar()).toThrow('Status inválido.');
    });
  });

  describe('Usuario', () => {
    let usuarioBase;

    beforeEach(() => {
      usuarioBase = {
        id: '123',
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
        senha: '123456',
        tipo: 'professor'
      };
    });

    it('deve criar um usuário com valores padrão', () => {
      const usuario = new Usuario(usuarioBase);
      expect(usuario.criadoEm).toBeInstanceOf(Date);
      expect(usuario.atualizadoEm).toBeInstanceOf(Date);
    });

    it('deve verificar se é professor', () => {
      const professor = new Usuario(usuarioBase);
      expect(professor.isProfessor()).toBe(true);
      expect(professor.isAluno()).toBe(false);
    });

    it('deve verificar se é aluno', () => {
      const aluno = new Usuario({ ...usuarioBase, tipo: 'aluno' });
      expect(aluno.isAluno()).toBe(true);
      expect(aluno.isProfessor()).toBe(false);
    });

    it('deve validar tipo de usuário válido', () => {
      const usuario = new Usuario(usuarioBase);
      expect(() => usuario.validarTipo()).not.toThrow();
    });

    it('deve lançar erro ao validar tipo inválido', () => {
      const usuario = new Usuario({ ...usuarioBase, tipo: 'admin' });
      expect(() => usuario.validarTipo())
        .toThrow('Tipo de usuário inválido. Deve ser "professor" ou "aluno".');
    });

    it('deve validar email válido', () => {
      const usuario = new Usuario(usuarioBase);
      expect(() => usuario.validarEmail()).not.toThrow();
    });

    it('deve lançar erro ao validar email inválido', () => {
      const usuario = new Usuario({ ...usuarioBase, email: 'email-invalido' });
      expect(() => usuario.validarEmail()).toThrow('Email inválido.');
    });

    it('deve validar senha válida', () => {
      const usuario = new Usuario(usuarioBase);
      expect(() => usuario.validarSenha()).not.toThrow();
    });

    it('deve lançar erro ao validar senha muito curta', () => {
      const usuario = new Usuario({ ...usuarioBase, senha: '123' });
      expect(() => usuario.validarSenha())
        .toThrow('A senha deve ter no mínimo 6 caracteres.');
    });

    it('deve lançar erro ao validar sem senha', () => {
      const usuario = new Usuario({ ...usuarioBase, senha: '' });
      expect(() => usuario.validarSenha())
        .toThrow('A senha deve ter no mínimo 6 caracteres.');
    });

    it('deve validar usuário completo com sucesso', () => {
      const usuario = new Usuario(usuarioBase);
      expect(() => usuario.validar()).not.toThrow();
    });

    it('deve lançar erro ao validar sem nome', () => {
      const usuario = new Usuario({ ...usuarioBase, nome: '' });
      expect(() => usuario.validar()).toThrow('Nome é obrigatório.');
    });

    it('deve lançar erro ao validar com email inválido', () => {
      const usuario = new Usuario({ ...usuarioBase, email: 'invalido' });
      expect(() => usuario.validar()).toThrow('Email inválido.');
    });

    it('deve lançar erro ao validar com senha muito curta', () => {
      const usuario = new Usuario({ ...usuarioBase, senha: '123' });
      expect(() => usuario.validar()).toThrow('A senha deve ter no mínimo 6 caracteres.');
    });

    it('deve lançar erro ao validar com tipo inválido', () => {
      const usuario = new Usuario({ ...usuarioBase, tipo: 'admin' });
      expect(() => usuario.validar())
        .toThrow('Tipo de usuário inválido. Deve ser "professor" ou "aluno".');
    });
  });
});
