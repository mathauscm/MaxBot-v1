const fs = require('fs').promises;
const path = require('path');

async function extractMessagePayload(message) {
    try {
        // Lança um erro se a mensagem contiver mídia
        if (message.hasMedia) {
            throw new Error('Mensagem contém mídia. Download não permitido.');
        }

        const chat = await message.getChat();
        const contact = await message.getContact();
        
        // Formata a data
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

        // Caminho do arquivo JSON
        const filePath = path.join(__dirname, '../db/data/general_history.json');
        
        // Certifica-se que o diretório existe
        const dirPath = path.dirname(filePath);
        await fs.mkdir(dirPath, { recursive: true });

        // Inicializa o array de dados
        let existingData = [];

        try {
            // Tenta ler o arquivo existente
            const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
            
            if (fileExists) {
                const fileContent = await fs.readFile(filePath, 'utf8');
                // Verifica se o conteúdo não está vazio
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

        // Adiciona o novo payload
        existingData.push(messagePayload);

        // Salva o arquivo
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

module.exports = extractMessagePayload;