const { expect } = require('chai');
const { MLBasedClassifier } = require('./../services/classifier/classifier');
const fs = require('fs');
const path = require('path');
// const assert = require('assert')

describe('Teste de Classificação', () => {
    let classifier;
    
    beforeEach(() => {
        classifier = new MLBasedClassifier();
        
        // Função para ler arquivo e retornar array de linhas
        const lerArquivo = (nomeArquivo) => {
            const caminhoArquivo = path.join(__dirname, '..', 'services', 'classifier', 'DadosTreinamento', nomeArquivo);
            return fs.readFileSync(caminhoArquivo, 'utf8')
                .split('\n')
                .filter(linha => linha.trim()) // Remove linhas vazias
                .map(linha => linha.trim());
        };

        // Lê todos os arquivos de treinamento
        const dadosTreino = [
            ...lerArquivo('trabalho.txt').map(texto => ({ texto, categoria: 'trabalho' })),
            ...lerArquivo('sugestoes_locais.txt').map(texto => ({ texto, categoria: 'sugestoes_locais' })),
            ...lerArquivo('perguntas_gerais.txt').map(texto => ({ texto, categoria: 'perguntas_gerais' })),
            ...lerArquivo('outros.txt').map(texto => ({ texto, categoria: 'outros' }))
        ];
        
        classifier.treinar(dadosTreino);
    });

    it('deve classificar mensagens relacionadas ao trabalho', () => {
        const result = classifier.classificar("Preciso entregar o relatório urgente");
        expect(result.categoria).to.equal('trabalho');
        // assert.deepStrictEqual(result.categoria, 'trabalho')
    });

    it('deve classificar mensagens relacionadas a perguntas gerais', () => {
        const result = classifier.classificar("Quem inventou a lâmpada elétrica?");
        expect(result.categoria).to.equal('perguntas_gerais');
    });

    it('deve classificar mensagens relacionadas a sugestões de locais', () => {
        const result = classifier.classificar("Alguém conhece um estúdio de pilates renomado na região?");
        expect(result.categoria).to.equal('sugestoes_locais');
    });

    it('deve classificar mensagens relacionadas a outros', () => {
        const result = classifier.classificar("Vocês já foram em uma casa assombrada?");
        expect(result.categoria).to.equal('outros');
    });
});