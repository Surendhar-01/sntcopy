const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', 'server', '.env.development') });

async function verifyRepeatedRefills() {
  const dbName = process.env.DB_DATABASE || 'defaultdb';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME || process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    port: Number(process.env.DB_PORT || 3306),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const productCode = 'GNR-15K';

    // 1. Initial State: Current Stock = 100, Sold = 15, Opening Stock = 100
    console.log('Setting baseline: Current Stock = 100, Sold = 15, Opening Stock = 100');
    await connection.query(
      'UPDATE products SET stock = 100, sold = 15, opening_stock = 100 WHERE code = ?',
      [productCode]
    );

    let [rows] = await connection.query('SELECT stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('Initial State:', rows[0]);

    // Refill 1: +20
    console.log('\nRefill 1: +20');
    await connection.query(
      'UPDATE products SET opening_stock = stock + ?, stock = stock + ? WHERE code = ?',
      [20, 20, productCode]
    );
    [rows] = await connection.query('SELECT stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('State:', rows[0]);
    if (rows[0].stock !== 120 || rows[0].opening_stock !== 120) throw new Error('Refill 1 validation failed');

    // Refill 2: +30
    console.log('\nRefill 2: +30');
    await connection.query(
      'UPDATE products SET opening_stock = stock + ?, stock = stock + ? WHERE code = ?',
      [30, 30, productCode]
    );
    [rows] = await connection.query('SELECT stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('State:', rows[0]);
    if (rows[0].stock !== 150 || rows[0].opening_stock !== 150) throw new Error('Refill 2 validation failed');

    // Refill 3: +10
    console.log('\nRefill 3: +10');
    await connection.query(
      'UPDATE products SET opening_stock = stock + ?, stock = stock + ? WHERE code = ?',
      [10, 10, productCode]
    );
    [rows] = await connection.query('SELECT stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('State:', rows[0]);
    if (rows[0].stock !== 160 || rows[0].opening_stock !== 160) throw new Error('Refill 3 validation failed');

    // Refill 4: +40
    console.log('\nRefill 4: +40');
    await connection.query(
      'UPDATE products SET opening_stock = stock + ?, stock = stock + ? WHERE code = ?',
      [40, 40, productCode]
    );
    [rows] = await connection.query('SELECT stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('State:', rows[0]);
    if (rows[0].stock !== 200 || rows[0].opening_stock !== 200) throw new Error('Refill 4 validation failed');

    // Verify Sold remains 15
    if (rows[0].sold !== 15) throw new Error('Sold count changed unexpectedly!');
    console.log('\nSold units remained unchanged at 15. All verification rules are perfectly met!');

    // Clean up
    await connection.query(
      'UPDATE products SET stock = 5, sold = 0, opening_stock = 0 WHERE code = ?',
      [productCode]
    );
  } finally {
    await connection.end();
  }
}

verifyRepeatedRefills().catch(console.error);
