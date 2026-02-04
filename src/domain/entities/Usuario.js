/**
 * Entidade Usuario (Domain)
 * Representa a lógica de negócio pura de um usuário
 */
class Usuario {
  constructor({ id, nome, email, senha, tipo, criadoEm, atualizadoEm }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.tipo = tipo; // 'professor' ou 'aluno'
    this.criadoEm = criadoEm || new Date();
    this.atualizadoEm = atualizadoEm || new Date();
  }

  // Regras de negócio
  isProfessor() {
    return this.tipo === 'professor';
  }

  isAluno() {
    return this.tipo === 'aluno';
  }

  validarTipo() {
    const tiposValidos = ['professor', 'aluno'];
    if (!tiposValidos.includes(this.tipo)) {
      throw new Error('Tipo de usuário inválido. Deve ser "professor" ou "aluno".');
    }
  }

  validarEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('Email inválido.');
    }
  }

  validarSenha(senhaMinima = 6) {
    if (!this.senha || this.senha.length < senhaMinima) {
      throw new Error(`A senha deve ter no mínimo ${senhaMinima} caracteres.`);
    }
  }

  validar() {
    if (!this.nome || this.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório.');
    }
    
    this.validarEmail();
    this.validarSenha();
    this.validarTipo();
  }
}

module.exports = Usuario;
