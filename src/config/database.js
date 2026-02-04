const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aulapronta';
      
      this.connection = await mongoose.connect(mongoURI);
      
      console.log('✅ MongoDB conectado com sucesso!');
      console.log(`📍 Database: ${this.connection.connection.name}`);
      
      return this.connection;
    } catch (error) {
      console.error('❌ Erro ao conectar ao MongoDB:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB desconectado');
    }
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new Database();
