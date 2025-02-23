const fs = require('fs').promises;
const path = require('path');
const { MLBasedClassifier } = require('./classifier.js');

class DatasetLoader {
    constructor() {
        this.baseDir = path.join(__dirname, 'DadosTreinamento');
        this.categories = ['trabalho', 'sugestoes_locais', 'perguntas_gerais', 'outros'];
    }

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

class MLClassifierTrainer {
    constructor() {
        this.classifier = new MLBasedClassifier();
        this.dataLoader = new DatasetLoader();
    }

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

    // Método para classificar um novo texto
    classificar(texto) {
        return this.classifier.classificar(texto);
    }
}

// Exporta as classes para uso
module.exports = { MLClassifierTrainer, DatasetLoader };