const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AulaPronta API',
      version: '1.0.0',
      description: 'API para gestão de atividades pedagógicas - Sistema AulaPronta',
      contact: {
        name: 'Equipe AulaPronta',
        email: 'contato@aulapronta.com.br'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.aulapronta.com.br',
        description: 'Servidor de Produção'
      }
    ],
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints para autenticação e gerenciamento de usuários'
      },
      {
        name: 'Atividades',
        description: 'Endpoints para gerenciamento de atividades pedagógicas'
      },
      {
        name: 'Respostas',
        description: 'Endpoints para gerenciamento de respostas de atividades'
      },
      {
        name: 'Inscrições',
        description: 'Endpoints para gerenciamento de inscrições de alunos em atividades'
      },
      {
        name: 'Health',
        description: 'Verificação de saúde da API'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT obtido no login'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do usuário',
              example: '507f1f77bcf86cd799439011'
            },
            nome: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao.silva@escola.com'
            },
            tipo: {
              type: 'string',
              enum: ['professor', 'aluno'],
              description: 'Tipo de usuário',
              example: 'professor'
            },
            criadoEm: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do usuário'
            }
          }
        },
        Atividade: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único da atividade',
              example: '507f1f77bcf86cd799439011'
            },
            titulo: {
              type: 'string',
              description: 'Título da atividade',
              example: 'Equações de Segundo Grau'
            },
            descricao: {
              type: 'string',
              description: 'Descrição detalhada da atividade',
              example: 'Exercícios práticos sobre equações quadráticas'
            },
            disciplina: {
              type: 'string',
              description: 'Disciplina da atividade',
              example: 'Matemática'
            },
            serie: {
              type: 'string',
              description: 'Série/Ano escolar',
              example: '9º ano'
            },
            objetivo: {
              type: 'string',
              description: 'Objetivo pedagógico da atividade',
              example: 'Desenvolver habilidades de resolução de equações'
            },
            materiaisApoio: {
              type: 'array',
              description: 'Lista de materiais de apoio',
              items: {
                type: 'object',
                properties: {
                  tipo: {
                    type: 'string',
                    example: 'pdf'
                  },
                  conteudo: {
                    type: 'string',
                    example: 'https://exemplo.com/material.pdf'
                  }
                }
              }
            },
            status: {
              type: 'string',
              enum: ['rascunho', 'publicada'],
              description: 'Status da atividade',
              example: 'publicada'
            },
            professorId: {
              type: 'string',
              description: 'ID do professor que criou a atividade',
              example: '507f1f77bcf86cd799439011'
            },
            isPublica: {
              type: 'boolean',
              description: 'Se a atividade é pública',
              example: true
            },
            inscricoes: {
              type: 'array',
              description: 'Lista de alunos inscritos na atividade',
              items: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011'
                  },
                  alunoEmail: {
                    type: 'string',
                    format: 'email',
                    example: 'aluno@email.com'
                  },
                  inscritoEm: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            },
            dataEntrega: {
              type: 'string',
              format: 'date-time',
              description: 'Data de entrega da atividade'
            },
            criadoEm: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            atualizadoEm: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            erro: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Erro ao processar requisição'
            },
            detalhes: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Detalhes adicionais do erro'
            }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'Token não fornecido ou inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Token não fornecido.'
              }
            }
          }
        },
        Forbidden: {
          description: 'Acesso negado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Você não tem permissão para acessar este recurso.'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Recurso não encontrado.'
              }
            }
          }
        },
        BadRequest: {
          description: 'Requisição inválida',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Dados inválidos',
                detalhes: ['Email é obrigatório', 'Senha deve ter no mínimo 6 caracteres']
              }
            }
          }
        },
        InternalError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                erro: 'Erro interno do servidor'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/presentation/routes/*.js', './src/presentation/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
