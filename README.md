# MaxBot 🤖 
# Chatbot Inteligente para WhatsApp com ML e NLP

MaxBot é um chatbot avançado para WhatsApp que utiliza Machine Learning e Processamento de Linguagem Natural para fornecer respostas contextuais inteligentes. Integrado com OpenAI e Google Maps, o bot oferece desde respostas a perguntas gerais até recomendações precisas de locais.

## ✨ Características Principais

- **Classificação Inteligente de Mensagens**
  - Categorização por Machine Learning em 4 categorias:
    - Trabalho 
    - Sugestões de locais
    - Perguntas gerais
    - Outros
  - Agrupamento temporal de conversas (30 minutos de intervalo)
  - Análise contextual de mensagens

- **Integrações Inteligentes**
  - OpenAI GPT para respostas contextuais
  - Google Maps API para recomendações de locais
  - Sistema de menções (@MaxBot ou @558585707591)

- **Comandos do Bot**
  - !ping - Teste de resposta
  - !help - Lista de comandos
  - !hora - Mostra hora atual
  - !dados - Informações do grupo
  - !meusdados - Dados do usuário
  - !msginfo - Detalhes da mensagem
  - !meuhistorico - Mostra Historico do usuário

## 🚀 Começando

### Pré-requisitos

- Node.js (v18.20.5)
- Google Chrome instalado
- Conta no WhatsApp
- Chaves de API:
  - OpenAI API Key
  - Google Maps API Key

### Instalação 🔧

1. Clone o repositório: 📥
```bash
git clone https://github.com/mathauscm/MaxBot-v1.git
cd maxbot
```

2. Instale as dependências: 💻
```bash
npm install
```

3. Configure o arquivo .env: 🔑
```env
OPENAI_API_KEY=sua_chave_openai
GOOGLE_MAPS_API_KEY=sua_chave_google_maps
PORT=4000
```

4. Inicie o bot: ▶️
```bash
npm start
```

5. Escaneie o QR Code que aparecerá em: 📲
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
src/
├── config/
│   ├── enviroment.js         # Configurações de ambiente
│   ├── whatsappConfig.js     # Configuração do cliente WhatsApp
│   └── swaggerConfig.js      # Configuração do swagger
├── controllers/
│   ├── apiController.js         # Controlador API Rest
│   ├── botController.js         # Controlador principal do bot
│   ├── classifierData.js        # Manipulação de dados classificados
│   └── extractMessagePayload.js # Extração de dados das mensagens
├── db/
│   ├── data/
│   │   └── general_history.json # Histórico geral de mensagens
│   └── classificationMensages/
│       └── classificationByTime.json # Mensagens classificadas
├── routes/
│   ├── apiRoutes.js # Definição de rotas API
│   └── webRoutes.js # Definição rotas app WhatsApp
├── services/
│   ├── classifier/
│   │   ├── classifier.js     # Classificador ML
│   │   ├── ml-training.js    # Treinamento do modelo
│   │   └── DadosTreinamento/ # Datasets de treino
│   ├── google/
│   │   └── googleMapsService.js # Integração Google Maps
│   ├── openai/
│   │   └── openAiService.js     # Integração OpenAI
│   └── mentionHandlerService.js # Processador de menções
├──test/
│  ├── api.test.js            # Teste API REST
│  └── classification.test.js # Teste de classificação NLP Machine Learning
└── utils/
    ├── chatUtils.js          # Utilitários de chat
    ├── sessionUtils.js       # Gestão de sessão
    └── systemUtils.js        # Utilitários do sistema
```

## 🤖 Usando o Bot

### Processamento de Mensagens
- O bot classifica automaticamente todas as mensagens recebidas
- Mensagens são agrupadas por categoria e tempo
- Histórico completo é mantido para análise

### Menções ao Bot
- Use @MaxBot ou @558585707591 seguido de sua pergunta
- Para locais: "Onde tem uma pizzaria boa?"
- Para perguntas gerais: "Como funciona fotossíntese?"
- Para trabalho: "Como organizar uma reunião eficiente?"

### Exemplos de Uso
```
Usuário: "@MaxBot onde tem uma boa pizzaria?"
Bot: "Encontrei estas opções para você:
1. Pizzaria Bella Napoli
   Endereço: Rua Example, 123
   Avaliação: 4.5 ⭐ (234 avaliações)
   Status: Aberto agora"

