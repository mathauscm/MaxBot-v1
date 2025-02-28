const dotenv = require('dotenv');

/**
 * Classe responsável por gerenciar configurações de ambiente da aplicação
 * @class
 */
class Environment {
    /**
     * Cria uma instância de Environment
     * Carrega as variáveis de ambiente e valida as configurações necessárias
     * @constructor
     * @throws {Error} Lança erro se alguma variável de ambiente obrigatória estiver ausente
     */
    constructor() {
        dotenv.config();
        this.validateConfig();
    }

    /**
     * Valida a presença de variáveis de ambiente obrigatórias
     * @private
     * @throws {Error} Lança erro com o nome da variável de ambiente faltante
     */
    validateConfig() {
        const requiredVars = ['OPENAI_API_KEY'];
        for(const varName of requiredVars){
            if(!process.env[varName]){
                throw new Error(`A variável de ambiente ${varName} é obrigatória`);
            }
        }
    }

    /**
     * Obtém as configurações de autenticação para a API da OpenAI
     * @returns {Object} Objeto com a chave de API da OpenAI
     * @property {string} apiKey - Chave de API da OpenAI obtida das variáveis de ambiente
     */
    getOpenAIConfig() {
        return {
            apiKey: process.env.OPENAI_API_KEY
        };
    }

    /**
     * Recupera a porta para o servidor, com um valor padrão se não definida
     * @returns {number} Número da porta para o servidor
     */
    getPort() {
        return process.env.PORT || 4000;
    }
}

module.exports = new Environment();