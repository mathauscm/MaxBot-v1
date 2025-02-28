/**
 * @fileoverview Servidor principal Express para a interface web do cliente WhatsApp.
 * @module whatsapp-server
 * @requires express
 * @requires ./src/config/whatsappConfig
 * @requires ./src/routes/webRoutes
 */

const express = require('express');
const { initWhatsAppClient } = require('./src/config/whatsappConfig');
const webRoutes = require('./src/routes/webRoutes');

/**
 * Aplicação Express para o servidor WhatsApp.
 * @type {import('express').Application}
 */
const app = express();

/**
 * Porta na qual o servidor WhatsApp irá escutar.
 * @type {number}
 */
const port = 3000;

/**
 * Inicializa todas as rotas web com o prefixo /.
 */
app.use('/', webRoutes);

/**
 * Inicializa o cliente WhatsApp.
 * @type {Object} O cliente WhatsApp inicializado.
 */
const client = initWhatsAppClient();

/**
 * Inicia o servidor Express na porta configurada.
 * Exibe mensagem no console confirmando que o servidor está em execução.
 * @listens {port}
 */
app.listen(port, () => {
    console.log(`Servidor WhatsApp rodando em http://localhost:${port}`);
});