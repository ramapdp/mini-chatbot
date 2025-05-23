const express = require('express');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { LocalAuth, Client} = require('whatsapp-web.js');
const { getBotReply } = require('./services/faqService');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable auto-restart functionality
let restartCount = 0;
const MAX_RESTARTS = 5;

function initializeWhatsAppClient() {
  console.log(`Initializing WhatsApp client (attempt ${restartCount + 1}/${MAX_RESTARTS + 1})`);
  
  const whatsappClient = new Client({
    authStrategy: new LocalAuth({ clientId: "rama-bot" }),
    puppeteer: { 
      headless: true, 
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-software-rasterizer',
        '--window-size=1280,1080',
        '--disable-features=site-per-process',
        '--js-flags=--max-old-space-size=500'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      timeout: 60000  // Increase timeout to 60 seconds
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2408.7.html'
    }
  });

  whatsappClient.on('qr', (qr) => {
    console.log('QR Code received:');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('authenticated', () => {
    console.log('Sudah ada yang scan broo...');
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('Authentication failed, please check your credentials:', msg);
  });

  whatsappClient.on('disconnected', (reason) => {
    console.log('Client was logged out:', reason);
    
    // Try to reconnect if haven't exceeded max restarts
    if (restartCount < MAX_RESTARTS) {
      restartCount++;
      console.log(`Attempting to restart WhatsApp client in 5 seconds...`);
      setTimeout(initializeWhatsAppClient, 5000);
    } else {
      console.error(`Exceeded maximum restart attempts (${MAX_RESTARTS}). Please check system resources and restart container.`);
    }
  });

  whatsappClient.on('ready', () => {
    console.log('Ayooo coba kirim pesan ke bot ini...');
    // Reset restart count on successful connection
    restartCount = 0;
  });

  whatsappClient.on('message', async (msg) => {
    console.log(`Pesan dari ${msg.from}: ${msg.body}`);
    const sender = msg.from;
    if (sender.includes('@g.us')) {
      console.log('Pesan dari grup, tidak akan diproses.');
      return;
    }
    
    try {
      if (sender.includes('6282188829638')) {
        await whatsappClient.sendMessage(sender, 'jangenam lu ner!');
        return;
      }
      if (sender.includes('6285934607493') && msg.body.startsWith('!')) {
        await whatsappClient.sendMessage(sender, 'oi');
        return;
      }
      if(sender.includes('6282185772065')){
        try {
          const reply = await getBotReply(msg.body.toLowerCase());
          await whatsappClient.sendMessage(sender, reply);
        } catch (replyError) {
          console.error('Error getting bot reply:', replyError.message);
          await whatsappClient.sendMessage(sender, 'Maaf, sedang ada masalah dengan sistem.');
        }
        return;
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
      try {
        // Fallback to direct message without reply
        await whatsappClient.sendMessage(sender, 'Maaf, ada masalah sistem. Silakan coba lagi nanti.');
      } catch (fallbackError) {
        console.error('Error sending fallback message:', fallbackError.message);
      }
    }
  });

  whatsappClient.initialize().catch(err => {
    console.error('Failed to initialize WhatsApp client:', err);
    if (restartCount < MAX_RESTARTS) {
      restartCount++;
      console.log(`Initialization failed. Attempting to restart in 10 seconds...`);
      setTimeout(initializeWhatsAppClient, 10000);
    }
  });

  return whatsappClient;
}

// Initialize the WhatsApp client
const whatsappClient = initializeWhatsAppClient();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});