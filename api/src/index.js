require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { runFullSync } = require('./sync');

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));
app.use('/api', routes);

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[api] DevOps Dashboard API escuchando en :${PORT}`);

  // Sincronización inicial al arrancar
  try {
    console.log('[api] Ejecutando sincronización inicial...');
    await runFullSync();
  } catch (err) {
    console.error('[api] Error en sync inicial:', err.message);
  }
});
