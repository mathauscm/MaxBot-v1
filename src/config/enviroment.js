const dotenv = require('dotenv');

class Environment {
    constructor() {
        dotenv.config();
        this.validateConfig();
    }
    validateConfig() {
        const requiredVars = ['OPENAI_API_KEY']; // Corrigido nome da variável
        for(const varName of requiredVars){
            if(!process.env[varName]){
                throw new Error(`A variável de ambiente ${varName} é obrigatória`);
            }
        }
    }
    getOpenAIConfig() {
        return { // Corrigido para retornar objeto
            apiKey: process.env.OPENAI_API_KEY
        };
    }
    getPort() {
        return process.env.PORT || 4000;
    }
}

module.exports = new Environment();