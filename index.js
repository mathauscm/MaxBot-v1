const express = require('express');
const { initWhatsAppClient } = require('./src/config/whatsappConfig');
const webRoutes = require('./src/routes/webRoutes');

const app = express();
const port = 3000;

// Inicializar rotas web
app.use('/', webRoutes);

// Inicializar cliente WhatsApp
const client = initWhatsAppClient();

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor WhatsApp rodando em http://localhost:${port}`);
});