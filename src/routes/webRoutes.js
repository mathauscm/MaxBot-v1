const express = require('express')
const botController = require('../controllers/botController')

const router = express.Router()

router.get('/', (req, res) => {
    const qrCodeUrl = botController.getQrCodeUrl()
    
    if (qrCodeUrl) {
        res.send(`
            <html>
            <body>
                <h1>Escaneie o QR Code com o WhatsApp</h1>
                <img src='${qrCodeUrl}' alt='QR Code'>
                <p>Abra o WhatsApp, vá em Dispositivos Conectados e escaneie o QR Code</p>
            </body>
            </html>
        `);
    } else {
        res.send('<h1>QR Code ainda não está pronto. Tente novamente em alguns segundos...</h1>');
    }
})

module.exports = router