const fs = require('fs');
const path = require('path');
let qrCodeUrl = null

function setQrCodeUrl(url) {
    qrCodeUrl = url
}

function getQrCodeUrl() {
    return qrCodeUrl
}

async function getUserHistory(nomeRemetente) {
    try {
        // Lê o arquivo JSON do histórico - Caminho corrigido
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

        // Filtrar mensagens relevantes
        const userMessages = messages.filter(msg => {
            // Verifica se é uma mensagem válida
            if (!msg || !msg.message || !msg.message.body) return false;
            
            // Verifica se tem sender e se é um objeto
            if (!msg.sender) return false;
            
            // Se o sender for um objeto com propriedade name
            if (typeof msg.sender === 'object' && msg.sender.name) {
                return msg.sender.name.toLowerCase().includes(nomeRemetente.toLowerCase());
            }
            
            // Se o sender for uma string
            if (typeof msg.sender === 'string') {
                return msg.sender.toLowerCase().includes(nomeRemetente.toLowerCase());
            }
            
            return false;
        });

        console.log("Mensagens encontradas para", nomeRemetente, ":", userMessages.length);

        // Se não encontrou, tenta de outra forma (pela propriedade message)
        if (userMessages.length === 0) {
            const alternativeMessages = messages.filter(msg => {
                // Se o formato incluir diretamente a mensagem com remetente
                if (msg && msg.message && msg.message.sender) {
                    return String(msg.message.sender).toLowerCase().includes(nomeRemetente.toLowerCase());
                }
                return false;
            });
            
            if (alternativeMessages.length > 0) {
                console.log("Encontradas mensagens pelo formato alternativo:", alternativeMessages.length);
                return formatMessages(alternativeMessages, nomeRemetente);
            }
            
            // Se ainda não encontrou, talvez o remetente esteja na raiz
            const rootMessages = messages.filter(msg => {
                return msg && msg.body && nomeRemetente;
            });
            
            if (rootMessages.length > 0) {
                console.log("Encontradas mensagens no formato raiz:", rootMessages.length);
                return formatMessages(rootMessages, nomeRemetente);
            }
            
            // Se ainda não encontrou, retorna todas as mensagens
            console.log("Retornando todas as mensagens como último recurso");
            return formatMessages(messages.slice(-10), nomeRemetente);
        }

        return formatMessages(userMessages, nomeRemetente);
    } catch (error) {
        console.error('Erro ao ler o histórico:', error);
        return '❌ Não foi possível recuperar o histórico de mensagens.';
    }
}

// Função para formatar mensagens
function formatMessages(messages, nomeRemetente) {
    if (!messages || messages.length === 0) {
        return `Nenhuma mensagem encontrada para ${nomeRemetente}`;
    }
    
    // Limita o número de mensagens para evitar mensagens muito longas
    const limitedMessages = messages.slice(-10); // Mostra apenas as últimas 10 mensagens
    
    // Formata as mensagens encontradas
    const messageHistory = limitedMessages
        .map(msg => {
            let body = '';
            let timestamp = new Date();
            
            // Tenta extrair o corpo da mensagem
            if (msg.message && msg.message.body) {
                body = msg.message.body;
            } else if (msg.body) {
                body = msg.body;
            }
            
            // Tenta extrair o timestamp
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
        // console.log(`Chat ID: ${chat.id._serialized}`)
        // console.log(`Nome do Grupo: ${chat.name}`)
        console.log(`Remetente: ${contact.name || contact.pushname || contact.number}`)
        // console.log(`Número: ${contact.number}`)
        console.log(`Mensagem: ${message.body}`)
        console.log(`Data e Hora de Envio: ${dataFormatada}`)
        // console.log(`Timestamp Unix: ${message.timestamp}`)

       // Verificação do grupo 
        if (chat.name === 'Group-MaxBot-v1') {
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
                    console.log("Conteúdo do histórico:", historico.substring(0, 200) + "...");
                    
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

// Eventos de entrada e saída no grupo
async function handleGroupJoin(notification) {
    const chat = await notification.getChat()
    const contact = await notification.getContact()

    if (chat.name === 'Group-MaxBot-v1') {
        const nomeRemetente = contact.name || contact.pushname || 'Novo Membro'
        console.log('Alguém entrou no grupo:', nomeRemetente)

        await chat.sendMessage(`Bem-vindo(a) ao grupo, ${nomeRemetente}!`)
    }
}

async function handleGroupLeave(notification) {
    const chat = await notification.getChat()
    const contact = await notification.getContact()

    if (chat.name === 'Group-MaxBot-v1') {
        const nomeRemetente = contact.name || contact.pushname || 'Membro'
        console.log('Alguém saiu do grupo:', nomeRemetente)

        await chat.sendMessage(`Até logo, ${nomeRemetente}!`)
    }
}

module.exports = {
    setQrCodeUrl,
    getQrCodeUrl,
    handleMessage,
    handleGroupJoin,
    handleGroupLeave
}