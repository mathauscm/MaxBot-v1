class MLBasedClassifier {
    constructor() {
        this.vocabulario = new Set();
        this.documentosPorCategoria = {
            'trabalho': [],
            'sugestoes_locais': [],
            'perguntas_gerais': [],
            'outros': []
        };
        this.idf = {};
        this.treinado = false;
        
        // Padrões específicos para cada categoria
        this.padroesPorCategoria = {
            'trabalho': [
                /\b(trabalho|emprego|projeto|reuni[ãa]o|cliente|apresenta[çc][ãa]o|relat[óo]rio)\b/i,
                /\b(prazo|deadline|entrega|feedback|equipe|time)\b/i,
                /\b(produtividade|gest[ãa]o|organiza[çc][ãa]o|profissional)\b/i
            ],
            'sugestoes_locais': [
                /\bonde\s+(fica|[ée]|tem|encontr[ao]|acho)\b/i,
                /\b(pr[óo]ximo|perto|regi[ãa]o|local|lugar)\b/i,
                /\b(restaurante|academia|shopping|loja|café|bar)\b/i,
                /\b(conhece[mr]?|indica[mr]?|recomenda[mr]?)\b.*\b(bom|boa|melhor)\b/i
            ],
            'perguntas_gerais': [
                /^(qual|como|quando|onde|por que|quem)\b/i,
                /\b(voc[êe]s|algu[ée]m)\s+(j[áa]|tem|gosta[mr]?|acha[mr]?)\b/i,
                /\b(dicas?|sugest[õo]es|opini[ãa]o|recomenda[çc][ãa]o)\b/i
            ]
        };

        // Pesos para diferentes características
        this.pesos = {
            'padroesEspecificos': 2.5,
            'tfidf': 1.0,
            'perguntaDireta': 1.5,
            'palavrasChave': 2.0
        };
    }

    preprocessarTexto(texto) {
        return texto.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ');
    }

    calcularTF(palavras) {
        const tf = {};
        palavras.forEach(palavra => {
            tf[palavra] = (tf[palavra] || 0) + 1;
        });
        const maxFreq = Math.max(...Object.values(tf));
        Object.keys(tf).forEach(palavra => {
            tf[palavra] = tf[palavra] / maxFreq;
        });
        return tf;
    }

    calcularIDF() {
        const N = Object.values(this.documentosPorCategoria)
            .reduce((sum, docs) => sum + docs.length, 0);

        this.vocabulario.forEach(palavra => {
            let documentosComPalavra = 0;
            Object.values(this.documentosPorCategoria).forEach(documentos => {
                documentosComPalavra += documentos.filter(doc => 
                    doc.includes(palavra)
                ).length;
            });
            this.idf[palavra] = Math.log(N / (1 + documentosComPalavra));
        });
    }

    calcularTFIDF(palavras) {
        const tf = this.calcularTF(palavras);
        const tfidf = {};
        Object.keys(tf).forEach(palavra => {
            if (this.idf[palavra]) {
                tfidf[palavra] = tf[palavra] * this.idf[palavra];
            }
        });
        return tfidf;
    }

    verificarPadroes(texto, categoria) {
        const padroes = this.padroesPorCategoria[categoria];
        if (!padroes) return 0;

        return padroes.reduce((score, padrao) => {
            return score + (padrao.test(texto) ? 1 : 0);
        }, 0);
    }

    treinar(exemplos) {
        this.vocabulario = new Set();
        Object.keys(this.documentosPorCategoria).forEach(categoria => {
            this.documentosPorCategoria[categoria] = [];
        });

        exemplos.forEach(({texto, categoria}) => {
            const palavras = this.preprocessarTexto(texto);
            palavras.forEach(palavra => this.vocabulario.add(palavra));
            this.documentosPorCategoria[categoria].push(palavras);
        });

        this.calcularIDF();
        this.treinado = true;

        this.centroidesPorCategoria = {};
        Object.keys(this.documentosPorCategoria).forEach(categoria => {
            const documentos = this.documentosPorCategoria[categoria];
            const centroide = {};
            
            documentos.forEach(doc => {
                const tfidf = this.calcularTFIDF(doc);
                Object.keys(tfidf).forEach(palavra => {
                    centroide[palavra] = (centroide[palavra] || 0) + tfidf[palavra];
                });
            });

            if (documentos.length > 0) {
                Object.keys(centroide).forEach(palavra => {
                    centroide[palavra] /= documentos.length;
                });
            }

            this.centroidesPorCategoria[categoria] = centroide;
        });
    }

    similaridadeCosseno(vetor1, vetor2) {
        const palavras = new Set([...Object.keys(vetor1), ...Object.keys(vetor2)]);
        
        let produtoEscalar = 0;
        let norma1 = 0;
        let norma2 = 0;

        palavras.forEach(palavra => {
            const v1 = vetor1[palavra] || 0;
            const v2 = vetor2[palavra] || 0;
            produtoEscalar += v1 * v2;
            norma1 += v1 * v1;
            norma2 += v2 * v2;
        });

        norma1 = Math.sqrt(norma1);
        norma2 = Math.sqrt(norma2);

        if (norma1 === 0 || norma2 === 0) return 0;
        return produtoEscalar / (norma1 * norma2);
    }

    classificar(texto) {
        if (!this.treinado) {
            throw new Error('O classificador precisa ser treinado primeiro');
        }

        const textoOriginal = texto;
        const palavras = this.preprocessarTexto(texto);
        const tfidf = this.calcularTFIDF(palavras);

        const scores = {};
        Object.keys(this.documentosPorCategoria).forEach(categoria => {
            // Score baseado em TF-IDF
            const similaridadeTFIDF = this.similaridadeCosseno(
                tfidf, 
                this.centroidesPorCategoria[categoria]
            ) * this.pesos.tfidf;

            // Score baseado em padrões específicos
            const scorePadroes = this.verificarPadroes(textoOriginal, categoria) * 
                               this.pesos.padroesEspecificos;

            // Score para perguntas diretas
            const scorePergunta = /^(qual|como|quando|onde|por que|quem)\b/i.test(textoOriginal) && 
                                categoria === 'perguntas_gerais' ? 
                                this.pesos.perguntaDireta : 0;

            // Score final combinado
            scores[categoria] = similaridadeTFIDF + scorePadroes + scorePergunta;
        });

        // Encontra a categoria com maior score
        let maxScore = -1;
        let melhorCategoria = 'outros';
        Object.entries(scores).forEach(([categoria, score]) => {
            if (score > maxScore) {
                maxScore = score;
                melhorCategoria = categoria;
            }
        });

        // Normaliza a confiança para percentual
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const confianca = totalScore > 0 ? (scores[melhorCategoria] / totalScore) * 100 : 0;

        return {
            categoria: melhorCategoria,
            confianca: Math.round(confianca)
        };
    }
}

module.exports = { MLBasedClassifier };