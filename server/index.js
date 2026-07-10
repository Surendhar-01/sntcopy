const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');

const envCandidates = [
  path.resolve(process.cwd(), '.env.development'),
  path.resolve(__dirname, '.env.development')
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate)) || envCandidates[0];
dotenv.config({ path: envPath });
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { generateShiftExcelReport } = require('./utils/excelReportGenerator');

const app = express();
const port = process.env.PORT || 5001;
const dbName = process.env.DB_DATABASE || process.env.DB_NAME || 'erp';
const dbPort = Number(process.env.DB_PORT || 3306);
const runtimeMailEnvKeys = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_SENDER_EMAIL',
  'SMTP_FROM',
  'SMTP_PASS',
  'SMTP_PASSWORD',
  'MAIL_USER',
  'MAIL_FROM',
  'MAIL_APP_PASSWORD',
  'MAIL_PASSWORD',
  'SHIFT_REPORT_EMAIL'
];

function refreshRuntimeMailEnv() {
  if (!fs.existsSync(envPath)) {
    return;
  }

  let parsedEnv = {};
  try {
    parsedEnv = dotenv.parse(fs.readFileSync(envPath));
  } catch (error) {
    console.warn('Unable to refresh runtime mail environment:', error.message);
    return;
  }

  for (const key of runtimeMailEnvKeys) {
    if (Object.prototype.hasOwnProperty.call(parsedEnv, key)) {
      process.env[key] = parsedEnv[key];
    }
  }
}

function isHashedPassword(storedPassword) {
  return typeof storedPassword === 'string' && storedPassword.startsWith('scrypt$');
}

function hashPassword(password) {
  const plain = String(password || '');
  const salt = crypto.randomBytes(16).toString('hex');
  const N = 16384;
  const r = 8;
  const p = 1;
  const derivedKey = crypto.scryptSync(plain, salt, 64, { N, r, p }).toString('hex');
  return `scrypt$${N}$${r}$${p}$${salt}$${derivedKey}`;
}

function verifyPassword(password, storedPassword) {
  const plain = String(password || '');
  const stored = String(storedPassword || '');

  if (!isHashedPassword(stored)) {
    return plain === stored;
  }

  const [prefix, nStr, rStr, pStr, salt, hashHex] = stored.split('$');
  if (prefix !== 'scrypt' || !salt || !hashHex) {
    return false;
  }

  const N = Number(nStr || 16384);
  const r = Number(rStr || 8);
  const p = Number(pStr || 1);
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(plain, salt, expected.length, { N, r, p });

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
}

function toMysqlDateTime(value) {
  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return now.toLocaleString('sv').replace('T', ' ').slice(0, 19);
  }

  return parsed.toLocaleString('sv').replace('T', ' ').slice(0, 19);
}





function parseItems(rawItems) {
  if (Array.isArray(rawItems)) {
    return rawItems;
  }

  if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}



function getPaymentBreakdown(bills) {
  return bills.reduce((accumulator, bill) => {
    const key = String(bill.payment || 'Unknown').trim() || 'Unknown';
    accumulator[key] = Number(accumulator[key] || 0) + Number(bill.grand || 0);
    return accumulator;
  }, {});
}

function getRemainingStockSummary(productRows, soldByProductId, refillByProductName) {
  const products = productRows.map((product) => {
    const soldInShift = Number(soldByProductId.get(Number(product.id)) || 0);
    const refilledInShift = Number(refillByProductName.get(String(product.name || '').trim()) || 0);
    const currentStock = Number(product.stock || 0);
    const estimatedOpeningStock = currentStock - refilledInShift + soldInShift;
    const status = currentStock === 0 ? 'Out of Stock' : currentStock <= 5 ? 'Low Stock' : 'Healthy';

    return {
      id: Number(product.id),
      name: product.name,
      category: product.cat || '',
      unit: product.unit || '',
      price: Number(product.price || 0),
      estimatedOpeningStock,
      soldInShift,
      refilledInShift,
      currentStock,
      status
    };
  });

  return {
    totals: {
      totalProducts: products.length,
      healthyCount: products.filter((product) => product.status === 'Healthy').length,
      lowStockCount: products.filter((product) => product.status === 'Low Stock').length,
      outOfStockCount: products.filter((product) => product.status === 'Out of Stock').length
    },
    products
  };
}



function getSmtpConfig() {
  refreshRuntimeMailEnv();

  const host = String(process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(
    process.env.SMTP_USER ||
    process.env.SMTP_SENDER_EMAIL ||
    process.env.MAIL_USER ||
    ''
  ).trim();
  const pass = String(
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.MAIL_APP_PASSWORD ||
    process.env.MAIL_PASSWORD ||
    ''
  ).trim();
  const from = String(process.env.SMTP_FROM || process.env.MAIL_FROM || user).trim();
  const secure = String(process.env.SMTP_SECURE || '').trim().toLowerCase() === 'true' || port === 465;

  if (!host || !port || !user || !pass || !from) {
    throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER/MAIL_USER, SMTP_PASS/MAIL_APP_PASSWORD and SMTP_FROM in server env.');
  }

  return {
    host,
    port,
    secure,
    from,
    auth: {
      user,
      pass
    }
  };
}

async function sendShiftReportEmail({ recipient, subject, text, html, attachments }) {
  const smtpConfig = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth
  });

  return transporter.sendMail({
    from: smtpConfig.from,
    to: recipient,
    subject,
    text,
    html,
    attachments
  });
}


