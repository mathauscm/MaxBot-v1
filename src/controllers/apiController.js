const { agruparMensagens } = require('../utils/chatUtils')
const OpenAIService = require('../services/openai/openAiService')
const GoogleMapsService = require('../services/google/googleMapsService')
const { MLClassifierTrainer } = require('../services/classifier/ml-training')
const mentionHandler = require('../services/mentionHandlerService')

// Inicializa o classificador de uma só vez
let classifier = null;
(async () => {
    try {
        const trainer = new MLClassifierTrainer();
        classifier = await trainer.trainWithFiles();
        console.log('Classificador da API inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar classificador da API:', error);
    }
})();

/**
 * Processa uma conversa e responde a uma pergunta baseada no contexto
 * Parte 1 do desafio
 */
async function processarConversa(req, res) {
    try {
        const { conversa, pergunta } = req.body;

        if (!conversa || !Array.isArray(conversa) || conversa.length === 0 || !pergunta) {
            return res.status(400).json({
                erro: "Formato inválido. É necessário fornecer um array de conversas e uma pergunta."
            });
        }

        // Verificar se há menção direta a horários na conversa
        const horariosNaConversa = conversa
            .map(msg => {
                // Regex mais robusto para capturar horários 
                const match = msg.mensagem.match(/(?:(?:às|as)\s*)?(\d{1,2})(?:[:h]\s*)?(?:h(?:oras)?)?/iu);
                return match ? { 
                    horario: match[1], 
                    mensagem: msg.mensagem,
                    usuario: msg.usuario,
                    timestamp: new Date(msg.hora_envio).getTime()
                } : null;
            })
            .filter(item => item !== null);

        // Adicionar log para debug
        console.log('Horários encontrados:', horariosNaConversa);

        // Se encontramos horários explícitos na conversa
        if (horariosNaConversa.length > 0 && 
            pergunta.toLowerCase().includes('hora') && 
            pergunta.toLowerCase().includes('reuni')) {
            
            // Ordenar por timestamp para pegar o horário mais recente
            const ultimoHorario = horariosNaConversa.sort((a, b) => b.timestamp - a.timestamp)[0];
            
            // Encontrar quem sugeriu primeiro o horário
            const primeiroHorario = horariosNaConversa.sort((a, b) => a.timestamp - b.timestamp)[0];
            
            return res.status(200).json({ 
                resposta: `A reunião será às ${ultimoHorario.horario}h, conforme sugerido por ${primeiroHorario.usuario}.` 
            });
        }

        // Processamento original se não houver análise direta
        const conversaFormatada = conversa.map(msg => ({
            message: {
                body: msg.mensagem,
                timestamp: new Date(msg.hora_envio).getTime() / 1000
            },
            sender: {
                name: msg.usuario
            },
            timestamp: new Date(msg.hora_envio).getTime() / 1000
        }));

        // Formatar a conversa para um prompt simples
        const contextoConversaSimples = conversa.map(msg => 
            `${msg.usuario}: ${msg.mensagem}`
        ).join('\n');

        // Gerar resposta baseada no contexto simplificado
        const resposta = await OpenAIService.gerarResposta(
            `Com base apenas na seguinte conversa:\n${contextoConversaSimples}\n\nResponda de forma direta e precisa à pergunta: "${pergunta}". Se a pergunta for sobre horário de reunião, indique o horário específico mencionado na conversa.`,
            pergunta
        );

        return res.status(200).json({ resposta });
    } catch (error) {
        console.error('Erro ao processar conversa:', error);
        return res.status(500).json({ erro: "Erro interno ao processar a conversa." });
    }
}

/**
 * Encontra o grupo de conversa mais relevante para a pergunta
 */
async function encontrarGrupoRelevante(grupos, pergunta) {
    // Se houver apenas um grupo, retorne-o
    if (grupos.length === 1) {
        return grupos[0];
    }

    // Avalia a relevância de cada grupo para a pergunta
    const gruposComRelevancia = await Promise.all(grupos.map(async (grupo) => {
        // Extrair texto de todas as mensagens do grupo
        const textoGrupo = grupo.map(msg => msg.message.body).join(' ');
        
        // Usar a API da OpenAI para calcular relevância
        const prompt = `
        Pergunta: "${pergunta}"
        Trecho de conversa: "${textoGrupo}"
        
        Em uma escala de 0 a 100, qual a relevância deste trecho de conversa para responder à pergunta acima? Retorne apenas o número.`;
        
        const resposta = await OpenAIService.gerarResposta("", prompt);
        
        // Extrair o valor numérico da resposta
        const relevancia = parseInt(resposta.match(/\d+/)[0], 10) || 0;
        
        return { grupo, relevancia };
    }));

    // Ordenar por relevância e retornar o grupo mais relevante
    gruposComRelevancia.sort((a, b) => b.relevancia - a.relevancia);
    return gruposComRelevancia[0].grupo;
}

