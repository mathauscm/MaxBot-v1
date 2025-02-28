const express = require('express')
const botController = require('../controllers/botController')

const router = express.Router()

/**
 * Roteador para renderização do QR Code de conexão do WhatsApp
 * 
 * Este módulo define uma rota que exibe o QR Code para autenticação do WhatsApp Web
 * 
 * @module QRCodeRoute
 */

/**
 * Rota raiz para exibição do QR Code de conexão
 * 
 * Recupera a URL do QR Code do controlador do bot e renderiza uma página HTML
 * com instruções de escaneamento. Se o QR Code não estiver pronto, exibe uma mensagem de espera.
 * 
 * @route GET /
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
router.get('/', (req, res) => {
    // Obtém a URL do QR Code do controlador do bot
    const qrCodeUrl = botController.getQrCodeUrl()
    
    if (qrCodeUrl) {
        // Renderiza página HTML com QR Code
        res.send(`
            <html>
            <head>
                <title>Conectar WhatsApp</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 20px;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    img {
                        max-width: 300px;
                        margin: 20px 0;
                        border: 1px solid #ccc;
                    }
                </style>
            </head>
            <body>
                <h1>Escaneie o QR Code com o WhatsApp</h1>
                <img src='${qrCodeUrl}' alt='QR Code de Conexão'>
                <p>Abra o WhatsApp, vá em Dispositivos Conectados e escaneie o QR Code</p>
                <p><strong>Nota:</strong> O QR Code expira em alguns minutos. Se não funcionar, atualize a página.</p>
            </body>
            </html>
        `);
    } else {
        // Página de carregamento se o QR Code não estiver pronto
        res.send(`
            <html>
            <head>
                <title>Carregando Conexão</title>
                <meta http-equiv="refresh" content="5">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 20px;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                </style>
            </head>
            <body>
                <h1>QR Code ainda não está pronto</h1>
                <p>Aguarde... A página será recarregada automaticamente em 5 segundos.</p>
                <p>Se o problema persistir, reinicie a aplicação.</p>
            </body>
            </html>
        `);
    }
})

/**
 * Exporta o roteador de QR Code para uso no aplicativo Express
 * @module QRCodeRoute
 */
module.exports = router