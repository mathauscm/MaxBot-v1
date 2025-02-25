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

/**
 * Inicializa o cliente WhatsApp Web
 * 
 * Este método configura e inicializa o cliente WhatsApp, configurando:
 * - Estratégia de autenticação local
 * - Configurações do Puppeteer
 * - Manipuladores de eventos para QR Code, conexão, mensagens e eventos de grupo
 * 
 * @async
 * @function initWhatsAppClient
 * @returns {Promise<Client>} Instância do cliente WhatsApp
 * @throws {Error} Erro durante a inicialização dos serviços ou do cliente
 */
async function initWhatsAppClient() {
    // Inicializa os serviços
    try {
        await classifierData.initialize();
        await mentionHandler.initialize();
        console.log('Serviços inicializados com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar serviços:', error);
    }

    /**
     * Configuração do cliente WhatsApp
     * @type {Client}
     */
    const client = new Client({
        /** Estratégia de autenticação local para persistência de sessão */
        authStrategy: new LocalAuth(),
        
        /** Configurações do Puppeteer para controle do navegador */
        puppeteer: {
            /** Executa o navegador sem interface gráfica */
            headless: false,
            
            /** Caminho para o executável do Chrome */
            executablePath: getChromePath(),
            
            /** Argumentos de inicialização do navegador */
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

    /**
     * Evento de geração de QR Code para autenticação
     * Gera uma URL de QR Code e notifica o controlador do bot
     */
    client.on('qr', async (qr) => {
        const qrCodeUrl = await qrcode.toDataURL(qr)
        console.log(`QR Code Gerado. Acesse http://localhost:3000 para escanear.`)
        botController.setQrCodeUrl(qrCodeUrl)
    })

    /**
     * Evento disparado quando o cliente está totalmente conectado
     */
    client.on('ready', () => {
        console.log('Cliente está TOTALMENTE pronto e conectado!')
        console.log('Bot já pode interagir no grupo.')
    })

    /**
     * Manipulador principal de mensagens
     * Processa mensagens recebidas, incluindo:
     * - Extração de payload
     * - Tratamento de menções
     * - Classificação de mensagens
     */
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

    // Registra manipuladores adicionais do controlador do bot
    client.on('message', botController.handleMessage)
    client.on('group_join', botController.handleGroupJoin)
    client.on('group_leave', botController.handleGroupLeave)

    // Inicializa o cliente
    client.initialize()
    return client
}

/**
 * Módulo de inicialização do cliente WhatsApp
 * @module WhatsAppClientInitialization
 */
module.exports = { initWhatsAppClient }