Usuário: "@MaxBot explique o que é machine learning"
Bot: [Resposta detalhada da OpenAI sobre machine learning]
```
# API REST

Além do bot WhatsApp, o MaxBot também fornece uma API REST para processamento de conversas e classificação de mensagens.

## Endpoints

### Processar Conversa

Processa uma conversa de grupo e responde a uma pergunta com base no contexto mais relevante.

```http
POST /api/processar_conversa
```

**Corpo da requisição:**
```json
{
  "conversa": [
    {"usuario": "João", "mensagem": "Oi, pessoal! Vamos marcar a reunião?", "hora_envio": "2025-02-18T09:00:00"},
    {"usuario": "Maria", "mensagem": "Bom dia! Tudo bem. Que tal às 14h?", "hora_envio": "2025-02-18T09:01:00"},
    {"usuario": "Carlos", "mensagem": "14h está ótimo para mim.", "hora_envio": "2025-02-18T09:02:30"},
    {"usuario": "João", "mensagem": "Perfeito! Então, reunião marcada para às 14h.", "hora_envio": "2025-02-18T09:04:00"}
  ],
  "pergunta": "Que horas será a reunião?"
}
```

**Resposta:**
```json
{
  "resposta": "A reunião será às 14h, conforme sugerido por Maria."
}
```

### Classificar Mensagem

Classifica uma mensagem em categorias (trabalho, sugestões de locais, perguntas gerais, outros) e fornece resposta adequada.

```http
POST /api/classificar_mensagem
```

**Corpo da requisição:**
```json
{
  "mensagem": "Onde fica um bom restaurante para almoçar?"
}
```

**Resposta para sugestões de locais:**
```json
{
  "categoria": "sugestoes_locais",
  "resposta": "Sugestão: Restaurante Gourmet - Nota 4.8, localizado em Av. Principal, 123."
}
```

**Resposta para trabalho:**
```json
{
  "categoria": "trabalho",
  "resposta": "Mensagem classificada como trabalho. Nenhuma consulta externa necessária."
}
```

**Resposta para perguntas gerais:**
```json
{
  "categoria": "perguntas_gerais",
  "resposta": "A inteligência artificial é um campo da ciência da computação focado em criar sistemas que simulam a capacidade humana de aprendizado e raciocínio."
}
```

## Hierarquia de Prioridades

As mensagens são classificadas seguindo a hierarquia:
1. Trabalho (prioridade máxima)
2. Sugestões de locais
3. Perguntas gerais
4. Outros

Se uma mensagem contiver elementos de múltiplas categorias, a de maior prioridade será escolhida.

## Exemplos de Uso

### Exemplo com curl

```bash
curl -X POST http://localhost:3000/api/classificar_mensagem \
  -H "Content-Type: application/json" \
  -d '{"mensagem": "Onde fica um bom restaurante para almoçar?"}'
```
# Exemplo PowerShell
```bash
Invoke-RestMethod -Uri "http://localhost:3001/api/classificar_mensagem" -Method Post -ContentType "application/json" -Body '{"mensagem": "Meu carro está fazendo um barulho estranho."}'
```


## ⚙️ Desenvolvimento

### Scripts Disponíveis

```bash
npm start          # Inicia o bot
npm run dev        # Inicia em modo desenvolvimento
npm test           # Executa os testes
node api-server.js # Inicia bot API rest
```

### Testes
O projeto inclui testes unitários para o API e classificador ML usando Chai e Mocha:
```bash
npm test
```


## 📈 Machine Learning

- Classificador baseado em TF-IDF
- Análise de padrões específicos por categoria
- Sistema de pontuação ponderada
- Treinamento com datasets customizados

## 🔐 Segurança

- Autenticação segura via QR Code
- Sessões persistentes com LocalAuth
- Sanitização de inputs
- Tratamento de erros robusto

## 📄 Licença

Este projeto está sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.

## ✒️ Autor

* **Mathaus Carvalho** - [GitHub](https://github.com/mathauscm) | [mathaus.dev](https://mathaus.dev/)

## 🎁 Agradecimentos

* Maximiza Tecnologias - [Maximiza Tecnologias](https://www.maximizatecnologias.com/)
* Comunidade Node.js   - [Comunidade Node.js](https://nodejs.org/)
* WhatsApp-web.js      - [WhatsApp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
* Puppeteer            - [Puppeteer](https://github.com/puppeteer/puppeteer)

---

Desenvolvido por Mathaus Carvalho

---

_"Jesus é o caminho, a verdade e a vida."_✝️


