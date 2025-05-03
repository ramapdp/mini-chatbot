function welcomeHandler(req, res) {
   res.writeHead(200, { 'Content-Type': 'text/html' });
   res.end('<h1>Selamat Datang di Chatbot FAQ</h1>');
 }
 
 module.exports = { welcomeHandler };