const express = require('express');
const qrcode = require('qrcode-terminal');
require('dotenv').config();
const { LocalAuth, Client } = require('whatsapp-web.js');
const rulesChat = require('./database');
const OpenAi = require('openai');

const getRulesBasedResponse = (message) => {
   const userMessage = message.slice(3).toLowerCase().trim();
   
   for (const [key, response] of Object.entries(rulesChat)) {
      if (userMessage.includes(key.toLowerCase())) {
         return response;
      }
   }

   return rulesChat['default'];
}

const openai = new OpenAi({
   apiKey: process.env.OPENAI_API_KEY,
   baseURL: process.env.OPENAI_BASE_URL,
});

const getAIResponse = async (message) => {
   try {
      console.log('Memproses permintaan AI:', message);
      const userMessage = message.slice(3).trim();
      const response = await openai.chat.completions.create({
         model: 'openai/gpt-4.5-preview',
         messages: [{ role: 'user', content: userMessage }],
         max_tokens: 50,
      });

      console.log('AI Response:', response.choices[0].message.content);
      return response.choices[0].message.content;
   } catch (error) {
      console.error('Error saat memproses permintaan AI:', error);
      return 'Maaf, terjadi kesalahan saat memproses permintaan Anda.';
   }
}

const whatsapp = new Client({
   authStrategy: new LocalAuth({ clientId: "rama-bot" }),
  puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
   },
})

whatsapp.on('qr', (qr) => {
   qrcode.generate(qr, { small: true });
});

whatsapp.on('ready', () => {
   console.log('WhatsApp client is ready!');
});

whatsapp.on('message', async(msg) => {
   if(!msg.from.includes('@c.us')) {
      console.log('Pesan masuk bukan dari pengguna chat pribadi, mengabaikan...');
      return;
   }
   if(msg.body.startsWith('rb:')) {
      const response = getRulesBasedResponse(msg.body);
      whatsapp.sendMessage(msg.from, response);
      return;
   }
   if(msg.body.startsWith('ai:')) {
      const aiResponse = await getAIResponse(msg.body);
      whatsapp.sendMessage(msg.from, aiResponse);
      return;
   }

   return;
})

whatsapp.initialize();

const app = express();
const PORT =  process.env.PORT || 3000;

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
})