async function getNextBillNo(connection) {
  const [rows] = await connection.query(
    "SELECT billNo FROM bills WHERE billNo LIKE 'SNT-%' ORDER BY CAST(SUBSTRING_INDEX(billNo, '-', -1) AS UNSIGNED) DESC LIMIT 1"
  );

  const current = rows?.[0]?.billNo || '';
  const match = String(current).match(/SNT-(\d+)/i);
  const seq = match ? Number(match[1]) + 1 : 1000;
  return `SNT-${String(seq).padStart(4, '0')}`;
}

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Sri Nikil ERP API',
    status: 'ok',
    docs: '/docs'
  });
});

app.get('/docs', (req, res) => {
  res.json({
    name: 'Sri Nikil ERP API',
    baseUrl: '/api',
    endpoints: [
      'GET /api/db',
      'POST /api/auth/login',
      'POST /api/bills',
      'DELETE /api/bills/:id',
      'DELETE /api/bills',
      'POST /api/refills',
      'DELETE /api/refills/:id',
      'DELETE /api/refills',
      'PUT /api/products/:id/price',
      'POST /api/products',
      'DELETE /api/products/:id',
      'DELETE /api/price-history/:id',
      'DELETE /api/price-history',
      'POST /api/accounts',
      'PUT /api/accounts/:user/password',
      'DELETE /api/accounts/:user',
      'DELETE /api/customers',
      'POST /api/login-logs',
      'PUT /api/login-logs/:id/logout',
      'POST /api/shifts/start',
      'POST /api/shifts/end',
      'DELETE /api/login-logs/:id',
      'DELETE /api/login-logs',
      'PUT /api/settings'
    ]
  });
});

// --- Initialize Database ---
async function initializeDatabase() {
  const tempConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: dbPort
  });

  try {
    // 1. Create database if it doesn't exist
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

    // 2. Select the database
    await tempConnection.query(`USE \`${dbName}\``);

    // 3. Define and ensure all required tables exist
    const tableDefinitions = {
      users: `CREATE TABLE IF NOT EXISTS \`users\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`username\` VARCHAR(255) NOT NULL UNIQUE, \`password\` VARCHAR(255) NOT NULL, \`role\` VARCHAR(50) NOT NULL DEFAULT 'User', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      accounts: `CREATE TABLE IF NOT EXISTS \`accounts\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`user\` VARCHAR(255) NOT NULL UNIQUE, \`pass\` VARCHAR(255) NOT NULL, \`role\` VARCHAR(50) NOT NULL DEFAULT 'Staff', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      products: `CREATE TABLE IF NOT EXISTS \`products\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`name\` VARCHAR(255) NOT NULL, \`code\` VARCHAR(100) UNIQUE, \`cat\` VARCHAR(100), \`unit\` VARCHAR(50), \`price\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`stock\` INT NOT NULL DEFAULT 0, \`sold\` INT NOT NULL DEFAULT 0, \`image\` TEXT, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      bills: `CREATE TABLE IF NOT EXISTS \`bills\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`billNo\` VARCHAR(255) NOT NULL, \`customer\` VARCHAR(255), \`phone\` VARCHAR(20), \`payment\` VARCHAR(50), \`date\` DATETIME NOT NULL, \`subtotal\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`cgst\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`sgst\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`grand\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`items\` LONGTEXT, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      customers: `CREATE TABLE IF NOT EXISTS \`customers\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`name\` VARCHAR(255) NOT NULL, \`phone\` VARCHAR(50) UNIQUE, \`visits\` INT NOT NULL DEFAULT 0, \`total\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`firstVisit\` DATETIME, \`lastVisit\` DATETIME, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      sales: `CREATE TABLE IF NOT EXISTS \`sales\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`billNo\` VARCHAR(255), \`customer\` VARCHAR(255), \`product\` VARCHAR(255), \`qty\` INT NOT NULL DEFAULT 0, \`amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      refills: `CREATE TABLE IF NOT EXISTS \`refills\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`product\` VARCHAR(255), \`qty\` INT NOT NULL DEFAULT 0, \`by\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      price_history: `CREATE TABLE IF NOT EXISTS \`price_history\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`product\` VARCHAR(255), \`old\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`new\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`by\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      login_logs: `CREATE TABLE IF NOT EXISTS \`login_logs\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`user\` VARCHAR(255), \`role\` VARCHAR(50), \`loginTime\` DATETIME, \`logoutTime\` DATETIME, \`status\` VARCHAR(50) NOT NULL DEFAULT 'Active', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      shift_reports: `CREATE TABLE IF NOT EXISTS \`shift_reports\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`session_id\` INT NULL, \`user\` VARCHAR(255) NOT NULL, \`role\` VARCHAR(50) NOT NULL DEFAULT 'Staff', \`shift_start\` DATETIME NOT NULL, \`shift_end\` DATETIME NOT NULL, \`total_bills\` INT NOT NULL DEFAULT 0, \`total_items_sold\` INT NOT NULL DEFAULT 0, \`total_sales_amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`payment_breakdown\` JSON NULL, \`remaining_stock_summary\` JSON NULL, \`report_email\` VARCHAR(255) NULL, \`report_subject\` VARCHAR(255) NULL, \`email_status\` VARCHAR(50) NOT NULL DEFAULT 'pending', \`email_error\` TEXT NULL, \`email_sent_at\` DATETIME NULL, \`status\` VARCHAR(50) NOT NULL DEFAULT 'Completed', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      settings: `CREATE TABLE IF NOT EXISTS \`settings\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`gst\` DECIMAL(5, 2) NOT NULL DEFAULT 0.00, \`shop\` VARCHAR(255), \`addr\` TEXT, \`gstin\` VARCHAR(100), \`fssai\` VARCHAR(100), \`phone\` VARCHAR(100), \`logo\` TEXT, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`
    };

    for (const [tableName, query] of Object.entries(tableDefinitions)) {
      try {
        await tempConnection.query(query);
      } catch (err) {
        console.warn(`Failed to create/verify table ${tableName}:`, err.message);
      }
    }

    // Ensure default admin and manager accounts exist (use plain passwords; they'll be hashed on migrate)
    try {
      const [adminRows] = await tempConnection.query("SELECT 1 FROM accounts WHERE LOWER(TRIM(user)) = 'admin' LIMIT 1");
      if (adminRows.length === 0) {
        await tempConnection.query("INSERT INTO accounts (`user`,`pass`,`role`) VALUES (?, ?, ?)", ['admin', 'Admin@SNT2026!', 'Admin']);
      }

      const [managerRows] = await tempConnection.query("SELECT 1 FROM accounts WHERE LOWER(TRIM(user)) = 'manager' LIMIT 1");
      if (managerRows.length === 0) {
        await tempConnection.query("INSERT INTO accounts (`user`,`pass`,`role`) VALUES (?, ?, ?)", ['manager', 'Manager@SNT2026!', 'Manager']);
      }
    } catch (err) {
      console.warn('Failed to ensure default accounts exist:', err.message);
    }

    // 4. Handle migrations / refinements
    // firstVisit for customers
    const [customerCols] = await tempConnection.query(
      'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
      [dbName, 'customers', 'firstVisit']
    );
    if (customerCols.length === 0) {
      await tempConnection.query('ALTER TABLE `customers` ADD COLUMN firstVisit DATETIME NULL AFTER total');
    }

    // billNo uniqueness removal (if desired by earlier code logic)
    const [billNoUniqueIndexes] = await tempConnection.query(
      `SELECT INDEX_NAME FROM information_schema.statistics WHERE table_schema = ? AND table_name = 'bills' AND column_name = 'billNo' AND non_unique = 0`,
      [dbName]
    );
    for (const indexRow of billNoUniqueIndexes) {
      if (indexRow?.INDEX_NAME) {
        await tempConnection.query(`ALTER TABLE \`bills\` DROP INDEX \`${indexRow.INDEX_NAME}\``);
      }
    }

    // login_logs device column cleanup
    const [deviceCols] = await tempConnection.query(
      'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
      [dbName, 'login_logs', 'device']
    );
    if (deviceCols.length > 0) {
      await tempConnection.query('ALTER TABLE `login_logs` DROP COLUMN `device`');
    }

    // login_logs status column migration
    const [loginLogsStatusCols] = await tempConnection.query(
      'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
      [dbName, 'login_logs', 'status']
    );
    if (loginLogsStatusCols.length === 0) {
      await tempConnection.query("ALTER TABLE `login_logs` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'Active'");
    }

    // shift_reports status column migration
    const [shiftReportsStatusCols] = await tempConnection.query(
      'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
      [dbName, 'shift_reports', 'status']
    );
    if (shiftReportsStatusCols.length === 0) {
      await tempConnection.query("ALTER TABLE `shift_reports` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'Completed'");
    }

  } finally {
    await tempConnection.end();
  }
}

