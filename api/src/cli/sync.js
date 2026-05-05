/**
 * CLI para ejecutar sync manualmente: node src/cli/sync.js
 */
const { runFullSync } = require('../sync');

runFullSync()
  .then((result) => {
    console.log('Sync completado:', result);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Sync fallido:', err);
    process.exit(1);
  });
