const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', 'server', '.env.development') });

const backupTable = 'data_reset_backups';
const backupTables = [
  'products',
  'bills',
  'bill_items',
  'customers',
  'sales',
  'transactions',
  'shift_sales',
  'sales_summaries',
  'sales_reports',
  'shift_reports',
];

const deleteTables = [
  'bill_items',
  'bills',
  'customers',
  'sales',
  'transactions',
  'shift_sales',
  'sales_summaries',
  'sales_reports',
  'shift_reports',
];

async function main() {
  const dbName = process.env.DB_DATABASE || process.env.DB_NAME || 'erp';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USERNAME || process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: dbName,
    port: Number(process.env.DB_PORT || 3306),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    dateStrings: true,
  });

  try {
    await connection.query(
      `CREATE TABLE IF NOT EXISTS \`${backupTable}\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`reason\` VARCHAR(255) NOT NULL,
        \`payload\` LONGTEXT NOT NULL
      ) ENGINE=InnoDB`,
    );

    await connection.beginTransaction();

    const [existingTableRows] = await connection.query(
      `SELECT TABLE_NAME
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME IN (?)`,
      [backupTables],
    );
    const existingTables = new Set(existingTableRows.map((row) => String(row.TABLE_NAME)));

    const backup = {};
    for (const tableName of backupTables) {
      if (!existingTables.has(tableName)) continue;
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      backup[tableName] = rows;
    }

    const [backupResult] = await connection.query(
      `INSERT INTO \`${backupTable}\` (reason, payload, created_at) VALUES (?, ?, NOW())`,
      [
        'manual-zero-stock-reset',
        JSON.stringify({
          createdAt: new Date().toISOString(),
          tables: backup,
        }),
      ],
    );

    for (const tableName of deleteTables) {
      if (!existingTables.has(tableName)) continue;
      await connection.query(`DELETE FROM \`${tableName}\``);
    }

    await connection.query('UPDATE products SET opening_stock = 0, stock = 0, sold = 0');

    const [summaryRows] = await connection.query(
      `SELECT
        COUNT(*) AS productCount,
        COALESCE(SUM(opening_stock), 0) AS openingStockTotal,
        COALESCE(SUM(stock), 0) AS currentStockTotal,
        COALESCE(SUM(sold), 0) AS soldTotal
       FROM products`,
    );

    await connection.commit();

    console.log(
      JSON.stringify(
        {
          success: true,
          backupId: backupResult.insertId,
          ...summaryRows[0],
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await connection.rollback();
    console.error(error);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();
