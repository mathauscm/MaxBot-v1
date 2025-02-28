/**
 * @fileoverview Módulo para agrupamento de mensagens baseado em intervalos de tempo.
 * @module message-grouping
 */

/**
 * Agrupa mensagens em diferentes grupos com base em intervalos de tempo.
 * As mensagens são agrupadas quando o intervalo entre elas é menor ou igual a 30 minutos.
 * Um novo grupo é criado quando o intervalo entre duas mensagens consecutivas excede 30 minutos.
 * 
 * @function agruparMensagens
 * @param {Array<Object>} conversas - Array de objetos de conversas contendo mensagens.
 * @param {Object} conversas[].message - Objeto de mensagem dentro da conversa.
 * @param {number} conversas[].message.timestamp - Timestamp Unix (em segundos) da mensagem.
 * @returns {Array<Array<Object>>} Array de grupos, onde cada grupo é um array de mensagens relacionadas temporalmente.
 * @example
 * // Exemplo de uso:
 * const mensagens = [
 *   { message: { timestamp: 1612345678 } }, // 3 de fevereiro de 2021, 12:01:18
 *   { message: { timestamp: 1612345978 } }, // 3 de fevereiro de 2021, 12:06:18 (5 min depois)
 *   { message: { timestamp: 1612348578 } }  // 3 de fevereiro de 2021, 12:49:38 (43 min depois)
 * ];
 * const grupos = agruparMensagens(mensagens);
 * // Resultado: [ [mensagem1, mensagem2], [mensagem3] ]
 */
function agruparMensagens(conversas) {
    // Verifica se o array está vazio
    if (conversas.length === 0) return [];

    const grupos = [];
    let grupoAtual = [conversas[0]];
    
    for (let i = 1; i < conversas.length; i++) {
        // Usa o timestamp diretamente do payload
        const mensagemAtual = new Date(conversas[i].message.timestamp * 1000);
        const mensagemAnterior = new Date(conversas[i-1].message.timestamp * 1000);
        
        const diferenca = (mensagemAtual - mensagemAnterior) / 1000 / 60; // diferença em minutos
        
        if (diferenca > 30) {
            grupos.push(grupoAtual);
            grupoAtual = [];
        }
        
        grupoAtual.push(conversas[i]);
    }
    
    if (grupoAtual.length > 0) {
        grupos.push(grupoAtual);
    }
    
    return grupos;
}

module.exports = {
    agruparMensagens
};