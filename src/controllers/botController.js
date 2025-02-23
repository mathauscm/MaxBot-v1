let qrCodeUrl = null

function setQrCodeUrl(url) {
    qrCodeUrl = url
}

function getQrCodeUrl() {
    return qrCodeUrl
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
                    '!msginfo - Mostra informações da mensagem'
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