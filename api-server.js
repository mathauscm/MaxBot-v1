/**
 * @fileoverview Servidor principal Express que configura a API e a documentação Swagger.
 * @module server
 * @requires express
 * @requires swagger-ui-express
 * @requires ./src/config/swaggerConfig
 * @requires ./src/routes/apiRoutes
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swaggerConfig');
const apiRoutes = require('./src/routes/apiRoutes');

/**
 * Aplicação Express principal.
 * @type {import('express').Application}
 */
const app = express();

/**
 * Porta na qual o servidor irá escutar.
 * @type {number}
 */
const port = 3001;

// Middleware para processar JSON
app.use(express.json());

/**
 * Configura a rota para a documentação Swagger.
 * Disponível em /api-docs.
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Inicializa todas as rotas da API com o prefixo /api.
 */
app.use('/api', apiRoutes);

/**
 * Rota raiz para verificar o status da API.
 * @name GET /
 * @function
 * @memberof module:server
 * @param {import('express').Request} req - Objeto de requisição Express.
 * @param {import('express').Response} res - Objeto de resposta Express.
 * @returns {Object} Objeto JSON com informações de status da API.
 */
app.get('/', (req, res) => {
    res.json({
        status: 'API online',
        swagger: 'Visite /api-docs para documentação'
    });
});

/**
 * Inicia o servidor Express na porta configurada.
 * Exibe mensagens no console confirmando que o servidor está em execução.
 * @listens {port}
 */
app.listen(port, () => {
    console.log(`Servidor API rodando em http://localhost:${port}`);
    console.log(`Documentação Swagger disponível em http://localhost:${port}/api-docs`);
});