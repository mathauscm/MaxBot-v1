/**
 * @fileoverview Testes de integração para os endpoints da API.
 * @module api-integration-tests
 * @requires chai
 * @requires axios
 * @requires express
 * @requires http
 * @requires ../routes/apiRoutes
 */

const { expect } = require('chai');
const axios = require('axios');
const express = require('express');
const http = require('http');
const apiRoutes = require('../routes/apiRoutes');

/**
 * URL base para os testes da API.
 * @constant {string}
 */
const API_URL = 'http://localhost:3001/api';

/**
 * Servidor HTTP para os testes.
 * @type {http.Server}
 */
let server;

/**
 * Suite de testes principal para os endpoints da API.
 * Inclui configuração do servidor de teste e verificações de diferentes rotas.
 * @namespace APITests
 */
describe('API Endpoints Tests', function () {
    
    /**
     * Aumenta o timeout para 10 segundos para todos os testes nesta suite.
     * @memberof APITests
     */
    this.timeout(10000);

    /**
     * Configura e inicia o servidor Express antes de executar os testes.
     * @function before
     * @memberof APITests
     * @param {Function} done - Callback chamado quando o servidor estiver pronto.
     */
    before(function (done) {
        const app = express();
        app.use(express.json());
        app.use('/api', apiRoutes);

        server = http.createServer(app);
        server.listen(3001, () => {
            console.log('Servidor de teste iniciado na porta 3001');
            done();
        });
    });

    /**
     * Encerra o servidor após a execução de todos os testes.
     * @function after
     * @memberof APITests
     * @param {Function} done - Callback chamado quando o servidor for encerrado.
     */
    after(function (done) {
        if (server) {
            server.close(() => {
                console.log('Servidor de teste encerrado');
                done();
            });
        } else {
            done();
        }
    });

    /**
     * Testes para o endpoint de processamento de conversas.
     * @namespace ProcessarConversaTests
     * @memberof APITests
     */
    describe('POST /processar_conversa', () => {
        /**
         * Testa se o endpoint processa corretamente uma conversa e responde a uma pergunta específica.
         * @function
         * @memberof APITests.ProcessarConversaTests
         * @async
         */
        it('deve processar uma conversa e responder a uma pergunta', async () => {
            /**
             * Dados de exemplo para o teste, incluindo uma conversa e uma pergunta.
             * @type {Object}
             */
            const data = {
                "conversa": [
                    {"usuario": "João", "mensagem": "Oi, pessoal! Vamos marcar a reunião?", "hora_envio": "2025-02-18T09:00:00"},
                    {"usuario": "Maria", "mensagem": "Bom dia! Tudo bem. Que tal às 14h?", "hora_envio": "2025-02-18T09:01:00"},
                    {"usuario": "Carlos", "mensagem": "14h está ótimo para mim.", "hora_envio": "2025-02-18T09:02:30"},
                    {"usuario": "Ana", "mensagem": "Por mim também.", "hora_envio": "2025-02-18T09:03:15"},
                    {"usuario": "João", "mensagem": "Perfeito! Então, reunião marcada para às 14h.", "hora_envio": "2025-02-18T09:04:00"},
                    {"usuario": "Carlos", "mensagem": "Ótimo! Até lá.", "hora_envio": "2025-02-18T09:05:45"},
                    {"usuario": "Ana", "mensagem": "Até mais!", "hora_envio": "2025-02-18T09:07:00"},
                    {"usuario": "Maria", "mensagem": "Até logo.", "hora_envio": "2025-02-18T09:08:30"},
                    {"usuario": "Carlos", "mensagem": "Vocês viram o último jogo de xadrez do Magnus Carlsen?", "hora_envio": "2025-02-18T10:00:00"},
                    {"usuario": "João", "mensagem": "Sim! Que partida incrível! Ele jogou muito bem.", "hora_envio": "2025-02-18T10:01:45"},
                    {"usuario": "Maria", "mensagem": "Ele é realmente um gênio do xadrez. Fiquei impressionada com a estratégia dele.", "hora_envio": "2025-02-18T10:03:30"},
                    {"usuario": "Ana", "mensagem": "Também achei! Não vejo a hora de assistir o próximo torneio.", "hora_envio": "2025-02-18T10:05:00"},
                    {"usuario": "Carlos", "mensagem": "Com certeza! Quem sabe marcamos de assistir juntos?", "hora_envio": "2025-02-18T10:06:45"},
                    {"usuario": "João", "mensagem": "Ótima ideia! Vamos combinar.", "hora_envio": "2025-02-18T10:08:30"},
                    {"usuario": "Maria", "mensagem": "Combinado! Até mais tarde, pessoal.", "hora_envio": "2025-02-18T10:10:00"},
                    {"usuario": "Ana", "mensagem": "Até logo!", "hora_envio": "2025-02-18T10:11:15"}
                ],
                "pergunta": "Que horas será a reunião?"
            };
        
            const response = await axios.post(`${API_URL}/processar_conversa`, data);
        
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('resposta');
            expect(response.data.resposta).to.include('14h');
            expect(response.data.resposta).to.include('Maria');
        });
    });

    /**
     * Testes para o endpoint de classificação de mensagens.
     * @namespace ClassificarMensagemTests
     * @memberof APITests
     */
    describe('POST /classificar_mensagem', () => {
        /**
         * Testa a classificação de uma mensagem relacionada a sugestões de locais.
         * @function
         * @memberof APITests.ClassificarMensagemTests
         * @async
         */
        it('deve classificar uma mensagem sobre locais', async () => {
            const data = {
                "mensagem": "Onde fica um bom restaurante para almoçar?"
            };

            const response = await axios.post(`${API_URL}/classificar_mensagem`, data);

            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('categoria');
            expect(response.data.categoria).to.equal('sugestoes_locais');
        });

        /**
         * Testa a classificação de uma mensagem relacionada ao trabalho.
         * @function
         * @memberof APITests.ClassificarMensagemTests
         * @async
         */
        it('deve classificar uma mensagem sobre trabalho', async () => {
            const data = {
                "mensagem": "Preciso revisar um relatório urgente para o cliente."
            };

            const response = await axios.post(`${API_URL}/classificar_mensagem`, data);

            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('categoria');
            expect(response.data.categoria).to.equal('trabalho');
        });

        /**
         * Testa se o classificador prioriza corretamente quando uma mensagem contém múltiplas categorias.
         * @function
         * @memberof APITests.ClassificarMensagemTests
         * @async
         */
        it('deve priorizar trabalho quando há múltiplas categorias', async () => {
            const data = {
                "mensagem": "Onde fica um bom restaurante para almoçar? Preciso também revisar um relatório urgente para o cliente."
            };

            const response = await axios.post(`${API_URL}/classificar_mensagem`, data);

            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('categoria');
            expect(response.data.categoria).to.equal('trabalho');
        });

        /**
         * Testa a classificação de uma mensagem genérica de conhecimento geral.
         * Este teste possui um timeout aumentado devido à possível complexidade da análise.
         * @function
         * @memberof APITests.ClassificarMensagemTests
         * @async
         */
        it('deve lidar com mensagens genéricas', async function () {
            // Aumentar o timeout para este teste específico
            this.timeout(5000);  // Aumenta o timeout para 5 segundos

            const data = {
                "mensagem": "Como funciona um motor de foguete?"
            };

            const response = await axios.post(`${API_URL}/classificar_mensagem`, data);

            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('categoria');
            expect(response.data.categoria).to.equal('perguntas_gerais');

            // Adicionar verificação adicional para a resposta
            expect(response.data).to.have.property('resposta');
            expect(response.data.resposta).to.be.a('string');
            expect(response.data.resposta.length).to.be.greaterThan(0);
        });
    });
});