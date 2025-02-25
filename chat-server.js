/**
 * @fileoverview Servidor Express para a interface de chat do MaxBot.
 * Fornece uma interface web simples para interação com o bot e processa as mensagens dos usuários.
 * @module chat-server
 * @requires express
 * @requires path
 * @requires dotenv
 * @requires ./src/services/mentionHandlerService
 */

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mentionHandler = require('./src/services/mentionHandlerService');

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Aplicação Express para o servidor de chat.
 * @type {import('express').Application}
 */
const app = express();

/**
 * Porta na qual o servidor de chat irá escutar, definida via variável de ambiente ou 5000 como padrão.
 * @type {number}
 */
const port = process.env.CHAT_PORT || 5000;

// Configurar body parser para JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Rota principal que serve a interface de chat em HTML/CSS/JavaScript.
 * @name GET /
 * @function
 * @memberof module:chat-server
 * @param {import('express').Request} req - Objeto de requisição Express.
 * @param {import('express').Response} res - Objeto de resposta Express.
 * @returns {void} Envia a página HTML ao cliente.
 */
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MaxBot Chat</title>
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
            }
            
            body {
                background-color: #343541;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            
            #chat-container {
                width: 90%;           /* Aumentado para usar 90% da largura disponível */
                max-width: 900px;     /* Aumentado de 600px para 900px */
                background-color: #40414F;
                border-radius: 10px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                height: 95vh;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            }
            
            #chat-history {
                flex-grow: 1;
                overflow-y: auto;
                padding: 15px;
                display: flex;
                flex-direction: column;
            }
            
            .message-container {
                display: flex;
                margin-bottom: 10px;
            }
            
            .message {
                max-width: 85%;       /* Aumentado de 75% para 85% */
                padding: 12px;
                border-radius: 8px;
                word-wrap: break-word;
                display: inline-block;
            }
            
            .user-message {
                background-color: #007bff;
                color: white;
                align-self: flex-end;
            }
            
            .assistant-message {
                background-color: #50525E;
                color: white;
                align-self: flex-start;
                white-space: pre-line;  /* Preserva quebras de linha */
                line-height: 1.5;       /* Melhor espaçamento entre linhas */
            }
            
            /* Formatação para listas */
            .restaurant-item {
                margin-bottom: 20px;
                padding: 12px 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                background-color: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                transition: background-color 0.2s;
            }
            
            .restaurant-item:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            .restaurant-item:last-child {
                border-bottom: none;
            }
            
            .restaurant-name {
                font-weight: bold;
                margin-bottom: 8px;
                font-size: 1.05em;
                color: #b3e5fc;
            }
            
            .restaurant-item div {
                margin-bottom: 5px;
            }
            
            #input-container {
                display: flex;
                padding: 10px;
                background-color: #40414F;
                border-top: 1px solid #525252;
            }
            
            #message-input {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 5px;
                outline: none;
                background-color: #50525E;
                color: white;
            }
            
            button {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 12px 20px;
                margin-left: 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }
            
            button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div id="chat-container">
            <div id="chat-history"></div>
            <div id="input-container">
                <input 
                    type="text" 
                    id="message-input" 
                    placeholder="Digite sua mensagem..." 
                    autofocus
                >
                <button onclick="sendMessage()">Enviar</button>
            </div>
        </div>
        
        <script>
            // Identificador único da conversa
            const conversationId = 'conv-' + Date.now();
            
            // Elementos do DOM
            const chatHistory = document.getElementById('chat-history');
            const messageInput = document.getElementById('message-input');
            
            // Adiciona mensagem de boas-vindas ao iniciar
            window.addEventListener('DOMContentLoaded', () => {
                appendMessage('assistant', 'Olá! Bem-vindo ao chat do MaxBot 🤖. Como posso ajudar?');
            });
            
            // Envia uma mensagem para o servidor
            async function sendMessage() {
                // Obtém e valida a mensagem
                const message = messageInput.value.trim();
                if (!message) return;
                
                // Exibe mensagem do usuário
                appendMessage('user', message);
                messageInput.value = '';
                
                try {
                    // Adiciona indicador de digitação
                    const typingIndicator = showTypingIndicator();
                    
                    // Envia mensagem para o servidor
                    const response = await fetch('/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message, conversationId })
                    });
                    
                    // Remove indicador de digitação
                    removeTypingIndicator(typingIndicator);
                    
                    // Processa e exibe resposta
                    const data = await response.json();
                    
                    if (data.error) {
                        appendMessage('assistant', 'Erro: ' + data.error);
                    } else {
                        appendFormattedMessage('assistant', data.response);
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    appendMessage('assistant', 'Desculpe, ocorreu um erro ao processar sua mensagem.');
                }
            }
            
            // Adiciona uma mensagem ao histórico do chat
            function appendMessage(role, content) {
                // Cria container da mensagem
                const messageContainer = document.createElement('div');
                messageContainer.classList.add('message-container');
                messageContainer.style.justifyContent = role === 'user' ? 'flex-end' : 'flex-start';
                
                // Cria elemento da mensagem
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message ' + role + '-message';
                messageDiv.textContent = content;
                
                // Adiciona ao DOM e rola para o final
                messageContainer.appendChild(messageDiv);
                chatHistory.appendChild(messageContainer);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }
            
            // Adiciona uma mensagem formatada ao histórico do chat
            function appendFormattedMessage(role, content) {
                // Cria container da mensagem
                const messageContainer = document.createElement('div');
                messageContainer.classList.add('message-container');
                messageContainer.style.justifyContent = role === 'user' ? 'flex-end' : 'flex-start';
                
                // Cria elemento da mensagem
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message ' + role + '-message';
                
                // Formata conteúdo específico
                const formattedContent = formatMessageContent(content);
                messageDiv.innerHTML = formattedContent;
                
                // Adiciona ao DOM e rola para o final
                messageContainer.appendChild(messageDiv);
                chatHistory.appendChild(messageContainer);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }
            
            // Formata o conteúdo da mensagem para casos específicos
            function formatMessageContent(content) {
                // Detecta padrões de restaurantes
                if (content.includes('Encontrei estas opções para você')) {
                    return formatRestaurantList(content);
                }
                
                // Para texto comum, preserva quebras de linha e evita tags HTML
                return escapeHtml(content).replace(/\\n/g, '<br>');
            }
            
            // Formata lista de restaurantes
            function formatRestaurantList(content) {
                // Verifica se é uma lista de restaurantes
                if (!content.includes('Endereço:')) {
                    return escapeHtml(content);
                }
                
                // Divide em introdução e lista
                const parts = content.split(':');
                const intro = parts[0] + ':';
                
                // Extrai os restaurantes
                const regex = /(\\d+\\. [^\\d]+)(Endereço:[^\\d]+)(Avaliação:[^\\d]+)(Status:[^\\d]+)/g;
                let match;
                let restaurantHtml = '';
                let remainingText = content.substring(intro.length).trim();
                
                while ((match = regex.exec(remainingText)) !== null) {
                    const [fullMatch, name, address, rating, status] = match;
                    restaurantHtml += \`
                    <div class="restaurant-item">
                        <div class="restaurant-name">\${escapeHtml(name.trim())}</div>
                        <div>\${escapeHtml(address.trim())}</div>
                        <div>\${escapeHtml(rating.trim())}</div>
                        <div>\${escapeHtml(status.trim())}</div>
                    </div>\`;
                }
                
                // Se não conseguiu extrair os dados no formato esperado
                if (!restaurantHtml) {
                    // Tenta uma abordagem mais simples com quebras de linha
                    const items = remainingText.split(/(?=\\d+\\.)/);
                    restaurantHtml = items.map(item => {
                        return \`<div class="restaurant-item">\${escapeHtml(item).replace(/\\n/g, '<br>')}</div>\`;
                    }).join('');
                }
                
                return escapeHtml(intro) + restaurantHtml || escapeHtml(content).replace(/\\n/g, '<br>');
            }
            
            // Escapa HTML para prevenir XSS
            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
            
            // Exibe um indicador de digitação no chat
            function showTypingIndicator() {
                const container = document.createElement('div');
                container.classList.add('message-container');
                container.style.justifyContent = 'flex-start';
                container.id = 'typing-indicator-container';
                
                const indicator = document.createElement('div');
                indicator.className = 'message assistant-message';
                indicator.id = 'typing-indicator';
                indicator.innerHTML = '<span>.</span><span>.</span><span>.</span>';
                
                // Adiciona animação de digitação
                const style = document.createElement('style');
                style.textContent = \`
                    #typing-indicator span {
                        opacity: 0;
                        animation: typingAnimation 1.5s infinite;
                    }
                    #typing-indicator span:nth-child(2) {
                        animation-delay: 0.5s;
                    }
                    #typing-indicator span:nth-child(3) {
                        animation-delay: 1s;
                    }
                    @keyframes typingAnimation {
                        0% { opacity: 0; }
                        50% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                \`;
                document.head.appendChild(style);
                
                container.appendChild(indicator);
                chatHistory.appendChild(container);
                chatHistory.scrollTop = chatHistory.scrollHeight;
                
                return container;
            }
            
            // Remove o indicador de digitação
            function removeTypingIndicator(indicator) {
                if (indicator && indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }
            
            // Event Listeners
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
            
            // Foca no campo de input quando a página carrega
            window.addEventListener('load', () => {
                messageInput.focus();
            });
        </script>
    </body>
    </html>
    `);
});

