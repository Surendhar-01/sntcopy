const { pool } = require('../db');

async function listProducts() {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
  return rows;
}

async function createProduct(product) {
  const { code, name, cat, unit, price = 0, stock = 0, image = '' } = product;
  const [result] = await pool.query(
    'INSERT INTO products (code, name, cat, unit, price, stock, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
    [code, name, cat, unit, price, stock, image]
  );
  return { id: result.insertId };
}

async function updateProductPrice(productId, nextPrice, userName) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query('SELECT name, price FROM products WHERE id = ? LIMIT 1', [productId]);
    if (!rows.length) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    const product = rows[0];
    await connection.query('UPDATE products SET price = ? WHERE id = ?', [nextPrice, productId]);
    await connection.query(
      'INSERT INTO price_history (`date`, `product`, `old`, `new`, `by_user`, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [new Date(), product.name, Number(product.price || 0), nextPrice, userName || 'system']
    );
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteProduct(productId) {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [productId]);
  if (!result.affectedRows) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  return { success: true };
}

module.exports = {
  listProducts,
  createProduct,
  updateProductPrice,
  deleteProduct
};