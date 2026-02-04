const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const routes = require('./presentation/routes');
const tratarErros = require('./presentation/middlewares/tratarErros');

class App {
  constructor() {
    this.app = express();
    this.configurarMiddlewares();
    this.configurarRotas();
    this.configurarTratamentoErros();
  }

  configurarMiddlewares() {
    // CORS
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true
    }));

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Log de requisições (desenvolvimento)
    if (config.nodeEnv === 'development') {
      this.app.use((req, res, next) => {
        console.log(`📥 ${req.method} ${req.url}`);
        next();
      });
    }
  }

  configurarRotas() {
    // Rotas da API
    this.app.use('/api', routes);

    // Rota raiz
    this.app.get('/', (req, res) => {
      res.json({
        mensagem: 'Bem-vindo à API AulaPronta! 🎓',
        versao: '1.0.0',
        documentacao: '/api/health'
      });
    });

    // Rota 404
    this.app.use((req, res) => {
      res.status(404).json({
        erro: 'Rota não encontrada.'
      });
    });
  }

  configurarTratamentoErros() {
    // Middleware global de tratamento de erros
    this.app.use(tratarErros);
  }

  getApp() {
    return this.app;
  }
}

module.exports = new App().getApp();
