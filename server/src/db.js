const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

const envCandidates = [
  path.resolve(process.cwd(), '.env.development'),
  path.resolve(__dirname, '../.env.development')
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate)) || envCandidates[0];
dotenv.config({ path: envPath });

const dbName = process.env.DB_DATABASE || process.env.DB_NAME || 'erp';
const dbPort = Number(process.env.DB_PORT || 3306);

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USERNAME || process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

async function initializeDatabase() {
  const tempConnection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USERNAME || process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    port: dbPort
  });

  try {
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConnection.query(`USE \`${dbName}\``);

    const tableDefinitions = {
      accounts: `CREATE TABLE IF NOT EXISTS \`accounts\` (\`id\` INT AUTO_INCREMENT PRIMARY KEY, \`user\` VARCHAR(255) NOT NULL UNIQUE, \`pass\` VARCHAR(255) NOT NULL, \`role\` VARCHAR(50) NOT NULL DEFAULT 'Staff', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`,
      products: `CREATE TABLE IF NOT EXISTS \`products\` (\`id\` INT AUTO_INCREMENT PRIMARY KEY, \`name\` VARCHAR(255) NOT NULL, \`code\` VARCHAR(100) UNIQUE, \`cat\` VARCHAR(100), \`unit\` VARCHAR(50), \`price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00, \`stock\` INT NOT NULL DEFAULT 0, \`sold\` INT NOT NULL DEFAULT 0, \`image\` TEXT, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`,
      bills: `CREATE TABLE IF NOT EXISTS \`bills\` (\`id\` INT AUTO_INCREMENT PRIMARY KEY, \`billNo\` VARCHAR(255) NOT NULL, \`customer\` VARCHAR(255), \`phone\` VARCHAR(50), \`payment\` VARCHAR(50), \`date\` DATETIME NOT NULL, \`subtotal\` DECIMAL(12,2) NOT NULL DEFAULT 0.00, \`cgst\` DECIMAL(12,2) NOT NULL DEFAULT 0.00, \`sgst\` DECIMAL(12,2) NOT NULL DEFAULT 0.00, \`grand\` DECIMAL(12,2) NOT NULL DEFAULT 0.00, \`items\` LONGTEXT, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`,
      customers: `CREATE TABLE IF NOT EXISTS \`customers\` (\`id\` INT AUTO_INCREMENT PRIMARY KEY, \`name\` VARCHAR(255) NOT NULL, \`phone\` VARCHAR(50) UNIQUE, \`visits\` INT NOT NULL DEFAULT 0, \`total\` DECIMAL(12,2) NOT NULL DEFAULT 0.00, \`firstVisit\` DATETIME NULL, \`lastVisit\` DATETIME NULL, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`,
      sales: `CREATE TABLE IF NOT EXISTS \`sales\` (\`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`billNo\` VARCHAR(255), \`customer\` VARCHAR(255), \`product\` VARCHAR(255), \`qty\` INT NOT NULL DEFAULT 0, \`amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`,
      refills: `CREATE TABLE IF NOT EXISTS \`refills\` (\`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`product\` VARCHAR(255), \`qty\` INT NOT NULL DEFAULT 0, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`,
      price_history: `CREATE TABLE IF NOT EXISTS \`price_history\` (\`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`product\` VARCHAR(255), \`old\` DECIMAL(12,2) NOT NULL DEFAULT 0.00, \`new\` DECIMAL(12,2) NOT NULL DEFAULT 0.00, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`,
      login_logs: `CREATE TABLE IF NOT EXISTS \`login_logs\` (\`id\` INT AUTO_INCREMENT PRIMARY KEY, \`user\` VARCHAR(255), \`role\` VARCHAR(50), \`loginTime\` DATETIME NULL, \`logoutTime\` DATETIME NULL, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`,
      settings: `CREATE TABLE IF NOT EXISTS \`settings\` (\`id\` INT AUTO_INCREMENT PRIMARY KEY, \`gst\` DECIMAL(5,2) NOT NULL DEFAULT 0.00, \`shop\` VARCHAR(255), \`addr\` TEXT, \`gstin\` VARCHAR(100), \`fssai\` VARCHAR(100), \`phone\` VARCHAR(100), \`themePreference\` VARCHAR(50) NOT NULL DEFAULT 'system', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`
    };

    for (const query of Object.values(tableDefinitions)) {
      await tempConnection.query(query);
    }
  } finally {
    await tempConnection.end();
  }
}

module.exports = {
  pool,
  initializeDatabase
};
