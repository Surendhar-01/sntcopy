const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, './server/.env.development') });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'sridb',
    port: Number(process.env.DB_PORT || 3306)
  });

  try {
    const [accounts] = await connection.query('SELECT id, user, pass, role FROM accounts');
    console.log('ACCOUNTS:');
    console.log(JSON.stringify(accounts, null, 2));

    const [logs] = await connection.query('SELECT * FROM login_logs ORDER BY id DESC LIMIT 10');
    console.log('LOGIN LOGS (last 10):');
    console.log(JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await connection.end();
  }
}

run();
