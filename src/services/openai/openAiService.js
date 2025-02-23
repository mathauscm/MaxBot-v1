const OpenAI = require('openai'); // Atualizado para a versão mais recente

class OpenAIService {
    static async gerarResposta(contexto, pergunta) {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY // Certifique-se de ter esta variável no .env
        });

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
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
                temperature: 0.7,
                max_tokens: 300
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Erro OpenAI:', error);
            throw new Error('Falha ao gerar resposta');
        }
    }

    static async analisarSentimento(texto) {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
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
                temperature: 0.3,
                max_tokens: 10
            });

            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error('Erro na análise de sentimento:', error);
            throw new Error('Falha ao analisar sentimento');
        }
    }
}

module.exports = OpenAIService;