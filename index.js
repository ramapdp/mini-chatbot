const http = require('http');
const { router } = require('./router');
const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const key = `${req.method} ${req.url}`;
  const handler = router[key];

  if (handler) {
    await handler(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