// --- Database Connection Pool ---
// Using a pool is better for performance and managing multiple connections
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const schemaSqlPath = path.resolve(process.cwd(), 'schema.sql');
const schemaExportTableOrder = [
  'users',
  'accounts',
  'products',
  'bills',
  'customers',
  'sales',
  'refills',
  'price_history',
  'login_logs',
  'shift_reports',
  'settings'
];
let schemaExportPromise = Promise.resolve();

function escapeSqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  if (Buffer.isBuffer(value)) {
    return `X'${value.toString('hex')}'`;
  }

  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
  }

  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function normalizeAccountRowForSchemaExport(row) {
  if (!row || typeof row !== 'object') {
    return row;
  }

  const username = String(row.user || '').trim();
  if (!username) {
    return row;
  }

  if (username.toLowerCase() === 'admin' && verifyPassword('Admin@SNT2026!', row.pass)) {
    return { ...row, pass: 'Admin@SNT2026!' };
  }

  if (username.toLowerCase() === 'manager' && verifyPassword('Manager@SNT2026!', row.pass)) {
    return { ...row, pass: 'Manager@SNT2026!' };
  }

  const staffMatch = username.match(/^staff(\d+)$/i);
  if (!staffMatch) {
    return row;
  }

  const defaultPassword = `Staff${staffMatch[1]}@SNT2026!`;
  if (!verifyPassword(defaultPassword, row.pass)) {
    return row;
  }

  return { ...row, pass: defaultPassword };
}

function normalizeSchemaExportRow(tableName, row) {
  if (tableName === 'accounts') {
    return normalizeAccountRowForSchemaExport(row);
  }

  return row;
}

function buildInsertStatements(tableName, columns, rows) {
  if (!rows.length) {
    return [];
  }

  const columnSql = columns.map((column) => `\`${column}\``).join(', ');
  return rows.map((row) => {
    const normalizedRow = normalizeSchemaExportRow(tableName, row);
    const valuesSql = columns.map((column) => escapeSqlValue(normalizedRow[column])).join(', ');
    return `INSERT INTO \`${tableName}\` (${columnSql}) VALUES (${valuesSql});`;
  });
}

async function readSchemaTableSnapshot(connection, tableName) {
  const [existsRows] = await connection.query(
    'SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1',
    [dbName, tableName]
  );

  if (existsRows.length === 0) {
    return null;
  }

  const [createRows] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
  const [columnRows] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
  const hasIdColumn = columnRows.some((column) => column.Field === 'id');
  const [dataRows] = await connection.query(
    `SELECT * FROM \`${tableName}\`${hasIdColumn ? ' ORDER BY id ASC' : ''}`
  );

  return {
    createSql: createRows[0]['Create Table'],
    columns: columnRows.map((column) => column.Field),
    rows: dataRows
  };
}

