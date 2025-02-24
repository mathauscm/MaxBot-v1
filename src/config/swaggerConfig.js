const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MaxBot 🤖',
      version: '1.0.0',
      description: 'API para processamento de conversas e classificação de mensagens',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Caminho para os arquivos de rotas
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;