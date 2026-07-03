/* global process, Buffer */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env.development');
dotenv.config({ path: envPath });

const dbName = process.env.DB_DATABASE || process.env.DB_NAME || 'erp';
const outputFile = process.env.EXPORT_SQL_FILE || path.resolve(process.cwd(), 'schema.sql');

const tableOrder = [
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

function isHashedPassword(storedPassword) {
  return typeof storedPassword === 'string' && storedPassword.startsWith('scrypt$');
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

async function readTableSnapshot(connection, tableName) {
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

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    port: Number(process.env.DB_PORT || 3306)
  });

  try {
    const lines = [
      '-- ERP Database Schema',
      '-- Exported from live MySQL database',
      `-- ${new Date().toISOString()}`,
      '',
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`,
      `USE \`${dbName}\`;`,
      '',
      'SET FOREIGN_KEY_CHECKS=0;',
      ''
    ];

    for (const [index, tableName] of tableOrder.entries()) {
      const snapshot = await readTableSnapshot(connection, tableName);

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

    fs.writeFileSync(outputFile, lines.join('\n'), 'utf8');
    console.log(`Exported live database "${dbName}" to ${outputFile}`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Failed to export database:', error);
  process.exit(1);
});
