const os = require('os')

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