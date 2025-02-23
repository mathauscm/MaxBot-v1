// função para agrupar mensagens em diferentes grupos
// sendo estes grupos divididos por intervalo de tempo de 30 min

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