const jwt = require('jsonwebtoken');
const config = require('../../config/env');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona os dados do usuário ao request
 */
const autenticar = (req, res, next) => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        erro: 'Token não fornecido.'
      });
    }

    // Formato: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({
        erro: 'Formato de token inválido.'
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        erro: 'Token mal formatado.'
      });
    }

    // Verifica o token
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          erro: 'Token inválido ou expirado.'
        });
      }

      // Adiciona as informações do usuário no request
      req.usuario = {
        id: decoded.id,
        email: decoded.email,
        tipo: decoded.tipo
      };

      return next();
    });
  } catch (erro) {
    return res.status(401).json({
      erro: 'Falha na autenticação.'
    });
  }
};

module.exports = autenticar;
