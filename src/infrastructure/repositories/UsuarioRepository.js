const UsuarioModel = require('../database/models/UsuarioModel');
const Usuario = require('../../domain/entities/Usuario');

class UsuarioRepository {
  /**
   * Converte um documento MongoDB para a entidade de domínio
   */
  _toEntity(doc) {
    if (!doc) return null;
    
    return new Usuario({
      id: doc._id.toString(),
      nome: doc.nome,
      email: doc.email,
      senha: doc.senha,
      tipo: doc.tipo,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm
    });
  }

  /**
   * Cria um novo usuário
   */
  async criar(usuario) {
    const novoUsuario = await UsuarioModel.create({
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      tipo: usuario.tipo
    });

    return this._toEntity(novoUsuario);
  }

  /**
   * Busca usuário por ID
   */
  async buscarPorId(id) {
    const usuario = await UsuarioModel.findById(id);
    return this._toEntity(usuario);
  }

  /**
   * Busca usuário por email
   */
  async buscarPorEmail(email) {
    const usuario = await UsuarioModel.findOne({ email }).select('+senha');
    return this._toEntity(usuario);
  }

  /**
   * Busca usuários por tipo
   */
  async buscarPorTipo(tipo) {
    const usuarios = await UsuarioModel.find({ tipo });
    return usuarios.map(u => this._toEntity(u));
  }

  /**
   * Lista todos os usuários
   */
  async listarTodos() {
    const usuarios = await UsuarioModel.find();
    return usuarios.map(u => this._toEntity(u));
  }

  /**
   * Atualiza um usuário
   */
  async atualizar(id, dadosAtualizados) {
    const usuario = await UsuarioModel.findByIdAndUpdate(
      id,
      dadosAtualizados,
      { new: true, runValidators: true }
    );
    return this._toEntity(usuario);
  }

  /**
   * Deleta um usuário
   */
  async deletar(id) {
    const resultado = await UsuarioModel.findByIdAndDelete(id);
    return resultado !== null;
  }

  /**
   * Verifica se email já existe
   */
  async emailJaExiste(email) {
    const count = await UsuarioModel.countDocuments({ email });
    return count > 0;
  }
}

module.exports = UsuarioRepository;
