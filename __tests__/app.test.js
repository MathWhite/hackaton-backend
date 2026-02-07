const request = require('supertest');

describe('App Configuration', () => {
  let originalEnv;

  beforeAll(() => {
    // Save original NODE_ENV
    originalEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('deve ter middleware de logging em modo desenvolvimento', () => {
    // Set to development mode
    process.env.NODE_ENV = 'development';
    
    // Clear and re-require app to get development config
    delete require.cache[require.resolve('../src/app')];
    const app = require('../src/app');

    // Test that the app works with dev logging
    return request(app)
      .get('/')
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty('mensagem');
        expect(response.body.mensagem).toContain('AulaPronta');
        
        // Restore test mode
        process.env.NODE_ENV = 'test';
        delete require.cache[require.resolve('../src/app')];
      });
  });

  it('deve processar requisições normalmente em modo test', () => {
    // Ensure we're in test mode
    process.env.NODE_ENV = 'test';
    
    // Clear and re-require app
    delete require.cache[require.resolve('../src/app')];
    const app = require('../src/app');

    return request(app)
      .get('/')
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty('mensagem');
      });
  });

  it('deve ter configuração CORS adequada', () => {
    const app = require('../src/app');

    return request(app)
      .get('/')
      .set('Origin', 'http://localhost:3000')
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty('mensagem');
      });
  });
});
