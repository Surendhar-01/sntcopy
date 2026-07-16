const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', 'server', '.env.development') });

async function testRefill() {
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

    // 1. Reset baseline for this product
    console.log('Resetting GNR-15K to baseline: stock=5, sold=0, opening_stock=5...');
    await connection.query(
      'UPDATE products SET stock = 5, sold = 0, opening_stock = 5 WHERE code = ?',
      [productCode]
    );

    // Fetch and show baseline state
    let [rows] = await connection.query('SELECT name, stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('Baseline state:', rows[0]);

    // 2. Perform a refill of 10 units
    const refillQty1 = 10;
    console.log(`\nPerforming refill of ${refillQty1} units...`);
    // Exact SQL query from our implementation
    await connection.query(
      'UPDATE products SET opening_stock = stock + ?, stock = stock + ? WHERE code = ?',
      [refillQty1, refillQty1, productCode]
    );

    [rows] = await connection.query('SELECT stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('After refill 1:', rows[0]);
    // Expecting opening_stock = 5 + 10 = 15, stock = 5 + 10 = 15, sold = 0.
    const expectedOS1 = 15;
    const expectedStock1 = 15;
    if (rows[0].opening_stock !== expectedOS1 || rows[0].stock !== expectedStock1) {
      throw new Error(`Refill 1 failed: Expected opening_stock=${expectedOS1}, stock=${expectedStock1}, got opening_stock=${rows[0].opening_stock}, stock=${rows[0].stock}`);
    }
    console.log('Refill 1 matches expected values exactly!');

    // 3. Sell 3 units
    const soldQty = 3;
    console.log(`\nMaking a sale of ${soldQty} units...`);
    await connection.query(
      'UPDATE products SET stock = GREATEST(0, stock - ?), sold = sold + ? WHERE code = ?',
      [soldQty, soldQty, productCode]
    );

    [rows] = await connection.query('SELECT stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('After sale:', rows[0]);
    // Expecting opening_stock = 15, stock = 12, sold = 3.
    if (rows[0].opening_stock !== 15 || rows[0].stock !== 12 || rows[0].sold !== 3) {
      throw new Error(`Sale failed: Expected opening_stock=15, stock=12, sold=3, got opening_stock=${rows[0].opening_stock}, stock=${rows[0].stock}, sold=${rows[0].sold}`);
    }
    console.log('Sale matches expected values exactly!');

    // 4. Perform a second refill of 8 units
    const refillQty2 = 8;
    console.log(`\nPerforming second refill of ${refillQty2} units...`);
    await connection.query(
      'UPDATE products SET opening_stock = stock + ?, stock = stock + ? WHERE code = ?',
      [refillQty2, refillQty2, productCode]
    );

    [rows] = await connection.query('SELECT stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('After refill 2:', rows[0]);
    // Expecting:
    // opening_stock = current_stock (12) + refillQty (8) = 20.
    // stock = current_stock (12) + refillQty (8) = 20.
    // sold = 3 (remains unchanged, and is not added to opening_stock).
    const expectedOS2 = 20;
    const expectedStock2 = 20;
    if (rows[0].opening_stock !== expectedOS2 || rows[0].stock !== expectedStock2) {
      throw new Error(`Refill 2 failed: Expected opening_stock=${expectedOS2}, stock=${expectedStock2}, got opening_stock=${rows[0].opening_stock}, stock=${rows[0].stock}`);
    }
    console.log('Refill 2 matches expected values exactly! opening_stock is updated to current_stock + refillQty, and sold has NOT been added.');

    // 5. Delete refill (rolling back refill 2: -8 qty)
    console.log(`\nReverting refill 2 (deleting refill)...`);
    await connection.query(
      'UPDATE products SET opening_stock = GREATEST(0, opening_stock - ?), stock = GREATEST(0, stock - ?) WHERE code = ?',
      [refillQty2, refillQty2, productCode]
    );

    [rows] = await connection.query('SELECT stock, sold, opening_stock FROM products WHERE code = ?', [productCode]);
    console.log('After deleting refill 2:', rows[0]);
    if (rows[0].opening_stock !== 12 || rows[0].stock !== 12) {
      throw new Error(`Delete refill failed: Expected opening_stock=12, stock=12, got opening_stock=${rows[0].opening_stock}, stock=${rows[0].stock}`);
    }
    console.log('Delete refill matches expected values exactly!');

    // Restore baseline to stay clean
    await connection.query(
      'UPDATE products SET stock = 5, sold = 0, opening_stock = 0 WHERE code = ?',
      [productCode]
    );
    console.log('\nRestored clean state. All tests passed successfully!');
  } finally {
    await connection.end();
  }
}

testRefill().catch(console.error);
