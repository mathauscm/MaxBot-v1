const fs = require('fs');
const path = require('path');

/** Armazena a URL do QR Code para conexão */
let qrCodeUrl = null;

/**
 * Define a URL do QR Code para conexão do WhatsApp
 * 
 * @function setQrCodeUrl
 * @param {string} url - URL do QR Code gerado
 */
function setQrCodeUrl(url) {
    qrCodeUrl = url;
}

/**
 * Recupera a URL do QR Code armazenada
 * 
 * @function getQrCodeUrl
 * @returns {string|null} URL do QR Code ou null se não estiver definida
 */
function getQrCodeUrl() {
    return qrCodeUrl;
}

/**
 * Recupera o histórico de mensagens de um usuário específico
 * 
 * Busca e formata mensagens de um arquivo JSON de histórico geral,
 * com múltiplas estratégias de busca para encontrar mensagens do usuário
 * 
 * @async
 * @function getUserHistory
 * @param {string} nomeRemetente - Nome do remetente para busca no histórico
 * @returns {Promise<string>} Histórico formatado de mensagens do usuário
 */
async function getUserHistory(nomeRemetente) {
    try {
        // Lê o arquivo JSON do histórico
        const filePath = path.join(__dirname, '..', 'db', 'data', 'general_history.json');
        
        // Verifica se o arquivo existe
        if (!fs.existsSync(filePath)) {
            console.log('Arquivo de histórico não encontrado:', filePath);
            return `Nenhum histórico encontrado. O arquivo não existe.`;
        }
        
        const rawData = await fs.promises.readFile(filePath, 'utf8');
        console.log("Lendo arquivo JSON:", filePath);
        
        const messages = JSON.parse(rawData);
        console.log("Total de mensagens no arquivo:", messages.length);

        // Filtra mensagens do usuário
        const userMessages = messages.filter(msg => {
            // Validações para encontrar mensagens do usuário
            if (!msg || !msg.message || !msg.message.body) return false;
            
            if (!msg.sender) return false;
            
            // Verifica diferentes formatos de sender
            if (typeof msg.sender === 'object' && msg.sender.name) {
                return msg.sender.name.toLowerCase().includes(nomeRemetente.toLowerCase());
            }
            
            if (typeof msg.sender === 'string') {
                return msg.sender.toLowerCase().includes(nomeRemetente.toLowerCase());
            }
            
            return false;
        });

        console.log("Mensagens encontradas para", nomeRemetente, ":", userMessages.length);

        // Estratégias alternativas de busca se nenhuma mensagem for encontrada
        if (userMessages.length === 0) {
            const alternativeMessages = messages.filter(msg => {
                if (msg && msg.message && msg.message.sender) {
                    return String(msg.message.sender).toLowerCase().includes(nomeRemetente.toLowerCase());
                }
                return false;
            });
            
            if (alternativeMessages.length > 0) {
                console.log("Encontradas mensagens pelo formato alternativo:", alternativeMessages.length);
                return formatMessages(alternativeMessages, nomeRemetente);
            }
            
            // Último recurso: busca em formato de mensagem raiz
            const rootMessages = messages.filter(msg => {
                return msg && msg.body && nomeRemetente;
            });
            
            if (rootMessages.length > 0) {
                console.log("Encontradas mensagens no formato raiz:", rootMessages.length);
                return formatMessages(rootMessages, nomeRemetente);
            }
            
            // Se ainda não encontrou, retorna as últimas 10 mensagens
            console.log("Retornando todas as mensagens como último recurso");
            return formatMessages(messages.slice(-10), nomeRemetente);
        }

        return formatMessages(userMessages, nomeRemetente);
    } catch (error) {
        console.error('Erro ao ler o histórico:', error);
        return '❌ Não foi possível recuperar o histórico de mensagens.';
    }
}

/**
 * Formata mensagens em um formato legível
 * 
 * @function formatMessages
 * @param {Array} messages - Lista de mensagens para formatar
 * @param {string} nomeRemetente - Nome do remetente para cabeçalho
 * @returns {string} Mensagens formatadas em texto
 */
function formatMessages(messages, nomeRemetente) {
    if (!messages || messages.length === 0) {
        return `Nenhuma mensagem encontrada para ${nomeRemetente}`;
    }
    
    // Limita o número de mensagens
    const limitedMessages = messages.slice(-10);
    
    // Formata as mensagens encontradas
    const messageHistory = limitedMessages
        .map(msg => {
            let body = '';
            let timestamp = new Date();
            
            // Extração do corpo da mensagem
            if (msg.message && msg.message.body) {
                body = msg.message.body;
            } else if (msg.body) {
                body = msg.body;
            }
            
            // Extração do timestamp
            if (msg.message && msg.message.timestamp) {
                timestamp = new Date(msg.message.timestamp * 1000);
            } else if (msg.timestamp) {
                timestamp = new Date(msg.timestamp * 1000);
            }
            
            const data = timestamp.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `📅 ${data}\n💬 ${body || 'Sem conteúdo'}`;
        })
        .join('\n\n');
    
    return `📋 *Histórico de mensagens de ${nomeRemetente}*\n\n${messageHistory}`;
}

/**
 * Manipula mensagens recebidas no grupo específico
 * 
 * Processa comandos do bot e registra informações da mensagem
 * 
 * @async
 * @function handleMessage
 * @param {Object} message - Objeto de mensagem do WhatsApp
 * @throws {Error} Erro durante o processamento da mensagem
 */
