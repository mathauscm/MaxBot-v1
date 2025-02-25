const express = require('express');
const router = express.Router();
const { processarConversa, classificarMensagem } = require('../controllers/apiController');

/**
 * Roteador para rotas de processamento de conversas e classificação de mensagens
 * 
 * Este módulo define duas rotas principais para a API:
 * 1. Processamento de conversas
 * 2. Classificação de mensagens
 * 
 * @module APIRoutes
 */

/**
 * Rota para processar uma conversa e gerar uma resposta
 * 
 * @openapi
 * /api/processar_conversa:
 *   post:
 *     summary: Processa uma conversa e responde a uma pergunta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversa:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     usuario:
 *                       type: string
 *                     mensagem:
 *                       type: string
 *                     hora_envio:
 *                       type: string
 *                       format: date-time
 *               pergunta:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resposta processada com sucesso
 * 
 * @route POST /api/processar_conversa
 * @param {Object} req.body - Objeto contendo a conversa e pergunta
 * @param {Array<Object>} req.body.conversa - Lista de mensagens da conversa
 * @param {string} req.body.pergunta - Pergunta a ser respondida
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Resposta processada da conversa
 */
router.post('/processar_conversa', processarConversa);

/**
 * Rota para classificar uma mensagem em uma categoria
 * 
 * @openapi
 * /api/classificar_mensagem:
 *   post:
 *     summary: Classifica uma mensagem em uma categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mensagem:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mensagem classificada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoria:
 *                   type: string
 *                 resposta:
 *                   type: string
 * 
 * @route POST /api/classificar_mensagem
 * @param {Object} req.body - Objeto contendo a mensagem a ser classificada
 * @param {string} req.body.mensagem - Texto da mensagem
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Categoria e resposta gerada para a mensagem
 */
router.post('/classificar_mensagem', classificarMensagem);

module.exports = router;