require('dotenv').config({ path: '.env.development' });
const mysql = require('mysql2/promise');

(async () => {
  const dbName = process.env.DB_NAME || 'sridb';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Surendhar@01',
    database: dbName,
    port: Number(process.env.DB_PORT || 3306)
  });

  console.log('Connected to database to check and run migrations...');
  
  // login_logs column check
  const [loginCols] = await conn.query(
    'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
    [dbName, 'login_logs', 'status']
  );
  if (loginCols.length === 0) {
    console.log('Adding status column to login_logs...');
    await conn.query("ALTER TABLE `login_logs` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'Active'");
    console.log('Added!');
  } else {
    console.log('status column already exists in login_logs.');
  }

  // shift_reports column check
  const [shiftCols] = await conn.query(
    'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
    [dbName, 'shift_reports', 'status']
  );
  if (shiftCols.length === 0) {
    console.log('Adding status column to shift_reports...');
    await conn.query("ALTER TABLE `shift_reports` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'Completed'");
    console.log('Added!');
  } else {
    console.log('status column already exists in shift_reports.');
  }

  // Verify structure
  const [loginLogsDesc] = await conn.query('DESCRIBE login_logs');
  console.log('DESCRIBE login_logs result:', loginLogsDesc);

  const [shiftDesc] = await conn.query('DESCRIBE shift_reports');
  console.log('DESCRIBE shift_reports result:', shiftDesc);

  await conn.end();
  console.log('Migration script complete.');
})().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
