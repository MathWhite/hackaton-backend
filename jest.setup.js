require('dotenv').config({ path: '.env.test' });

const mongoose = require('mongoose');

// Mock console para testes mais limpos
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Configurações globais para testes
beforeAll(async () => {
  // Conecta ao banco de testes
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aulapronta_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Limpa o banco e desconecta
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  // Limpa todas as collections após cada teste
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
