const { pool } = require('../db');

async function fetchAllData() {
  const connection = await pool.getConnection();
  try {
    const [products] = await connection.query('SELECT * FROM products ORDER BY id DESC');
    const [bills] = await connection.query('SELECT * FROM bills ORDER BY date DESC');
    const [customers] = await connection.query('SELECT * FROM customers ORDER BY id DESC');
    const [sales] = await connection.query('SELECT * FROM sales ORDER BY date DESC');
    const [refills] = await connection.query('SELECT * FROM refills ORDER BY date DESC');
    const [priceHistory] = await connection.query('SELECT * FROM price_history ORDER BY date DESC');
    const [accounts] = await connection.query('SELECT id, user, role FROM accounts ORDER BY id ASC');
    const [settings] = await connection.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
    const [loginLogs] = await connection.query("SELECT * FROM login_logs ORDER BY id DESC");

    return {
      products,
      bills,
      customers,
      sales,
      refills,
      priceHistory,
      accounts,
      settings: settings[0] || {},
      loginLogs
    };
  } finally {
    connection.release();
  }
}

module.exports = {
  fetchAllData
};