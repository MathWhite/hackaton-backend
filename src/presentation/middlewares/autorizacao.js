/**
 * Middleware para verificar se o usuário é um professor
 */
const verificarProfessor = (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        erro: 'Usuário não autenticado.'
      });
    }

    if (req.usuario.tipo !== 'professor') {
      return res.status(403).json({
        erro: 'Acesso negado. Apenas professores podem realizar esta ação.'
      });
    }

    next();
  } catch (erro) {
    return res.status(500).json({
      erro: 'Erro ao verificar permissão.'
    });
  }
};

/**
 * Middleware para verificar se o usuário é um aluno
 */
const verificarAluno = (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        erro: 'Usuário não autenticado.'
      });
    }

    if (req.usuario.tipo !== 'aluno') {
      return res.status(403).json({
        erro: 'Acesso negado. Apenas alunos podem realizar esta ação.'
      });
    }

    next();
  } catch (erro) {
    return res.status(500).json({
      erro: 'Erro ao verificar permissão.'
    });
  }
};

/**
 * Middleware para verificar se o usuário tem um dos tipos permitidos
 */
const verificarTipos = (...tiposPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          erro: 'Usuário não autenticado.'
        });
      }

      if (!tiposPermitidos.includes(req.usuario.tipo)) {
        return res.status(403).json({
          erro: `Acesso negado. Apenas ${tiposPermitidos.join(' ou ')} podem realizar esta ação.`
        });
      }

      next();
    } catch (erro) {
      return res.status(500).json({
        erro: 'Erro ao verificar permissão.'
      });
    }
  };
};

module.exports = {
  verificarProfessor,
  verificarAluno,
  verificarTipos
};
