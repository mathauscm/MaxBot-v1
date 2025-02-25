/**
 * @fileoverview Script principal para executar o classificador de texto treinado e testar com novos exemplos.
 * @module text-classifier-test
 * @requires ./ml-training.js
 */

const { MLClassifierTrainer } = require('./ml-training.js');

/**
 * Função principal que treina o classificador e executa uma bateria de testes com exemplos predefinidos.
 * Imprime os resultados da classificação para cada exemplo de teste.
 * 
 * @async
 * @function main
 * @returns {Promise<void>}
 */
async function main() {
    // Cria uma instância do treinador
    const trainer = new MLClassifierTrainer();

    try {
        // Treina o classificador com os arquivos
        console.log('Iniciando treinamento...');
        const trainedClassifier = await trainer.trainWithFiles();

        /**
         * Lista de textos para testar o classificador, agrupados por categoria esperada.
         * Inclui 10 exemplos para cada uma das categorias: outros, perguntas_gerais, sugestoes_locais e trabalho.
         * @type {Array<string>}
         */
        const textosTeste = [
            // outros
            "Quais são suas dicas para manter a saúde mental em dias difíceis?",
            "Estou tentando uma nova dieta.",
            "Vocês já foram a um show de comédia ao vivo?",
            "Qual é o melhor documentário que você já assistiu?",
            "Estou procurando um novo emprego.",
            "Alguma dica de como lidar com a ansiedade?",
            "Vocês já experimentaram aquela nova pizzaria?",
            "Como criar um currículo atraente?",
            "Pensando em pintar as paredes da sala.",
            "Vocês acreditam em horóscopo?",
            //perguntas_gerais
            "Como se formam os tornados?",
            "Qual é a língua mais falada no mundo?",
            "Quem foi o primeiro a chegar ao Polo Sul?",
            "Como é feita a reciclagem de plástico?",
            "Por que as folhas mudam de cor no outono?",
            "Qual é a origem do termo 'OK'?",
            "Quem compôs a Nona Sinfonia?",
            "Qual é a fórmula molecular da água?",
            "Como funciona a internet?",
            "Qual é o maior mamífero terrestre?",
            "Quem foi o primeiro homem a pisar na Lua?",
            //sugestoes_locais
            "Onde posso encontrar yoga ao ar livre?",
            "Alguém conhece uma vinícola para visitar nas proximidades?",
            "Sugestão de um bom bar rooftop?",
            "Preciso de um lugar para um evento de pequena escala, recomendações?",
            "Onde está a melhor loja de brinquedos educativos?",
            "Alguém indica um restaurante para um jantar romântico?",
            "Sugestões de um café que aceita pets?",
            "Onde posso encontrar uma boa galeria de arte moderna?",
            "Sugiram um lugar para alugar patins?",
            "Procurando por uma loja que venda queijos artesanais, onde ir?",
            "Alguém conhece um estúdio de pilates renomado na região?",
            //trabalho
            "Podemos analisar os resultados da pesquisa na próxima reunião?",
            "O sistema de TI estará em manutenção no fim de semana.",
            "Alguém pode cuidar do pedido de suprimentos esta semana?",
            "Precisamos dedicar mais tempo à pesquisa do mercado-alvo.",
            "O novo software precisa ser testado antes de ser implementado.",
            "Quem ajustará o cronograma para refletir as mudanças recentes?",
            "Quais são os principais objetivos para o próximo trimestre?",
            "Os documentos para a auditoria já estão preparados?",
            "Precisamos discutir o desempenho da equipe no projeto anterior.",
            "É necessário criar um plano de ação para a fase dois do projeto.",
        ];

        // Testa cada texto
        console.log('\nTestando classificador com novos textos:');
        textosTeste.forEach(texto => {
            const resultado = trainedClassifier.classificar(texto);
            console.log('\n-----------------------------------');
            console.log(`Texto: "${texto}"`);
            console.log(`Categoria: ${resultado.categoria}`);
            console.log(`Confiança: ${resultado.confianca}%`);
        });

    } catch (error) {
        console.error('Erro durante a execução:', error);
    }
}

// Executa o programa
main();