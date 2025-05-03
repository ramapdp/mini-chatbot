const faqDatabase = {
   "harga": "Harga produk kami mulai dari Rp100.000.",
   "produk": "Kami menawarkan berbagai produk elektronik dan fashion.",
   "refund": "Proses refund maksimal 7 hari kerja setelah pembelian."
 };
 
 function fallbackReply() {
   return "Maaf, saya belum mengerti.\n\nMungkin Anda mau tanya tentang:\n- Harga\n- Produk\n- Refund\n\nSilakan ketik kata kunci tersebut.";
 }
 
 function getBotReply(userMessage) {
   const text = userMessage.toLowerCase();
   const responses = [];
 
   for (let keyword in faqDatabase) {
     if (text.includes(keyword)) {
       responses.push(faqDatabase[keyword]);
     }
   }
 
   return responses.length > 0 ? responses.join('\n') : fallbackReply();
 }
 
 module.exports = { getBotReply };