async function writeSchemaSqlSnapshot() {
  const connection = await pool.getConnection();

  try {
    const lines = [
      '-- ERP Database Schema',
      '-- Auto-synced from live MySQL database',
      `-- ${new Date().toISOString()}`,
      '',
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`,
      `USE \`${dbName}\`;`,
      '',
      'SET FOREIGN_KEY_CHECKS=0;',
      ''
    ];

    for (const [index, tableName] of schemaExportTableOrder.entries()) {
      const snapshot = await readSchemaTableSnapshot(connection, tableName);

      if (!snapshot) {
        continue;
      }

      lines.push('-- ---------------------------------------------------------');
      lines.push(`-- ${index + 1}. Table: ${tableName}`);
      lines.push('-- ---------------------------------------------------------');
      lines.push(`DROP TABLE IF EXISTS \`${tableName}\`;`);
      lines.push(`${snapshot.createSql};`);
      lines.push('');

      const inserts = buildInsertStatements(tableName, snapshot.columns, snapshot.rows);
      if (inserts.length > 0) {
        lines.push(`-- Data for ${tableName}`);
        if (tableName === 'accounts') {
          lines.push('-- Default account passwords are exported in plain form and hashed on server startup.');
        }
        lines.push(...inserts);
        lines.push('');
      }
    }

    lines.push('SET FOREIGN_KEY_CHECKS=1;');
    lines.push('');

    fs.writeFileSync(schemaSqlPath, lines.join('\n'), 'utf8');
  } finally {
    connection.release();
  }
}

async function syncSchemaSql(reason) {
  schemaExportPromise = schemaExportPromise
    .catch(() => {})
    .then(async () => {
      try {
        await writeSchemaSqlSnapshot();
        console.log(`schema.sql synced after ${reason}`);
      } catch (error) {
        console.error(`Failed to sync schema.sql after ${reason}:`, error);
      }
    });

  await schemaExportPromise;
}

async function migrateLegacyAccountPasswords() {
  const [tableRows] = await pool.query(
    'SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1',
    [dbName, 'accounts']
  );

  if (tableRows.length === 0) {
    return;
  }

  const [rows] = await pool.query('SELECT id, pass FROM accounts');
  for (const account of rows) {
    if (!isHashedPassword(account.pass)) {
      const upgradedHash = hashPassword(account.pass || '');
      await pool.query('UPDATE accounts SET pass = ? WHERE id = ?', [upgradedHash, account.id]);
    }
  }
}

// --- API Endpoint to fetch all data ---
// This matches the proxy target in your Vite config
app.get('/api/db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Fetch all data from tables in parallel for efficiency
      const [products, bills, users, customers, sales, refills, priceHistory, accounts, settings, loginLogs] = await Promise.all([
        connection.query('SELECT * FROM products ORDER BY id DESC'),
        connection.query('SELECT * FROM bills ORDER BY date DESC'),
        connection.query('SELECT * FROM users'),
        connection.query('SELECT * FROM customers ORDER BY id DESC'),
        connection.query('SELECT * FROM sales ORDER BY date DESC'),
        connection.query('SELECT * FROM refills ORDER BY date DESC'),
        connection.query('SELECT * FROM price_history ORDER BY date DESC'),
        connection.query('SELECT id, user, role FROM accounts ORDER BY id ASC'),
        connection.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1'),
        connection.query("SELECT * FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) <> 'admin' ORDER BY id DESC")
      ]);

      // Send the data back in the format the frontend expects
      res.json({
        products: products[0],
        bills: bills[0],
        users: users[0],
        customers: customers[0],
        sales: sales[0],
        refills: refills[0],
        priceHistory: priceHistory[0],
        accounts: accounts[0],
        settings: settings[0]?.[0] || {},
        loginLogs: loginLogs[0]
      });
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching data from DB:', error);
    res.status(500).json({ error: 'Failed to fetch data from database' });
  }
});

// --- Granular Resource Endpoints ---
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/bills', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bills ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/refills', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM refills ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching refills:', error);
    res.status(500).json({ error: 'Failed to fetch refills' });
  }
});

app.get('/api/price-history', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM price_history ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

app.get('/api/login-logs', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) <> 'admin' ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ error: 'Failed to fetch login logs' });
  }
});

