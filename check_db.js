import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function check() {
  const envPath = path.resolve(__dirname, '.env.development');
  dotenv.config({ path: envPath });

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'erp',
    port: Number(process.env.DB_PORT || 3306)
  });

  const tables = ['users', 'accounts', 'products', 'bills', 'customers', 'sales', 'refills', 'price_history', 'login_logs', 'settings'];
  
  for (const table of tables) {
    try {
      const [schema] = await connection.query(`DESCRIBE \`${table}\``);
      console.log(`--- ${table} Table ---`);
      console.log(`${table} exists.`);
    } catch (err) {
      console.error(`--- ${table} Table ---`);
      console.error(`${table} MISSING or error:`, err.message);
    }
  }

  try {
    const [billsCount] = await connection.query('SELECT COUNT(*) as count FROM bills');
    console.log('\nTotal bills:', billsCount[0].count);
  } catch (err) {
    console.error('Failed to count bills:', err.message);
  }

  try {
    const [productsCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    console.log('Total products:', productsCount[0].count);
  } catch (err) {
    console.error('Failed to count products:', err.message);
  }

  await connection.end();
}

check().catch(console.error);
