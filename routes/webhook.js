const { getBotReply } = require('../services/faqService');

async function webhookHandler(req, res) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  const { message } = JSON.parse(body);
  const reply = getBotReply(message || "");

  console.log(`User: ${message}`);
  console.log(`Bot: ${reply}`);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ reply }));
}

module.exports = { webhookHandler };