app.get('/api/accounts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, user, role FROM accounts ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});


// --- Authentication ---
app.post('/api/auth/login', async (req, res) => {
  const { user, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM accounts WHERE LOWER(TRIM(user)) = LOWER(TRIM(?)) LIMIT 1',
      [user]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const account = rows[0];
    const validPassword = verifyPassword(password, account.pass);

    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!isHashedPassword(account.pass)) {
      const upgradedHash = hashPassword(password);
      await pool.query('UPDATE accounts SET pass = ? WHERE id = ?', [upgradedHash, account.id]);
    }

    res.json({ user: account.user, role: account.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Auth failure' });
  }
});

// --- API write endpoints for persistence ---
app.post('/api/bills', async (req, res) => {
  const { billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, items, by_user } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const saleDate = toMysqlDateTime(date);

    let billNoToUse = String(billNo || '').trim();
    if (!billNoToUse) {
      billNoToUse = await getNextBillNo(connection);
    } else {
      const [existing] = await connection.query(
        'SELECT id FROM bills WHERE billNo = ? LIMIT 1',
        [billNoToUse]
      );
      if (existing.length > 0) {
        billNoToUse = await getNextBillNo(connection);
      }
    }

    const [result] = await connection.query(
      'INSERT INTO bills (billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, items, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [billNoToUse, customer, phone, payment, saleDate, subtotal, cgst, sgst, grand, JSON.stringify(items || []), by_user]
    );

    // Update stock for each item
    if (Array.isArray(items)) {
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?), sold = sold + ? WHERE id = ?',
          [item.qty, item.qty, item.id]
        );
        // Insert into item-wise sales table
        await connection.query(
          'INSERT INTO sales (date, billNo, customer, product, qty, amount, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
          [saleDate, billNoToUse, customer || null, item.name, item.qty, item.total || (item.qty * item.price), by_user || null]
        );
      }
    }

    // optionally maintain customers table
    if (customer) {
      await connection.query(
        'INSERT INTO customers (`name`, `phone`, `visits`, `total`, `firstVisit`, `lastVisit`) VALUES (?, ?, 1, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `visits` = `visits` + 1, `total` = `total` + VALUES(`total`), `firstVisit` = IFNULL(LEAST(`firstVisit`, VALUES(`firstVisit`)), VALUES(`firstVisit`)), `lastVisit` = IFNULL(GREATEST(`lastVisit`, VALUES(`lastVisit`)), VALUES(`lastVisit`))',
        [customer, phone || null, grand || 0, saleDate, saleDate]
      );
    }

    await connection.commit();
    await syncSchemaSql('create bill');
    res.json({ id: result.insertId, billNo: billNoToUse });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to insert bill:', error);
    res.status(500).json({ error: 'Unable to save bill' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/bills/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch the bill to get items
    const [bills] = await connection.query('SELECT * FROM bills WHERE id = ?', [req.params.id]);
    if (bills.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = bills[0];
    const items = typeof bill.items === 'string' ? JSON.parse(bill.items) : bill.items;

    // 2. Revert stock
    if (Array.isArray(items)) {
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ?, sold = GREATEST(0, sold - ?) WHERE id = ?',
          [item.qty, item.qty, item.id]
        );
      }
    }

    // 3. Delete the bill
    await connection.query('DELETE FROM bills WHERE id = ?', [req.params.id]);
    await connection.query('DELETE FROM sales WHERE billNo = ?', [bill.billNo]);

    await connection.commit();
    await syncSchemaSql('delete bill');
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to delete bill:', error);
    res.status(500).json({ error: 'Unable to delete bill' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/bills', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bills] = await connection.query('SELECT items FROM bills');
    const rollbackByProductId = new Map();

    for (const bill of bills) {
      const parsedItems = typeof bill.items === 'string' ? JSON.parse(bill.items || '[]') : (bill.items || []);
      if (!Array.isArray(parsedItems)) {
        continue;
      }

      for (const item of parsedItems) {
        const productId = Number(item.id);
        const qty = Number(item.qty || 0);
        if (!Number.isFinite(productId) || !Number.isFinite(qty) || qty <= 0) {
          continue;
        }

        rollbackByProductId.set(productId, (rollbackByProductId.get(productId) || 0) + qty);
      }
    }

    for (const [productId, qty] of rollbackByProductId.entries()) {
      await connection.query(
        'UPDATE products SET stock = stock + ?, sold = GREATEST(0, sold - ?) WHERE id = ?',
        [qty, qty, productId]
      );
    }

    await connection.query('DELETE FROM bills');
    await connection.query('DELETE FROM customers');
    await connection.query('DELETE FROM sales');

    await connection.commit();
    await syncSchemaSql('clear bills');
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to clear bills:', error);
    res.status(500).json({ error: 'Unable to clear bills' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/refills', async (req, res) => {
  const { product, qty, by, by_user, date } = req.body;
  const refillQty = Number.parseInt(qty, 10);
  if (!product || !Number.isFinite(refillQty) || refillQty <= 0) {
    return res.status(400).json({ error: 'Product and positive quantity are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [updateResult] = await connection.query(
      'UPDATE products SET stock = stock + ? WHERE name = ?',
      [refillQty, product]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Product not found for refill' });
    }

    const [result] = await connection.query(
      'INSERT INTO refills (product, qty, `by`, date, created_at) VALUES (?, ?, ?, ?, NOW())',
      [product, refillQty, by || by_user || 'system', toMysqlDateTime(date)]
    );

    await connection.commit();
    await syncSchemaSql('create refill');
    res.json({ id: result.insertId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to insert refill:', error);
    res.status(500).json({ error: 'Unable to save refill' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/refills/:id', async (req, res) => {
  const refillId = Number(req.params.id);
  if (!Number.isFinite(refillId)) {
    return res.status(400).json({ error: 'Valid refill id is required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT id, product, qty FROM refills WHERE id = ? LIMIT 1', [refillId]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Refill record not found' });
    }

    const refill = rows[0];
    await connection.query(
      'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE name = ?',
      [Number(refill.qty || 0), refill.product]
    );
    await connection.query('DELETE FROM refills WHERE id = ?', [refillId]);

    await connection.commit();
    await syncSchemaSql('delete refill');
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to delete refill:', error);
    res.status(500).json({ error: 'Unable to delete refill' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/refills', async (req, res) => {
  try {
    await pool.query('DELETE FROM refills');
    await syncSchemaSql('clear refills');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear refills:', error);
    res.status(500).json({ error: 'Unable to clear refills' });
  }
});

app.post('/api/price-history', async (req, res) => {
  const { product, old, new: newPrice, by, date } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [product, old, newPrice, by || 'system', date || new Date()]
    );
    await syncSchemaSql('create price history');
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert price history:', error);
    res.status(500).json({ error: 'Unable to save price history' });
  }
});

app.put('/api/products/:id/price', async (req, res) => {
  const productId = Number(req.params.id);
  const newPrice = Number(req.body?.new_price);
  const byUser = req.body?.by_user || 'system';

  if (!Number.isFinite(productId) || !Number.isFinite(newPrice) || newPrice < 0) {
    return res.status(400).json({ error: 'Valid product id and new price are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [products] = await connection.query('SELECT name, price FROM products WHERE id = ? LIMIT 1', [productId]);
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    const oldPrice = Number(product.price || 0);

    await connection.query('UPDATE products SET price = ? WHERE id = ?', [newPrice, productId]);
    await connection.query(
      'INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [product.name, oldPrice, newPrice, byUser, toMysqlDateTime(req.body?.date)]
    );

    await connection.commit();
    await syncSchemaSql('update product price');
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to update product price:', error);
    res.status(500).json({ error: 'Unable to update product price' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/price-history/:id', async (req, res) => {
  const historyId = Number(req.params.id);
  if (!Number.isFinite(historyId)) {
    return res.status(400).json({ error: 'Valid history id is required' });
  }

  try {
    const [result] = await pool.query('DELETE FROM price_history WHERE id = ?', [historyId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Price history entry not found' });
    }
    await syncSchemaSql('delete price history');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete price history:', error);
    res.status(500).json({ error: 'Unable to delete price history' });
  }
});

app.delete('/api/price-history', async (req, res) => {
  try {
    await pool.query('DELETE FROM price_history');
    await syncSchemaSql('clear price history');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear price history:', error);
    res.status(500).json({ error: 'Unable to clear price history' });
  }
});

app.post('/api/products', async (req, res) => {
  const { code, name, cat, unit, price, stock, image } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (code, name, cat, unit, price, stock, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [code, name, cat, unit, price, stock, image]
    );
    await syncSchemaSql('create product');
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert product:', error);
    res.status(500).json({ error: 'Unable to save product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    await syncSchemaSql('delete product');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: 'Unable to delete product' });
  }
});

app.post('/api/accounts', async (req, res) => {
  const { user, password, role } = req.body;
  try {
    const hashedPassword = hashPassword(password || '');
    const [result] = await pool.query(
      'INSERT INTO accounts (user, pass, role, created_at) VALUES (?, ?, ?, NOW())',
      [user, hashedPassword, role || 'Staff']
    );
    await syncSchemaSql('create account');
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert account:', error);
    res.status(500).json({ error: 'Unable to save account' });
  }
});

app.put('/api/accounts/:user/password', async (req, res) => {
  const username = String(req.params.user || '').trim();
  const nextPassword = String(req.body?.password || '');

  if (!username || !nextPassword) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const hashedPassword = hashPassword(nextPassword);
    const [result] = await pool.query('UPDATE accounts SET pass = ? WHERE user = ?', [hashedPassword, username]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await syncSchemaSql('update account password');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update account password:', error);
    res.status(500).json({ error: 'Unable to update account password' });
  }
});

app.delete('/api/accounts/:user', async (req, res) => {
  try {
    await pool.query('DELETE FROM accounts WHERE user = ?', [req.params.user]);
    await syncSchemaSql('delete account');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete account:', error);
    res.status(500).json({ error: 'Unable to delete account' });
  }
});

app.delete('/api/customers', async (req, res) => {
  try {
    await pool.query('DELETE FROM customers');
    await syncSchemaSql('clear customers');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear customers:', error);
    res.status(500).json({ error: 'Unable to clear customers' });
  }
});

app.post('/api/login-logs', async (req, res) => {
  const { user_name, role } = req.body;
  const normalizedRole = String(role || '').trim().toLowerCase();

  if (normalizedRole === 'admin') {
    return res.json({ skipped: true });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO login_logs (user, role, loginTime, created_at) VALUES (?, ?, NOW(), NOW())',
      [user_name, role]
    );
    await syncSchemaSql('create login log');
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert login log:', error);
    res.status(500).json({ error: 'Unable to save login log' });
  }
});

app.put('/api/login-logs/:id/logout', async (req, res) => {
  try {
    await pool.query("UPDATE login_logs SET logoutTime = NOW(), status = 'Completed' WHERE id = ?", [req.params.id]);
    await syncSchemaSql('update login log logout');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update login log:', error);
    res.status(500).json({ error: 'Unable to update login log' });
  }
});

app.post('/api/shifts/start', async (req, res) => {
  const shiftUser = String(req.body?.user || '').trim();
  const shiftRole = String(req.body?.role || 'Staff').trim();
  const shiftStart = req.body?.shiftStart ? new Date(req.body.shiftStart) : new Date();

  if (!shiftUser) {
    return res.status(400).json({ error: 'Shift user is required' });
  }

  if (Number.isNaN(shiftStart.getTime())) {
    return res.status(400).json({ error: 'Valid shift start time is required' });
  }

  const normalizedRole = shiftRole.toLowerCase();
  if (normalizedRole === 'admin') {
    return res.json({
      success: true,
      skipped: true,
      shiftStart: shiftStart.toISOString(),
      sessionId: null
    });
  }

  try {
    // Check if an active shift session already exists for this user to prevent duplicate shifts
    const [activeSessions] = await pool.query(
      "SELECT id, loginTime FROM login_logs WHERE user = ? AND status = 'Active' AND logoutTime IS NULL ORDER BY id DESC LIMIT 1",
      [shiftUser]
    );

    if (activeSessions.length > 0) {
      return res.json({
        success: true,
        message: 'Active shift session detected',
        sessionId: activeSessions[0].id,
        shiftStart: new Date(activeSessions[0].loginTime).toISOString()
      });
    }

    const shiftStartSql = toMysqlDateTime(shiftStart);
    const [result] = await pool.query(
      "INSERT INTO login_logs (user, role, loginTime, logoutTime, status, created_at) VALUES (?, ?, ?, NULL, 'Active', NOW())",
      [shiftUser, shiftRole, shiftStartSql]
    );

    await syncSchemaSql('start shift');
    res.json({
      success: true,
      message: 'Next shift started successfully',
      sessionId: result.insertId,
      shiftStart: shiftStart.toISOString()
    });
  } catch (error) {
    console.error('Failed to start shift:', error);
    res.status(500).json({ error: 'Unable to start next shift' });
  }
});

app.post('/api/shifts/end', async (req, res) => {
  refreshRuntimeMailEnv();

  const shiftUser = String(req.body?.user || '').trim();
  const shiftRole = String(req.body?.role || 'Staff').trim();
  const shiftSessionId = req.body?.sessionId ? Number(req.body.sessionId) : null;
  const recipientEmail = String(
    req.body?.recipientEmail ||
    process.env.SHIFT_REPORT_EMAIL ||
    process.env.MAIL_USER ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    ''
  ).trim();
  const shiftStartRaw = req.body?.shiftStart;
  const shiftStart = shiftStartRaw ? new Date(shiftStartRaw) : new Date();
  const shiftEnd = new Date();

  if (!shiftUser) {
    return res.status(400).json({ error: 'Shift user is required' });
  }

  if (Number.isNaN(shiftStart.getTime())) {
    return res.status(400).json({ error: 'Valid shift start time is required' });
  }

  const normalizedRole = shiftRole.toLowerCase();

  // Email validation is ONLY required if user role is Admin
  if (normalizedRole === 'admin' && !recipientEmail) {
    return res.status(400).json({ error: 'Report recipient email is not configured' });
  }

  const connection = await pool.getConnection();
  try {
    const shiftStartSql = toMysqlDateTime(shiftStart);
    const shiftEndSql = toMysqlDateTime(shiftEnd);
    const [settingsRows] = await connection.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
    const shopSettings = settingsRows?.[0] || {};
    const shopName = String(shopSettings.shop || 'Sri Nikil Tradings').trim();

    const [billRows] = await connection.query(
      'SELECT * FROM bills WHERE by_user = ? AND date BETWEEN ? AND ? ORDER BY date ASC',
      [shiftUser, shiftStartSql, shiftEndSql]
    );
    const [productRows] = await connection.query(
      'SELECT id, name, cat, unit, price, stock, sold FROM products ORDER BY name ASC'
    );
    const [refillRows] = await connection.query(
      'SELECT product, qty, date FROM refills WHERE date BETWEEN ? AND ? ORDER BY date ASC',
      [shiftStartSql, shiftEndSql]
    );

    const soldByProductId = new Map();
    let totalItemsSold = 0;
    for (const bill of billRows) {
      const items = parseItems(bill.items);
      if (!Array.isArray(items)) {
        continue;
      }

      for (const item of items) {
        const productId = Number(item.id);
        const qty = Number(item.qty || 0);
        if (!Number.isFinite(productId) || !Number.isFinite(qty)) {
          continue;
        }

        soldByProductId.set(productId, (soldByProductId.get(productId) || 0) + qty);
        totalItemsSold += qty;
      }
    }

    const refillByProductName = new Map();
    for (const refill of refillRows) {
      const productName = String(refill.product || '').trim();
      const qty = Number(refill.qty || 0);
      if (!productName || !Number.isFinite(qty)) {
        continue;
      }

      refillByProductName.set(productName, (refillByProductName.get(productName) || 0) + qty);
    }

    const remainingStockSummary = getRemainingStockSummary(productRows, soldByProductId, refillByProductName);



    const totalShiftSales = billRows.reduce((sum, bill) => sum + Number(bill.grand || 0), 0);
    const paymentBreakdown = getPaymentBreakdown(billRows);
    const report = {
      user: shiftUser,
      role: shiftRole,
      shiftStart: shiftStart.toISOString(),
      shiftEnd: shiftEnd.toISOString(),
      shiftStartDisplay: shiftStart.toLocaleString('en-GB'),
      shiftEndDisplay: shiftEnd.toLocaleString('en-GB'),
      billsCount: billRows.length,
      totalItemsSold,
      totalSalesAmount: totalShiftSales,
      paymentBreakdown,
      remainingStockSummary
    };

    const friendlyDate = shiftEnd.toLocaleDateString('en-GB');
    const subject = `Shift Report \u2013 ${shopName} \u2013 ${friendlyDate}`;
    
    const text = `Hello,\n\nPlease find the attached Shift Report for the completed shift.\n\nRegards,\n${shopName}`;


    let emailStatus = 'skipped';
    let emailError = null;
    let emailSentAtSql = null;

    // Trigger email ONLY if admin is ending shift
    if (normalizedRole === 'admin') {
      try {
        const excelBuffer = await generateShiftExcelReport(report, billRows, remainingStockSummary);
        
        await sendShiftReportEmail({
          recipient: recipientEmail,
          subject,
          text,
          html: '', // No HTML requested
          attachments: [
            {
              filename: `Shift_Report_${shopName.replace(/\s+/g, '_')}_${friendlyDate.replace(/\//g, '-')}.xlsx`,
              content: excelBuffer,
              contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
          ]
        });
        emailStatus = 'sent';
        emailSentAtSql = shiftEndSql;
      } catch (err) {
        emailStatus = 'failed';
        emailError = err.message || 'Email sending failed';
        console.error('Failed to send admin shift mail:', err);
      }
    }

    await connection.beginTransaction();

    // Mark shift as Completed in login_logs, both for admin and non-admin
    if (Number.isFinite(shiftSessionId)) {
      await connection.query(
        'UPDATE login_logs SET logoutTime = ?, status = ? WHERE id = ?',
        [shiftEndSql, 'Completed', shiftSessionId]
      );
    } else {
      await connection.query(
        'UPDATE login_logs SET logoutTime = ?, status = ? WHERE user = ? AND logoutTime IS NULL ORDER BY id DESC LIMIT 1',
        [shiftEndSql, 'Completed', shiftUser]
      );
    }

    await connection.query(
      `INSERT INTO shift_reports (
        session_id, user, role, shift_start, shift_end, total_bills, total_items_sold, total_sales_amount,
        payment_breakdown, remaining_stock_summary, report_email, report_subject, email_status, email_error, email_sent_at, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        Number.isFinite(shiftSessionId) ? shiftSessionId : null,
        shiftUser,
        shiftRole,
        shiftStartSql,
        shiftEndSql,
        billRows.length,
        totalItemsSold,
        totalShiftSales,
        JSON.stringify(paymentBreakdown),
        JSON.stringify(remainingStockSummary),
        normalizedRole === 'admin' ? recipientEmail : null,
        normalizedRole === 'admin' ? subject : 'Shift Completed Automatically on Logout',
        emailStatus,
        emailError,
        emailSentAtSql,
        'Completed'
      ]
    );

    await connection.commit();
    await syncSchemaSql('end shift');

    res.json({
      success: true,
      message: normalizedRole === 'admin' ? 'Shift closed and report sent successfully' : 'Shift completed automatically',
      emailedTo: normalizedRole === 'admin' ? recipientEmail : null,
      shiftStart: shiftStart.toISOString(),
      shiftEnd: shiftEnd.toISOString(),
      billsCount: billRows.length,
      totalItemsSold,
      totalSales: totalShiftSales,
      paymentBreakdown,
      remainingStockSummary: remainingStockSummary.totals,
      promptNextShift: normalizedRole !== 'admin'
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // no-op
    }
    try {
      await connection.query(
        `INSERT INTO shift_reports (
          session_id, user, role, shift_start, shift_end, total_bills, total_items_sold, total_sales_amount,
          payment_breakdown, remaining_stock_summary, report_email, report_subject, email_status, email_error, email_sent_at, status, created_at
        ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, NULL, NULL, ?, 'Shift Sales Report Failed', 'failed', ?, NULL, ?, NOW())`,
        [
          Number.isFinite(shiftSessionId) ? shiftSessionId : null,
          shiftUser,
          shiftRole,
          toMysqlDateTime(shiftStart),
          toMysqlDateTime(shiftEnd),
          normalizedRole === 'admin' ? (recipientEmail || null) : null,
          error.message || 'Email sending failed',
          'Failed'
        ]
      );
      await syncSchemaSql('log failed shift report');
    } catch (logError) {
      console.error('Failed to log shift email error:', logError);
    }
    console.error('Failed to end shift:', error);
    res.status(500).json({ error: error.message || 'Unable to end shift' });
  } finally {
    connection.release();
  }
});

app.delete('/api/login-logs/:id', async (req, res) => {
  const logId = Number(req.params.id);
  if (!Number.isFinite(logId)) {
    return res.status(400).json({ error: 'Valid login log id is required' });
  }

  try {
    const [result] = await pool.query('DELETE FROM login_logs WHERE id = ?', [logId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Login log not found' });
    }
    await syncSchemaSql('delete login log');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete login log:', error);
    res.status(500).json({ error: 'Unable to delete login log' });
  }
});

app.delete('/api/login-logs', async (req, res) => {
  const roles = String(req.query?.roles || '')
    .split(',')
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);

  try {
    if (roles.length > 0) {
      const placeholders = roles.map(() => '?').join(', ');
      await pool.query(
        `DELETE FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) IN (${placeholders})`,
        roles
      );
      await syncSchemaSql('clear filtered login logs');
    } else {
      await pool.query('DELETE FROM login_logs');
      await syncSchemaSql('clear login logs');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear login logs:', error);
    res.status(500).json({ error: 'Unable to clear login logs' });
  }
});

app.put('/api/settings', async (req, res) => {
  const { gst, shop, addr, gstin, fssai, phone } = req.body;
  const normalizedSettings = [
    Number(gst ?? 0),
    shop || '',
    addr || '',
    gstin || '',
    fssai || '',
    phone || ''
  ];

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [settingsRows] = await connection.query('SELECT id FROM settings ORDER BY id ASC LIMIT 1');

    if (settingsRows.length === 0) {
      const [insertResult] = await connection.query(
        'INSERT INTO settings (gst, shop, addr, gstin, fssai, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        normalizedSettings
      );

      await connection.commit();
      await syncSchemaSql('create settings');
      return res.json({
        success: true,
        id: insertResult.insertId,
        settings: {
          gst: normalizedSettings[0],
          shop: normalizedSettings[1],
          addr: normalizedSettings[2],
          gstin: normalizedSettings[3],
          fssai: normalizedSettings[4],
          phone: normalizedSettings[5]
        }
      });
    }

    await connection.query(
      'UPDATE settings SET gst=?, shop=?, addr=?, gstin=?, fssai=?, phone=? WHERE id = ?',
      [...normalizedSettings, settingsRows[0].id]
    );
    await connection.commit();
    await syncSchemaSql('update settings');
    res.json({
      success: true,
      id: settingsRows[0].id,
      settings: {
        gst: normalizedSettings[0],
        shop: normalizedSettings[1],
        addr: normalizedSettings[2],
        gstin: normalizedSettings[3],
        fssai: normalizedSettings[4],
        phone: normalizedSettings[5]
      }
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // no-op
    }
    console.error('Failed to update settings:', error);
    res.status(500).json({ error: 'Unable to update settings' });
  } finally {
    connection.release();
  }
});


// --- Start the server ---
app.listen(port, '0.0.0.0', async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Verify database connection on startup
    await pool.query('SELECT 1');
    await migrateLegacyAccountPasswords();
    console.log(`Database connected and server listening on http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}).on('error', (err) => {
  console.error('Failed to start server:', err);
});
