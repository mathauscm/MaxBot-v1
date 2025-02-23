# MaxBot - Chatbot Inteligente para WhatsApp com ML e NLP

MaxBot é um chatbot avançado para WhatsApp que utiliza Machine Learning e Processamento de Linguagem Natural para fornecer respostas contextuais inteligentes. Integrado com OpenAI e Google Maps, o bot oferece desde respostas a perguntas gerais até recomendações precisas de locais.

## ✨ Características Principais

- **Classificação Inteligente de Mensagens**
  - Categorização por Machine Learning em 4 categorias:
    - Trabalho (prioridade máxima)
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

## 🚀 Começando

### Pré-requisitos

- Node.js (v18.20.5)
- Google Chrome instalado
- Conta no WhatsApp
- Chaves de API:
  - OpenAI API Key
  - Google Maps API Key

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/mathauscm/maxbot.git
cd maxbot
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo .env:
```env
OPENAI_API_KEY=sua_chave_openai
GOOGLE_MAPS_API_KEY=sua_chave_google_maps
PORT=3000
```

4. Inicie o bot:
```bash
npm start
```

5. Escaneie o QR Code que aparecerá em:
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
src/
├── config/
│   ├── enviroment.js         # Configurações de ambiente
│   └── whatsappConfig.js     # Configuração do cliente WhatsApp
├── controllers/
│   ├── botController.js      # Controlador principal do bot
│   ├── classifierData.js     # Manipulação de dados classificados
│   └── extractMessagePayload.js # Extração de dados das mensagens
├── db/
│   ├── data/
│   │   └── general_history.json # Histórico geral de mensagens
│   └── classificationMensages/
│       └── classificationByTime.json # Mensagens classificadas
├── services/
│   ├── classifier/
│   │   ├── classifier.js     # Classificador ML
│   │   ├── ml-training.js    # Treinamento do modelo
│   │   └── DadosTreinamento/ # Datasets de treino
│   ├── google/
│   │   └── googleMapsService.js # Integração Google Maps
│   ├── openai/
│   │   └── openAiService.js  # Integração OpenAI
│   └── mentionHandlerService.js # Processador de menções
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

## ⚙️ Desenvolvimento

### Scripts Disponíveis

```bash
npm start      # Inicia o bot
npm run dev    # Inicia em modo desenvolvimento
npm test       # Executa os testes
```

### Testes
O projeto inclui testes unitários para o classificador ML usando Chai:
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

* **Mathaus Carvalho** - [GitHub](https://github.com/mathauscm)

## 🎁 Agradecimentos

* OpenAI pela API GPT
* Google Maps Platform
* Comunidade Node.js e WhatsApp-web.js

---

Desenvolvido com ❤️ por Mathaus Carvalho


