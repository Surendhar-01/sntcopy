const path = require('path');
const app = require('./app');
const { initializeDatabase } = require('./db');
const { migrateLegacyAccountPasswords } = require('./services/authService');

const port = process.env.PORT || 5001;

async function startServer() {
  try {
    await initializeDatabase();
    await migrateLegacyAccountPasswords();
    await require('./db').pool.query('SELECT 1');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
