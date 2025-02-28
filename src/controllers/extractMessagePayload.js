const fs = require('fs').promises;
const path = require('path');

/**
 * Extrai e salva informações detalhadas de uma mensagem do WhatsApp
 * 
 * Esta função processa uma mensagem, extraindo metadados importantes
 * e salvando em um arquivo de histórico geral
 * 
 * @async
 * @function extractMessagePayload
 * @param {Object} message - Objeto de mensagem do WhatsApp
 * @returns {Promise<Object>} Payload detalhado da mensagem
 * @throws {Error} Erro durante a extração ou salvamento do payload
 */
async function extractMessagePayload(message) {
    try {
        // Verifica se a mensagem contém mídia
        if (message.hasMedia) {
            throw new Error('Mensagem contém mídia. Download não permitido.');
        }

        // Obtém informações do chat e contato
        const chat = await message.getChat();
        const contact = await message.getContact();
        
        // Formata a data e hora da mensagem
        const messageDate = new Date(message.timestamp * 1000);
        
        const date = messageDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const time = messageDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Cria o payload detalhado da mensagem
        const messagePayload = {
            message: {
                id: message.id._serialized,
                body: message.body,
                type: message.type,
                timestamp: message.timestamp,
                date: date,
                time: time
            },
            sender: {
                name: contact.name || contact.pushname || 'Desconhecido',
                number: contact.number,
                userId: contact.id.user
            },
            chat: {
                id: chat.id._serialized,
                name: chat.name,
                isGroup: chat.isGroup,
                participantsCount: chat.participants ? chat.participants.length : 0
            }
        }

        // Caminho do arquivo de histórico geral
        const filePath = path.join(__dirname, '../db/data/general_history.json');
        
        // Cria o diretório se não existir
        const dirPath = path.dirname(filePath);
        await fs.mkdir(dirPath, { recursive: true });

        // Inicializa array de dados existentes
        let existingData = [];

        try {
            // Verifica e lê o arquivo existente
            const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
            
            if (fileExists) {
                const fileContent = await fs.readFile(filePath, 'utf8');
                // Processa o conteúdo do arquivo
                if (fileContent.trim()) {
                    try {
                        existingData = JSON.parse(fileContent);
                        if (!Array.isArray(existingData)) {
                            existingData = [];
                        }
                    } catch (parseError) {
                        console.warn('Arquivo JSON corrompido, iniciando novo array');
                        existingData = [];
                    }
                }
            }
        } catch (error) {
            console.warn('Erro ao ler arquivo existente, iniciando novo array');
        }

        // Adiciona o novo payload ao array existente
        existingData.push(messagePayload);

        // Salva o arquivo atualizado
        try {
            await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf8');
            console.log('Payload salvo com sucesso!');
        } catch (writeError) {
            console.error('Erro ao salvar o payload:', writeError);
            throw writeError;
        }

        return messagePayload;
    } catch (error) {
        console.error('Erro ao extrair payload da mensagem:', error);
        throw error;
    }
}

/**
 * Módulo de extração de payload de mensagem
 * @module MessagePayloadExtraction
 */
module.exports = extractMessagePayload;