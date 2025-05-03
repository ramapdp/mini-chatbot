const { welcomeHandler } = require('./routes/welcome');
const { webhookHandler } = require('./routes/webhook');
const { healthHandler } = require('./routes/health');

const router = {
  'GET /': welcomeHandler,
  'POST /webhook': webhookHandler,
  'GET /health': healthHandler
};

module.exports = { router };
