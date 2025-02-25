const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Configurações de especificação OpenAPI para documentação da API
 * @type {Object}
 * @constant
 */
const options = {
  /**
   * Definições principais da especificação OpenAPI
   * @type {Object}
   */
  definition: {
    /** Versão da especificação OpenAPI */
    openapi: '3.0.0',
    
    /** Informações gerais sobre a API */
    info: {
      /** Título da API */
      title: 'MaxBot 🤖',
      
      /** Versão atual da API */
      version: '1.0.0',
      
      /** Descrição resumida da API */
      description: 'API para processamento de conversas e classificação de mensagens',
    },
    
    /** Servidores disponíveis para a API */
    servers: [
      {
        /** URL do servidor de desenvolvimento local */
        url: 'http://localhost:3001',
      },
    ],
  },
  
  /** 
   * Caminho para os arquivos de rotas que serão processados pelo Swagger
   * @type {string[]}
   */
  apis: ['./src/routes/*.js'],
};

/**
 * Gera a especificação Swagger/OpenAPI baseada nas configurações
 * @type {Object}
 */
const swaggerSpec = swaggerJsdoc(options);

/** 
 * Exporta a especificação Swagger para ser usada na configuração da documentação da API
 * @module SwaggerSpecification
 */
module.exports = swaggerSpec;