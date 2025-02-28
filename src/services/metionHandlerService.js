const OpenAIService = require('../services/openai/openAiService.js');
const GoogleMapsService = require('../services/google/googleMapsService.js');
const { MLClassifierTrainer } = require('./../services/classifier/ml-training.js');

require('dotenv').config();

/**
 * Serviço para manipulação de menções ao bot
 * 
 * Responsável por processar e responder a menções direcionadas ao bot,
 * utilizando classificação de machine learning e diferentes serviços
 * 
 * @class
 */
class MentionHandlerService {
    /**
     * Cria uma instância do serviço de manipulação de menções
     * 
     * @constructor
     */
    constructor() {
        /** 
         * Classificador de machine learning 
         * @type {Object|null}
         * @private
         */
        this.classifier = null;

        /** 
         * Números/identificadores do bot para detecção de menções 
         * @type {string[]}
         * @private
         */
        this.BOT_NUMBERS = ['@MaxBot', process.env.NUMBER_BOT];
    }

    /**
     * Inicializa o classificador de menções
     * 
     * Carrega um modelo de machine learning treinado para classificar mensagens
     * 
     * @async
     * @throws {Error} Erro durante a inicialização do classificador
     */
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

    /**
     * Verifica se a mensagem é uma menção ao bot
     * 
     * @param {string} message - Texto da mensagem a ser verificada
     * @returns {boolean} Verdadeiro se for uma menção ao bot, falso caso contrário
     */
    isBotMention(message) {
        return this.BOT_NUMBERS.some(number => message.includes(number));
    }

    /**
     * Extrai a pergunta removendo as menções ao bot
     * 
     * @param {string} message - Mensagem original
     * @returns {string} Pergunta limpa, sem menções ao bot
     */
    extractQuestion(message) {
        let question = message;
        this.BOT_NUMBERS.forEach(number => {
            question = question.replace(number, '').trim();
        });
        return question;
    }

    /**
     * Processa uma mensagem mencionando o bot
     * 
     * Realiza os seguintes passos:
     * 1. Verifica se é uma menção ao bot
     * 2. Extrai a pergunta
     * 3. Classifica a mensagem
     * 4. Gera resposta baseada na classificação
     * 
     * @async
     * @param {string} message - Mensagem a ser processada
     * @returns {Promise<string|null>} Resposta gerada ou null se não for uma menção
     */
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

    /**
     * Processa consultas relacionadas a locais
     * 
     * Busca locais usando o serviço do Google Maps e formata a resposta
     * 
     * @async
     * @param {string} question - Pergunta sobre locais
     * @returns {Promise<string>} Resposta formatada com locais encontrados
     */
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

    /**
     * Processa consultas gerais usando o serviço da OpenAI
     * 
     * Gera respostas contextualizadas baseadas na categoria da mensagem
     * 
     * @async
     * @param {string} question - Pergunta a ser respondida
     * @param {string} category - Categoria da mensagem
     * @returns {Promise<string>} Resposta gerada
     */
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

/**
 * Instância singleton do serviço de manipulação de menções
 * @module MentionHandlerService
 */
module.exports = new MentionHandlerService();