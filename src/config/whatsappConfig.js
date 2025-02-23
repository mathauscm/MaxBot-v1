const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode')
const { limparSessaoAntiga } = require('../utils/sessionUtils')
const { getChromePath } = require('../utils/systemUtils')
const botController = require('../controllers/botController')
const extractMessagePayload = require('../controllers/extractMessagePayload')
const classifierData = require('../controllers/classifierData')
const mentionHandler = require('../services/mentionHandlerService')

// Limpa a sessão antes de iniciar
limparSessaoAntiga();

async function initWhatsAppClient() {
    // Inicializa os serviços
    try {
        await classifierData.initialize();
        await mentionHandler.initialize();
        console.log('Serviços inicializados com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar serviços:', error);
    }

    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: false,
            executablePath: getChromePath(),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-extensions',
                '--disable-gpu',
                '--no-first-run'
            ]
        }
    });

    // Configurar eventos do cliente
    client.on('qr', async (qr) => {
        const qrCodeUrl = await qrcode.toDataURL(qr)
        console.log(`QR Code Gerado. Acesse http://localhost:3000 para escanear.`)
        botController.setQrCodeUrl(qrCodeUrl)
    })

    client.on('ready', () => {
        console.log('Cliente está TOTALMENTE pronto e conectado!')
        console.log('Bot já pode interagir no grupo.')
    })

    client.on('message', async (message) => {
        try {
            // Extrai o payload da mensagem
            const messagePayload = await extractMessagePayload(message);
            
            // Processa menções ao bot
            const response = await mentionHandler.processMessage(message.body);
            if (response) {
                await message.reply(response);
            }
            
            // Classifica e processa a mensagem
            if (messagePayload) {
                try {
                    await classifierData.processNewMessage(messagePayload);
                    console.log(`Mensagem classificada e salva com sucesso`);
                } catch (classificationError) {
                    console.error('Erro ao classificar mensagem:', classificationError);
                }
            }
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    })

    client.on('message', botController.handleMessage)
    client.on('group_join', botController.handleGroupJoin)
    client.on('group_leave', botController.handleGroupLeave)

    client.initialize()
    return client
}

module.exports = { initWhatsAppClient }