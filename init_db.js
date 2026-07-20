import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server', '.env.development') });

async function run() {
  const databaseName = process.env.DB_DATABASE || process.env.DB_NAME || 'erp';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME || process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 3306),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true
  });

  const rawSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const sql = rawSql
    .replace(/CREATE DATABASE IF NOT EXISTS `[^`]+`;\s*/i, '')
    .replace(/USE `[^`]+`;\s*/i, '');
  
  console.log(`Initializing database ${databaseName}...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
  await connection.query(`USE \`${databaseName}\``);
  
  // Drop all existing tables to prevent foreign key errors from leftover projects
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  const [tables] = await connection.query('SHOW TABLES');
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    console.log(`Dropping table: ${tableName}`);
    await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
  }
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  await connection.query(sql);
  
  console.log('Database initialized successfully with schema.sql');
  await connection.end();
}

run().catch(console.error);
