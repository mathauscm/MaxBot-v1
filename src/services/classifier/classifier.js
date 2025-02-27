/**
 * @fileoverview Módulo para carregamento de dados de treinamento e classificação de texto
 * utilizando aprendizado de máquina.
 * @module text-classifier
 * @requires fs
 * @requires path
 * @requires ./classifier.js
 */

const fs = require('fs').promises;
const path = require('path');
const { MLBasedClassifier } = require('./classifier.js');

/**
 * Classe responsável por carregar dados de treinamento de arquivos de texto.
 * @class
 */
class DatasetLoader {
    /**
     * Cria uma instância do carregador de datasets.
     * @constructor
     */
    constructor() {
        /**
         * Diretório base onde estão armazenados os arquivos de treinamento.
         * @type {string}
         */
        this.baseDir = path.join(__dirname, 'DadosTreinamento');
        
        /**
         * Categorias disponíveis para classificação.
         * @type {Array<string>}
         */
        this.categories = ['trabalho', 'sugestoes_locais', 'perguntas_gerais', 'outros'];
    }

    /**
     * Carrega os dados de treinamento de todos os arquivos de categorias.
     * @async
     * @returns {Promise<Array<Object>>} Array de objetos com texto e categoria correspondente.
     * @throws {Error} Se ocorrer erro na leitura dos arquivos.
     */
    async loadTrainingData() {
        const trainingData = [];

        for (const categoria of this.categories) {
            const filePath = path.join(this.baseDir, `${categoria}.txt`);
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const frases = content
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0); // Remove linhas vazias

                frases.forEach(frase => {
                    trainingData.push({
                        texto: frase,
                        categoria: categoria
                    });
                });

                // console.log(`Carregadas ${frases.length} frases da categoria ${categoria}`);
            } catch (error) {
                console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
            }
        }

        return trainingData;
    }
}

/**
 * Classe responsável pelo treinamento e uso do classificador de texto.
 * @class
 */
class MLClassifierTrainer {
    /**
     * Cria uma instância do treinador de classificador.
     * @constructor
     */
    constructor() {
        /**
         * Instância do classificador baseado em ML.
         * @type {MLBasedClassifier}
         */
        this.classifier = new MLBasedClassifier();
        
        /**
         * Instância do carregador de datasets.
         * @type {DatasetLoader}
         */
        this.dataLoader = new DatasetLoader();
    }

    /**
     * Treina o classificador utilizando os arquivos de dados.
     * @async
     * @returns {Promise<MLBasedClassifier>} O classificador treinado.
     * @throws {Error} Se ocorrer erro durante o treinamento.
     */
    async trainWithFiles() {
        try {
            // Carrega os dados de treinamento
            const trainingData = await this.dataLoader.loadTrainingData();
            // console.log(`Total de ${trainingData.length} exemplos de treinamento carregados`);

            // Treina o classificador
            this.classifier.treinar(trainingData);
            // console.log('Treinamento concluído com sucesso!');

            // Testa algumas classificações
            this.runTests();

            return this.classifier;
        } catch (error) {
            console.error('Erro durante o treinamento:', error);
            throw error;
        }
    }

    /**
     * Executa testes de classificação em exemplos pré-definidos.
     * @returns {void}
     */
    runTests() {
        const testCases = [
            "Como lidar com o estresse no trabalho?",
            "Onde encontro um bom restaurante italiano?",
            "Qual é o seu filme favorito?",
            "Estou aprendendo a tocar violão",
            "Preciso preparar uma apresentação importante",
            "Conhece alguma academia boa na região?"
        ];

        // console.log('\nTestes de classificação:');
        testCases.forEach(texto => {
            const resultado = this.classifier.classificar(texto);
            console.log(`\nTexto: "${texto}"`);
            console.log(`Categoria: ${resultado.categoria}`);
            console.log(`Confiança: ${resultado.confianca}%`);
        });
    }

    /**
     * Classifica um novo texto utilizando o classificador treinado.
     * @param {string} texto - O texto a ser classificado.
     * @returns {Object} Objeto contendo a categoria prevista e nível de confiança.
     * @returns {string} resultado.categoria - A categoria prevista.
     * @returns {number} resultado.confianca - O nível de confiança na classificação (%).
     */
    classificar(texto) {
        return this.classifier.classificar(texto);
    }
}

// Exporta as classes para uso
module.exports = { MLClassifierTrainer, DatasetLoader };