const express = require('express');
const router = express.Router();
const { processarConversa, classificarMensagem } = require('../controllers/apiController');

/**
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
 */
router.post('/processar_conversa', processarConversa);

/**
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
 */
router.post('/classificar_mensagem', classificarMensagem);

module.exports = router;

