try {
  require('./src/chat');
  console.log('chat.js OK');
  require('./src/routes');
  console.log('routes.js OK');
} catch (e) {
  console.error('ERROR:', e.message);
}
process.exit(0);