/**
 * Rota para processar mensagens enviadas pelo cliente.
 * Recebe a mensagem do usuário, adiciona o prefixo @MaxBot e processa usando o serviço de menções.
 * @name POST /chat
 * @function
 * @memberof module:chat-server
 * @param {import('express').Request} req - Objeto de requisição Express.
 * @param {import('express').Response} res - Objeto de resposta Express.
 * @returns {Promise<void>} Retorna resposta em formato JSON.
 */
app.post('/chat', async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Mensagem não pode estar vazia' });
        }

        console.log(`ChatServer: Mensagem recebida (${conversationId}): ${message}`);
        
        // Processa a mensagem como se fosse uma menção direta ao bot
        const processedMessage = `@MaxBot ${message}`;
        
        // Processa a mensagem usando o handler
        let response = await mentionHandler.processMessage(processedMessage);
        
        // Resposta padrão se o handler não retornar nada
        if (!response) {
            response = "Desculpe, não consegui processar sua mensagem.";
        }
        
        // Formata a resposta com quebras de linha para melhor legibilidade
        const formattedResponse = formatResponse(response);
        
        // Adiciona delay para simular processamento (opcional)
        setTimeout(() => {
            res.json({ 
                response: formattedResponse,
                conversationId
            });
        }, 300);
        
    } catch (error) {
        console.error('ChatServer: Erro ao processar mensagem:', error);
        res.status(500).json({ error: 'Erro interno ao processar a mensagem', details: error.message });
    }
});

