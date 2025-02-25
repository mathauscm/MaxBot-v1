/**
 * @fileoverview Módulo para gerenciamento de sessões do whatsapp-web.js.
 * @module session-cleaner
 * @requires fs
 * @requires path
 */

const fs = require('fs')
const path = require('path')

/**
 * Remove o diretório de autenticação da sessão do whatsapp-web.js.
 * Esta função exclui recursivamente todos os arquivos e diretórios dentro do caminho .wwebjs_auth
 * localizado dois níveis acima do diretório atual do script.
 * 
 * @function limparSessaoAntiga
 * @returns {void}
 * @throws {Error} Pode lançar erro se não for possível acessar ou excluir os arquivos de sessão.
 * @example
 * // Exemplo de uso:
 * const { limparSessaoAntiga } = require('./caminho/para/este/arquivo');
 * limparSessaoAntiga(); // Remove a pasta .wwebjs_auth
 */
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