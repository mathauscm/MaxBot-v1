const OpenAI = require('openai');

/**
 * Serviço para interação com a API da OpenAI
 * 
 * Fornece métodos estáticos para geração de respostas e análise de sentimento
 * utilizando o modelo de linguagem GPT
 * 
 * @class
 */
class OpenAIService {
    /**
     * Gera uma resposta para uma pergunta usando o modelo GPT
     * 
     * Método que utiliza o modelo GPT-3.5-Turbo para criar uma resposta contextualizada
     * 
     * @static
     * @async
     * @param {string} contexto - Contexto adicional para guiar a resposta
     * @param {string} pergunta - Pergunta ou solicitação do usuário
     * @returns {Promise<string>} Resposta gerada pela IA
     * @throws {Error} Erro durante a geração da resposta
     */
    static async gerarResposta(contexto, pergunta) {
        // Inicializa o cliente OpenAI com a chave de API
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        try {
            // Cria uma solicitação de completude de chat
            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo", // Modelo de linguagem utilizado
                messages: [
                    { 
                        role: "system", 
                        content: "Você é um assistente útil que fornece respostas precisas e concisas em português."
                    },
                    { 
                        role: "user", 
                        content: pergunta 
                    }
                ],
                temperature: 0.7, // Controla a aleatoriedade da resposta
                max_tokens: 300   // Limita o comprimento da resposta
            });

            // Retorna o conteúdo da primeira escolha
            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Erro OpenAI:', error);
            throw new Error('Falha ao gerar resposta');
        }
    }

    /**
     * Analisa o sentimento de um texto
     * 
     * Utiliza o modelo GPT para classificar o sentimento como POSITIVO, NEGATIVO ou NEUTRO
     * 
     * @static
     * @async
     * @param {string} texto - Texto a ser analisado
     * @returns {Promise<string>} Sentimento do texto (POSITIVO, NEGATIVO ou NEUTRO)
     * @throws {Error} Erro durante a análise de sentimento
     */
    static async analisarSentimento(texto) {
        // Inicializa o cliente OpenAI com a chave de API
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        try {
            // Cria uma solicitação de completude de chat para análise de sentimento
            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo", // Modelo de linguagem utilizado
                messages: [
                    {
                        role: "system",
                        content: "Analise o sentimento do texto fornecido e retorne apenas: POSITIVO, NEGATIVO ou NEUTRO"
                    },
                    {
                        role: "user",
                        content: texto
                    }
                ],
                temperature: 0.3, // Reduz a aleatoriedade para análise mais precisa
                max_tokens: 10    // Limita a resposta a poucos tokens
            });

            // Retorna o sentimento, removendo espaços em branco
            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error('Erro na análise de sentimento:', error);
            throw new Error('Falha ao analisar sentimento');
        }
    }
}

/**
 * Módulo de serviço para interações com a API da OpenAI
 * @module OpenAIService
 */
module.exports = OpenAIService;