async function handleMessage(message) {
    try {
        const chat = await message.getChat()
        const contact = await message.getContact()

        const dataEnvio = new Date(message.timestamp * 1000)
        const dataFormatada = dataEnvio.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })

        // Log detalhado para debug
        console.log('Mensagem recebida:')
        console.log(`Remetente: ${contact.name || contact.pushname || contact.number}`)
        console.log(`Mensagem: ${message.body}`)
        console.log(`Data e Hora de Envio: ${dataFormatada}`)

       // Verificação do grupo 
        if (chat.name === 'Group-MyBot-v1') {
            // Variáveis para nome do remetente
            const nomeRemetente = contact.name || contact.pushname || 'Usuário'
            
            // Comandos do bot
            if (message.body.toLowerCase().includes('!ping')) {
                await message.reply(`Pong! 🏓 (Respondendo para ${nomeRemetente})`)
            }
            if (message.body.toLowerCase().includes('!help')) {
                await message.reply(
                    `Olá ${nomeRemetente}! Comandos disponíveis:\n` +
                    '!ping - Responde com Pong\n' +
                    '!hora - Mostra a hora atual\n' +
                    '!dados - Mostra informações básicas do grupo\n' +
                    '!meusdados - Mostra suas informações\n' +
                    '!msginfo - Mostra informações da mensagem\n' +
                    '!meuhistorico - Mostra Historico do usuário'
                )
            }

            if (message.body.toLowerCase().includes('!hora')) {
                const dataAtual = new Date()
                await message.reply(`Hora atual: ${dataAtual.toLocaleTimeString()}`)
            }

            if (message.body.toLowerCase().includes('!dados')) {
                await message.reply(
                    `Informações do Grupo:\n` +
                    `Nome: ${chat.name}\n` +
                    `Participantes: ${chat.participants ? chat.participants.length : 'Desconhecido'}`
                )
            }

            if (message.body.toLowerCase().includes('!meusdados')) {
                await message.reply(
                    `Seus Dados:\n` +
                    `Nome: ${nomeRemetente}\n` +
                    `Número: ${contact.number}\n` +
                    `ID: ${contact.id.user}`
                )
            }

            if (message.body.toLowerCase().includes('!msginfo')) {
                await message.reply(
                    `Informações da Mensagem:\n` +
                    `Remetente: ${nomeRemetente}\n` +
                    `Data de Envio: ${dataFormatada}\n` +
                    `Timestamp: ${message.timestamp}\n` +
                    `Tipo de Mensagem: ${message.type}\n` +
                    `ID da Mensagem: ${message.id._serialized}`
                )
            }
            if (message.body.toLowerCase().includes('!meuhistorico')) {
                try {
                    console.log("Buscando histórico para:", nomeRemetente);
                    const historico = await getUserHistory(nomeRemetente);
                    console.log("Histórico obtido, tamanho:", historico.length);
                    
                    // Divide a mensagem em partes menores se for muito grande
                    const maxLength = 1000; // Tamanho máximo de cada mensagem
                    
                    if (historico.length <= maxLength) {
                        await message.reply(historico);
                        console.log("Histórico enviado em uma única mensagem");
                    } else {
                        // Divide a mensagem em partes
                        const parts = historico.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [];
                        console.log(`Dividindo histórico em ${parts.length} partes`);
                        
                        for (let i = 0; i < parts.length; i++) {
                            console.log(`Enviando parte ${i+1} de ${parts.length}`);
                            await message.reply(parts[i]);
                            // Pequeno delay entre as mensagens para evitar flood
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                        console.log("Todas as partes do histórico foram enviadas");
                    }
                } catch (error) {
                    console.error('Erro ao enviar histórico:', error);
                    await message.reply('❌ Desculpe, ocorreu um erro ao buscar seu histórico.');
                }
            }
        }
    } catch (error) {
        console.error('Erro ao processar mensagem:', error)
    }
}

/**
 * Manipula eventos de entrada no grupo
 * 
 * Envia uma mensagem de boas-vindas quando um novo membro entra
 * 
 * @async
 * @function handleGroupJoin
 * @param {Object} notification - Objeto de notificação de entrada no grupo
 */
async function handleGroupJoin(notification) {
    const chat = await notification.getChat()
    const contact = await notification.getContact()

    if (chat.name === 'Group-MyBot-v1') {
        const nomeRemetente = contact.name || contact.pushname || 'Novo Membro'
        console.log('Alguém entrou no grupo:', nomeRemetente)

        await chat.sendMessage(`Bem-vindo(a) ao grupo, ${nomeRemetente}!`)
    }
}

/**
 * Manipula eventos de saída do grupo
 * 
 * Envia uma mensagem de despedida quando um membro sai
 * 
 * @async
 * @function handleGroupLeave
 * @param {Object} notification - Objeto de notificação de saída do grupo
 */
async function handleGroupLeave(notification) {
    const chat = await notification.getChat()
    const contact = await notification.getContact()

    if (chat.name === 'Group-MyBot-v1') {
        const nomeRemetente = contact.name || contact.pushname || 'Membro'
        console.log('Alguém saiu do grupo:', nomeRemetente)

        await chat.sendMessage(`Até logo, ${nomeRemetente}!`)
    }
}

/**
 * Módulo de controlador do bot WhatsApp
 * @module BotController
 */
module.exports = {
    setQrCodeUrl,
    getQrCodeUrl,
    handleMessage,
    handleGroupJoin,
    handleGroupLeave
};