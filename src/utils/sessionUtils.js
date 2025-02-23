const fs = require('fs')
const path = require('path')

function limparSessaoAntiga() {
    const SESSION_FILE_PATH = path.join(__dirname, '../../.wwebjs_auth');
    try {
        if (fs.existsSync(SESSION_FILE_PATH)) {
            fs.rmSync(SESSION_FILE_PATH, { recursive: true, force: true });
            console.log('Sessão antiga removida com sucesso.');
        }
    } catch (err) {
        console.error('Erro ao limpar sessão antiga:', err);
    }
}

module.exports = { limparSessaoAntiga }