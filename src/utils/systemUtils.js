/**
 * @fileoverview Módulo para obter o caminho do Google Chrome baseado no sistema operacional.
 * @module chrome-path
 * @requires os
 */

const os = require('os')

/**
 * Retorna o caminho para o executável do Google Chrome com base no sistema operacional atual.
 * Suporta Windows (win32), macOS (darwin) e Linux.
 * 
 * @function getChromePath
 * @returns {string} O caminho para o executável do Google Chrome.
 * @throws {Error} Lança um erro se o Google Chrome não for encontrado ou se o sistema operacional não for suportado.
 * @example
 * // Exemplo de uso:
 * const { getChromePath } = require('./caminho/para/este/arquivo');
 * try {
 *   const chromePath = getChromePath();
 *   console.log(`Chrome encontrado em: ${chromePath}`);
 * } catch (error) {
 *   console.error('Erro:', error.message);
 * }
 */
function getChromePath() {
    const platform = os.platform()
    let chromePath;

    if (platform === 'win32') {
        chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
    if (platform === 'darwin') {
        chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    }
    if (platform === 'linux') {
        chromePath = '/usr/bin/google-chrome'
    }
    if (!chromePath) {
        throw new Error('Navegador Google Chrome não encontrado')
    }
    return chromePath
}

module.exports = { getChromePath }