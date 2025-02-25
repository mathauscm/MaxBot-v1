const fs = require('fs').promises;
const path = require('path');
const { MLClassifierTrainer } = require('./../services/classifier/ml-training.js');
const { agruparMensagens } = require('../utils/chatUtils');

/**
 * Classe para gerenciamento de classificação e análise de mensagens
 * 
 * Responsável por processar, classificar e armazenar mensagens em categorias
 * utilizando um classificador de Machine Learning
 * 
 * @class
 */
class ClassifierData {
    /**
     * Construtor da classe ClassifierData
     * Configura os caminhos de arquivo e inicializa o treinador de ML
     * 
     * @constructor
     */
    constructor() {
        /** 
         * Caminho para o arquivo de classificações 
         * @type {string}
         * @private
         */
        this.classificationPath = path.join(__dirname, '../db/classificationMensages/classificationByTime.json');
        
        /** 
         * Instância do treinador de classificação de Machine Learning 
         * @type {MLClassifierTrainer}
         * @private
         */
        this.mlTrainer = new MLClassifierTrainer();
    }

    /**
     * Inicializa o classificador e prepara o arquivo de classificações
     * 
     * - Treina o classificador de Machine Learning
     * - Cria o diretório de classificações se não existir
     * - Inicializa o arquivo de classificações com dados padrão
     * 
     * @async
     * @throws {Error} Erro durante a inicialização do classificador
     */
    async initialize() {
        try {
            // Inicializa o classificador ML
            this.classifier = await this.mlTrainer.trainWithFiles();
            
            // Garante que o diretório exista
            const dirPath = path.dirname(this.classificationPath);
            await fs.mkdir(dirPath, { recursive: true });

            // Inicializa o arquivo se não existir
            const fileExists = await fs.access(this.classificationPath).then(() => true).catch(() => false);
            if (!fileExists) {
                const initialData = {
                    lastUpdate: new Date().toISOString(),
                    statistics: {
                        totalMessages: 0,
                        categoryCount: {
                            trabalho: 0,
                            sugestoes_locais: 0,
                            perguntas_gerais: 0,
                            outros: 0
                        }
                    },
                    conversations: {
                        trabalho: [],
                        sugestoes_locais: [],
                        perguntas_gerais: [],
                        outros: []
                    }
                };
                await fs.writeFile(this.classificationPath, JSON.stringify(initialData, null, 2), 'utf8');
            }

            console.log('Classificador ML inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar classificador:', error);
            throw error;
        }
    }

    /**
     * Processa uma nova mensagem, classificando-a e salvando seus dados
     * 
     * @async
     * @param {Object} messagePayload - Payload da mensagem a ser processada
     * @returns {Object} Mensagem com classificação adicionada
     * @throws {Error} Erro durante o processamento da mensagem
     */
    async processNewMessage(messagePayload) {
        try {
            // Classifica a mensagem usando o ML
            const classificacao = this.classifier.classificar(messagePayload.message.body);

            // Adiciona a classificação ao payload
            const messageWithClassification = {
                ...messagePayload,
                classification: {
                    category: classificacao.categoria,
                    confidence: classificacao.confianca
                },
                timestamp: messagePayload.message.timestamp
            };

            // Lê o arquivo existente ou cria um novo
            let existingData = await this.readExistingClassifications();
            
            // Adiciona a nova mensagem
            existingData.push(messageWithClassification);
            
            // Agrupa e organiza as mensagens
            const organizedData = this.organizeMessages(existingData);
            
            // Salva os dados atualizados
            await this.saveClassifications(organizedData);

            return messageWithClassification;
        } catch (error) {
            console.error('Erro ao processar nova mensagem:', error);
            throw error;
        }
    }

    /**
     * Organiza as mensagens por categoria e agrupa por tempo
     * 
     * @param {Array} messages - Lista de mensagens para organizar
     * @returns {Object} Dados organizados com estatísticas e conversas
     */
    organizeMessages(messages) {
        // Ordena as mensagens por timestamp
        const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);

        // Agrupa por categoria
        const categorizedMessages = {
            trabalho: [],
            sugestoes_locais: [],
            perguntas_gerais: [],
            outros: []
        };

        sortedMessages.forEach(msg => {
            const category = msg.classification.category;
            if (categorizedMessages[category]) {
                categorizedMessages[category].push(msg);
            }
        });

        // Para cada categoria, agrupa por tempo (30 min intervalo)
        const finalOrganization = {};
        Object.entries(categorizedMessages).forEach(([category, messages]) => {
            const groupedByTime = agruparMensagens(messages);
            
            finalOrganization[category] = groupedByTime.map(group => ({
                messages: group,
                startTime: new Date(group[0].message.timestamp * 1000).toISOString(),
                endTime: new Date(group[group.length - 1].message.timestamp * 1000).toISOString(),
                messageCount: group.length
            }));
        });

        return {
            lastUpdate: new Date().toISOString(),
            statistics: {
                totalMessages: messages.length,
                categoryCount: {
                    trabalho: categorizedMessages.trabalho.length,
                    sugestoes_locais: categorizedMessages.sugestoes_locais.length,
                    perguntas_gerais: categorizedMessages.perguntas_gerais.length,
                    outros: categorizedMessages.outros.length
                }
            },
            conversations: finalOrganization
        };
    }

    /**
     * Lê as classificações existentes no arquivo
     * 
     * @async
     * @returns {Array} Lista de mensagens classificadas
     */
    async readExistingClassifications() {
        try {
            const fileExists = await fs.access(this.classificationPath).then(() => true).catch(() => false);
            
            if (!fileExists) {
                return [];
            }

            const data = await fs.readFile(this.classificationPath, 'utf8');
            
            if (!data.trim()) {
                return [];
            }

            try {
                const parsed = JSON.parse(data);
                if (!parsed.conversations) {
                    return [];
                }
                
                return Object.values(parsed.conversations)
                    .flatMap(category => 
                        category.flatMap(group => group.messages)
                    );
            } catch (parseError) {
                console.warn('Erro ao parsear arquivo de classificações, iniciando novo array');
                return [];
            }
        } catch (error) {
            console.warn('Erro ao ler classificações existentes, iniciando novo array');
            return [];
        }
    }

    /**
     * Salva as classificações de mensagens em arquivo
     * 
     * @async
     * @param {Object} data - Dados de classificação para salvar
     * @throws {Error} Erro durante a gravação do arquivo
     */
    async saveClassifications(data) {
        try {
            await fs.writeFile(
                this.classificationPath,
                JSON.stringify(data, null, 2),
                'utf8'
            );
            console.log('Classificações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar classificações:', error);
            throw error;
        }
    }

    /**
     * Recupera conversas por categoria específica
     * 
     * @async
     * @param {string} category - Categoria de conversas a recuperar
     * @returns {Array} Lista de conversas na categoria especificada
     */
    async getConversationsByCategory(category) {
        try {
            const data = await fs.readFile(this.classificationPath, 'utf8');
            const parsed = JSON.parse(data);
            return parsed.conversations[category] || [];
        } catch (error) {
            console.error('Erro ao recuperar conversas:', error);
            return [];
        }
    }
}

/**
 * Instância singleton do ClassifierData
 * @module ClassifierDataModule
 */
module.exports = new ClassifierData();