/**
 * Classifica uma mensagem e retorna resposta de acordo com a categoria
 * Parte 2 do desafio
 */
const classificarMensagem = async (req, res) => {
    try {
        const { mensagem } = req.body;

        if (!mensagem || typeof mensagem !== 'string') {
            return res.status(400).json({
                erro: "Formato inválido. É necessário fornecer uma mensagem em texto."
            });
        }

        // Garantir que o classificador está inicializado
        if (!classifier) {
            return res.status(503).json({
                erro: "Classificador não inicializado. Tente novamente em alguns instantes."
            });
        }

        // Adicionar logs detalhados de debug
        console.log('Mensagem recebida para classificação:', mensagem);

        // Análise manual para locais antes de usar o classificador ML
        const contemLocal = /\b(restaurante|café|bar|academia|cinema|shopping|loja|parque|museu|teatro|hotel|boliche|região|cidade)\b/i.test(mensagem);
        const contemPedidoSugestao = /\b(onde|suger|indica|recomenda|conhece)\b/i.test(mensagem);
        const contemTrabalho = /\b(trabalho|emprego|projeto|reunião|cliente|apresentação|relatório|prazo|deadline)\b/i.test(mensagem);
        
        // Logs de verificação das condições
        console.log('Verificações de classificação:');
        console.log('Contém local:', contemLocal);
        console.log('Contém pedido de sugestão:', contemPedidoSugestao);
        console.log('Contém trabalho:', contemTrabalho);
        
        let categoria;
        
        // Aplicar regras de prioridade
        if (contemTrabalho) {
            categoria = 'trabalho';
        } else if (contemLocal && contemPedidoSugestao) {
            categoria = 'sugestoes_locais';
        } else {
            // Se não identificamos claramente com as regras, usamos o classificador ML
            const classificacao = classifier.classificar(mensagem);
            categoria = classificacao.categoria;
        }

        // Log da categoria identificada
        console.log('Categoria identificada:', categoria);

        // Processar a resposta de acordo com a categoria
        let resposta;
        switch (categoria) {
            case 'sugestoes_locais':
                // Buscar informações no Google Maps
                try {
                    console.log('Buscando locais para:', mensagem);
                    const lugares = await GoogleMapsService.buscarLocais(mensagem);
                    
                    console.log('Resultado da busca de locais:', lugares);
                    
                    if (lugares && lugares.length > 0) {
                        const lugarDestaque = lugares[0];
                        resposta = `Sugestão: ${lugarDestaque.nome} - Nota ${lugarDestaque.avaliacao}, localizado em ${lugarDestaque.endereco}`;
                    } else {
                        resposta = "Desculpe, não encontrei lugares correspondentes à sua busca.";
                    }
                } catch (error) {
                    console.error('Erro detalhado ao buscar locais:', error);
                    resposta = "Desculpe, não foi possível buscar locais neste momento.";
                }
                break;

            case 'perguntas_gerais':
                // Gerar resposta usando OpenAI
                try {
                    resposta = await OpenAIService.gerarResposta(
                        "Respondendo de forma informativa e educacional: ",
                        mensagem
                    );
                } catch (error) {
                    console.error('Erro ao gerar resposta:', error);
                    resposta = "Desculpe, não foi possível gerar uma resposta neste momento.";
                }
                break;

            case 'trabalho':
                resposta = "Mensagem classificada como trabalho. Nenhuma consulta externa necessária.";
                break;

            default: // 'outros'
                resposta = "Mensagem classificada como outros. Nenhuma consulta externa necessária.";
        }

        return res.status(200).json({
            categoria,
            resposta
        });
    } catch (error) {
        console.error('Erro ao classificar mensagem:', error);
        return res.status(500).json({ erro: "Erro interno ao classificar a mensagem." });
    }
};

module.exports = {
    processarConversa,
    classificarMensagem,
    encontrarGrupoRelevante
};