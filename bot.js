// === bot.js ===
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { getBotReply } = require('./services/faqService');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

// Make sure the auth directory exists
const AUTH_DIR = './auth';
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR);
}

async function startBot() {
  console.log('Starting bot...');
  
  // Using the new auth state method
  console.log('Loading auth state...');
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  
  console.log('Creating socket connection...');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // QR ditampilkan di terminal
  });

  console.log('Registering event handlers...');
  // Simpan sesi login dengan method baru
  sock.ev.on('creds.update', saveCreds);

  // Terima pesan
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message) return;

    const sender = msg.key.remoteJid;
    const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;

    console.log(`📩 Pesan dari ${sender}: ${messageText}`);

    const reply = getBotReply(messageText || '');
    await sock.sendMessage(sender, { text: reply });
  });

  // Handle koneksi
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('QR Code received:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

      console.log('❌ Koneksi terputus. Reconnect?', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Bot terhubung ke WhatsApp!');
    }
  });
}

startBot();