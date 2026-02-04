require('dotenv').config();
const app = require('./app');
const database = require('./config/database');
const config = require('./config/env');

class Server {
  async start() {
    try {
      // Conecta ao MongoDB
      await database.connect();

      // Inicia o servidor
      const port = config.port;
      app.listen(port, () => {
        console.log('');
        console.log('🚀 ====================================');
        console.log(`   Servidor rodando na porta ${port}`);
        console.log(`   Ambiente: ${config.nodeEnv}`);
        console.log(`   URL: http://localhost:${port}`);
        console.log('🚀 ====================================');
        console.log('');
      });
    } catch (erro) {
      console.error('❌ Erro ao iniciar servidor:', erro);
      process.exit(1);
    }
  }

  async stop() {
    try {
      await database.disconnect();
      console.log('🛑 Servidor encerrado');
      process.exit(0);
    } catch (erro) {
      console.error('❌ Erro ao encerrar servidor:', erro);
      process.exit(1);
    }
  }
}

// Instancia e inicia o servidor
const server = new Server();
server.start();

// Tratamento de sinais para encerramento gracioso
process.on('SIGINT', () => server.stop());
process.on('SIGTERM', () => server.stop());

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.stop();
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.stop();
});
