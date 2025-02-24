const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swaggerConfig');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();
const port = 3001;

// Middleware para processar JSON
app.use(express.json());

// Rota do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Inicializar rotas da API
app.use('/api', apiRoutes);

// Rota raiz para verificar se a API está funcionando
app.get('/', (req, res) => {
    res.json({
        status: 'API online',
        swagger: 'Visite /api-docs para documentação'
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor API rodando em http://localhost:${port}`);
    console.log(`Documentação Swagger disponível em http://localhost:${port}/api-docs`);
});


