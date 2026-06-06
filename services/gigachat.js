const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

let client = null;

function getCredentials() {
  const credentials = process.env.GIGACHAT_CREDENTIALS;
  if (!credentials) {
    throw new Error('GIGACHAT_CREDENTIALS не задан в .env');
  }
  return credentials;
}

async function getClient() {
  if (!client) {
    const { GigaChat } = require('gigachat');
    client = new GigaChat({
      credentials: getCredentials(),
      scope: process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS',
      model: process.env.GIGACHAT_MODEL || 'GigaChat',
      httpsAgent
    });
  }
  return client;
}

async function chatCompletion(messages) {
  const giga = await getClient();
  const response = await giga.chat({
    messages,
    temperature: 0.35,
    max_tokens: 1500
  });
  const content = response?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Пустой ответ от GigaChat');
  return String(content).trim();
}

module.exports = { chatCompletion };
