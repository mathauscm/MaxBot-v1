const OpenAIService = require('../services/openai/openAiService.js');
const GoogleMapsService = require('../services/google/googleMapsService.js');
const { MLClassifierTrainer } = require('./../services/classifier/ml-training.js');

class MentionHandlerService {
    constructor() {
        this.classifier = null;
        this.BOT_NUMBERS = ['@MaxBot', '@558585707591'];
    }

    async initialize() {
        try {
            const trainer = new MLClassifierTrainer();
            this.classifier = await trainer.trainWithFiles();
            console.log('Classificador de menções inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar classificador de menções:', error);
            throw error;
        }
    }

    isBotMention(message) {
        return this.BOT_NUMBERS.some(number => message.includes(number));
    }

    extractQuestion(message) {
        // Remove a menção do bot da mensagem
        let question = message;
        this.BOT_NUMBERS.forEach(number => {
            question = question.replace(number, '').trim();
        });
        return question;
    }

    async processMessage(message) {
        try {
            // Verifica se é uma menção ao bot
            if (!this.isBotMention(message)) {
                return null;
            }

            // Extrai a pergunta da mensagem
            const question = this.extractQuestion(message);
            if (!question) {
                return "Olá! Como posso ajudar?";
            }

            // Classifica a mensagem
            const classification = this.classifier.classificar(question);
            console.log(`Mensagem classificada como: ${classification.categoria} (${classification.confianca}%)`);

            // Processa baseado na classificação
            let response;
            if (classification.categoria === 'sugestoes_locais') {
                response = await this.handleLocationQuery(question);
            } else {
                response = await this.handleGeneralQuery(question, classification.categoria);
            }

            return response;

        } catch (error) {
            console.error('Erro ao processar menção:', error);
            return "Desculpe, ocorreu um erro ao processar sua solicitação.";
        }
    }

    async handleLocationQuery(question) {
        try {
            const places = await GoogleMapsService.buscarLocais(question);
            
            if (!places || places.length === 0) {
                return "Desculpe, não encontrei lugares correspondentes à sua busca.";
            }

            // Formata a resposta com os lugares encontrados
            let response = "Encontrei estas opções para você:\n\n";
            places.forEach((place, index) => {
                response += `${index + 1}. ${place.nome}\n`;
                response += `   Endereço: ${place.endereco}\n`;
                if (place.avaliacao) {
                    response += `   Avaliação: ${place.avaliacao} ⭐ (${place.total_avaliacoes} avaliações)\n`;
                }
                response += `   Status: ${place.aberto ? 'Aberto agora' : 'Fechado'}\n\n`;
            });

            return response;

        } catch (error) {
            console.error('Erro ao buscar locais:', error);
            return "Desculpe, ocorreu um erro ao buscar locais.";
        }
    }

    async handleGeneralQuery(question, category) {
        try {
            // Adapta o contexto baseado na categoria
            let contextPrompt;
            switch (category) {
                case 'trabalho':
                    contextPrompt = "No contexto profissional e de trabalho: ";
                    break;
                case 'perguntas_gerais':
                    contextPrompt = "Respondendo de forma informativa e educacional: ";
                    break;
                default:
                    contextPrompt = "Respondendo de forma amigável e helpful: ";
            }

            const response = await OpenAIService.gerarResposta(
                contextPrompt,
                question
            );

            return response;

        } catch (error) {
            console.error('Erro ao gerar resposta:', error);
            return "Desculpe, ocorreu um erro ao gerar uma resposta.";
        }
    }
}

module.exports = new MentionHandlerService();