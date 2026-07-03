const { pool } = require('../db');
const { verifyPassword, hashPassword } = require('../utils');

async function login(username, password) {
  if (!username || !password) {
    const error = new Error('Username and password are required');
    error.status = 400;
    throw error;
  }

  const [rows] = await pool.query(
    'SELECT id, user, pass, role FROM accounts WHERE LOWER(TRIM(user)) = LOWER(TRIM(?)) LIMIT 1',
    [username]
  );

  if (!rows.length) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const account = rows[0];
  if (!verifyPassword(password, account.pass)) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  if (!account.pass.startsWith('scrypt$')) {
    const updatedHash = hashPassword(password);
    await pool.query('UPDATE accounts SET pass = ? WHERE id = ?', [updatedHash, account.id]);
  }

  return { user: account.user, role: account.role };
}

async function migrateLegacyAccountPasswords() {
  const [rows] = await pool.query('SELECT id, pass FROM accounts');
  for (const account of rows) {
    if (!account.pass || account.pass.startsWith('scrypt$')) continue;
    const updatedHash = hashPassword(account.pass);
    await pool.query('UPDATE accounts SET pass = ? WHERE id = ?', [updatedHash, account.id]);
  }
}

module.exports = {
  login,
  migrateLegacyAccountPasswords
};