/**
 * Formata a resposta do bot para melhorar a legibilidade.
 * Aplica formatação especial para listas de restaurantes ou mantém o texto original.
 * @function formatResponse
 * @param {string} text - Texto da resposta a ser formatado.
 * @returns {string} Texto formatado com quebras de linha adequadas.
 */
function formatResponse(text) {
    // Verifica se é uma lista de restaurantes
    if (text.includes('Encontrei estas opções para você')) {
        return formatRestaurantResponse(text);
    }
    
    return text;
}

/**
 * Formata especificamente respostas que contêm listas de restaurantes.
 * Adiciona quebras de linha para melhorar a legibilidade da lista.
 * @function formatRestaurantResponse
 * @param {string} text - Texto contendo lista de restaurantes.
 * @returns {string} Lista de restaurantes formatada com quebras de linha.
 */
function formatRestaurantResponse(text) {
    // Divide a introdução do restante
    const parts = text.split(/(?=\d+\.)/);
    
    if (parts.length <= 1) {
        return text; // Não parece ser uma lista
    }
    
    const intro = parts[0];
    const items = parts.slice(1);
    
    // Formata cada item com quebras de linha adequadas
    const formattedItems = items.map(item => {
        return item
            .replace(/Endereço:/, "\nEndereço:")
            .replace(/Avaliação:/, "\nAvaliação:")
            .replace(/Status:/, "\nStatus:");
    });
    
    // Junta tudo
    return intro + "\n\n" + formattedItems.join("\n\n");
}

/**
 * Inicializa o serviço de menções ao iniciar o servidor.
 * Função auto-executável que configura o handler de menções.
 * @function
 * @async
 */
(async () => {
    try {
        await mentionHandler.initialize();
        console.log('ChatServer: Serviço de menções inicializado com sucesso');
    } catch (error) {
        console.error('ChatServer: Erro ao inicializar serviço de menções:', error);
    }
})();

/**
 * Inicia o servidor HTTP na porta configurada.
 * @listens {port}
 */
app.listen(port, () => {
    console.log(`Chat web rodando em http://localhost:${port}`);
});

module.exports = app;