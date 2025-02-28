/**
 * @fileoverview Testes unitários para o classificador de texto baseado em ML.
 * @module classifier-tests
 * @requires chai
 * @requires ./../services/classifier/classifier
 * @requires fs
 * @requires path
 */

const { expect } = require('chai');
const { MLBasedClassifier } = require('./../services/classifier/classifier');
const fs = require('fs');
const path = require('path');
// const assert = require('assert')

/**
 * Suite de testes para o classificador de texto MLBasedClassifier.
 * Testa a classificação correta de mensagens em diferentes categorias.
 * @namespace ClassifierTests
 */
describe('Teste de Classificação', () => {
    /**
     * Instância do classificador que será usada nos testes.
     * @type {MLBasedClassifier}
     */
    let classifier;
    
    /**
     * Configura o ambiente de teste antes de cada caso de teste.
     * Cria uma nova instância do classificador e o treina com dados de exemplo.
     * @function beforeEach
     * @memberof ClassifierTests
     */
    beforeEach(() => {
        classifier = new MLBasedClassifier();
        
        /**
         * Função para ler um arquivo de treinamento e converter em array de linhas.
         * @param {string} nomeArquivo - Nome do arquivo a ser lido.
         * @returns {Array<string>} Array contendo as linhas não vazias do arquivo.
         * @inner
         */
        const lerArquivo = (nomeArquivo) => {
            const caminhoArquivo = path.join(__dirname, '..', 'services', 'classifier', 'DadosTreinamento', nomeArquivo);
            return fs.readFileSync(caminhoArquivo, 'utf8')
                .split('\n')
                .filter(linha => linha.trim()) // Remove linhas vazias
                .map(linha => linha.trim());
        };

        /**
         * Dados de treinamento combinados de todos os arquivos de categorias.
         * @type {Array<Object>}
         */
        const dadosTreino = [
            ...lerArquivo('trabalho.txt').map(texto => ({ texto, categoria: 'trabalho' })),
            ...lerArquivo('sugestoes_locais.txt').map(texto => ({ texto, categoria: 'sugestoes_locais' })),
            ...lerArquivo('perguntas_gerais.txt').map(texto => ({ texto, categoria: 'perguntas_gerais' })),
            ...lerArquivo('outros.txt').map(texto => ({ texto, categoria: 'outros' }))
        ];
        
        classifier.treinar(dadosTreino);
    });

    /**
     * Testa se o classificador identifica corretamente mensagens relacionadas a trabalho.
     * @function
     * @memberof ClassifierTests
     */
    it('deve classificar mensagens relacionadas ao trabalho', () => {
        const result = classifier.classificar("Preciso entregar o relatório urgente");
        expect(result.categoria).to.equal('trabalho');
        // assert.deepStrictEqual(result.categoria, 'trabalho')
    });

    /**
     * Testa se o classificador identifica corretamente mensagens relacionadas a perguntas gerais.
     * @function
     * @memberof ClassifierTests
     */
    it('deve classificar mensagens relacionadas a perguntas gerais', () => {
        const result = classifier.classificar("Quem inventou a lâmpada elétrica?");
        expect(result.categoria).to.equal('perguntas_gerais');
    });

    /**
     * Testa se o classificador identifica corretamente mensagens relacionadas a sugestões de locais.
     * @function
     * @memberof ClassifierTests
     */
    it('deve classificar mensagens relacionadas a sugestões de locais', () => {
        const result = classifier.classificar("Alguém conhece um estúdio de pilates renomado na região?");
        expect(result.categoria).to.equal('sugestoes_locais');
    });

    /**
     * Testa se o classificador identifica corretamente mensagens relacionadas a outros tópicos.
     * @function
     * @memberof ClassifierTests
     */
    it('deve classificar mensagens relacionadas a outros', () => {
        const result = classifier.classificar("Vocês já foram em uma casa assombrada?");
        expect(result.categoria).to.equal('outros');
    });
});