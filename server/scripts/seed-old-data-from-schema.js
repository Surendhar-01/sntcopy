const path = require('path');
const fs = require('fs');
const dns = require('dns');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

const envCandidates = [
  path.resolve(__dirname, '..', '.env.development'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(process.cwd(), 'server', '.env.development'),
  path.resolve(process.cwd(), 'server', '.env'),
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
if (envPath) dotenv.config({ path: envPath });

const mongoDnsServers = String(process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (mongoDnsServers.length > 0) {
  dns.setServers(mongoDnsServers);
}

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const mongoDbName = process.env.MONGODB_DB || process.env.MONGO_DB || 'sri_nikil_erp';

if (!mongoUri) {
  console.error('Missing MONGODB_URI in server/.env.development');
  process.exit(1);
}

function splitSqlTuple(tuple) {
  const values = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < tuple.length; i += 1) {
    const char = tuple[i];
    const next = tuple[i + 1];

    if (char === "'" && next === "'") {
      current += "'";
      i += 1;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      continue;
    }

    if (char === ',' && !inString) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values.map((value) => (value.toUpperCase() === 'NULL' ? null : value));
}

function extractTuples(valuesSql) {
  const tuples = [];
  let current = '';
  let inString = false;
  let depth = 0;

  for (let i = 0; i < valuesSql.length; i += 1) {
    const char = valuesSql[i];
    const next = valuesSql[i + 1];

    if (char === "'" && next === "'") {
      current += "''";
      i += 1;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      if (depth > 0) current += char;
      continue;
    }

    if (char === '(' && !inString) {
      depth += 1;
      if (depth === 1) {
        current = '';
        continue;
      }
    }

    if (char === ')' && !inString) {
      depth -= 1;
      if (depth === 0) {
        tuples.push(current);
        current = '';
        continue;
      }
    }

    if (depth > 0) current += char;
  }

  return tuples;
}

function readTable(schema, tableName) {
  const insertRegex = new RegExp(`INSERT INTO \`${tableName}\`\\s*\\(([^)]*)\\)\\s*VALUES\\s*([\\s\\S]*?);`, 'g');
  const rows = [];
  let match;

  while ((match = insertRegex.exec(schema)) !== null) {
    const columns = [...match[1].matchAll(/`([^`]+)`/g)].map((columnMatch) => columnMatch[1]);
    for (const tuple of extractTuples(match[2])) {
      const values = splitSqlTuple(tuple);
      rows.push(Object.fromEntries(columns.map((column, index) => [column, values[index] ?? null])));
    }
  }

  return rows;
}

function toNumber(value) {
  return Number(value || 0);
}

function toDate(value) {
  return value ? new Date(`${String(value).replace(' ', 'T')}+05:30`) : null;
}

function parseItems(value) {
  if (!value) return [];
  try {
    const items = JSON.parse(value);
    return Array.isArray(items)
      ? items.map((item) => ({
          ...item,
          id: toNumber(item.id),
          qty: toNumber(item.qty),
          price: toNumber(item.price),
          total: toNumber(item.total),
        }))
      : [];
  } catch {
    return [];
  }
}

function mapBill(row) {
  const billNo = row.billNo || row.bill_no || '';
  return {
    id: toNumber(row.id),
    billNo,
    bill_no: billNo,
    customer: row.customer || '',
    phone: row.phone || '',
    payment: row.payment || '',
    date: toDate(row.date),
    subtotal: toNumber(row.subtotal),
    cgst: toNumber(row.cgst),
    sgst: toNumber(row.sgst),
    grand: toNumber(row.grand),
    items: parseItems(row.items),
    by: row.by_user || row.by || 'system',
    by_user: row.by_user || row.by || 'system',
    created_at: toDate(row.created_at) || new Date(),
  };
}

function mapCustomer(row) {
  return {
    id: toNumber(row.id),
    name: row.name || '',
    phone: row.phone || '',
    visits: toNumber(row.visits),
    total: toNumber(row.total),
    firstVisit: toDate(row.firstVisit),
    lastVisit: toDate(row.lastVisit),
    created_at: toDate(row.created_at) || new Date(),
  };
}

function mapSale(row) {
  return {
    id: toNumber(row.id),
    date: toDate(row.date),
    billNo: row.billNo || '',
    customer: row.customer || '',
    product: row.product || '',
    qty: toNumber(row.qty),
    amount: toNumber(row.amount),
    by: row.by_user || row.by || 'system',
    by_user: row.by_user || row.by || 'system',
    created_at: toDate(row.created_at) || new Date(),
  };
}

function mapLoginLog(row) {
  return {
    id: toNumber(row.id),
    user: row.user || '',
    user_name: row.user || '',
    role: row.role || 'Staff',
    loginTime: toDate(row.loginTime),
    login_time: toDate(row.loginTime),
    logoutTime: toDate(row.logoutTime),
    logout_time: toDate(row.logoutTime),
    status: row.status || (row.logoutTime ? 'Completed' : 'Active'),
    created_at: toDate(row.created_at) || new Date(),
  };
}

async function upsertRows(collection, rows) {
  if (rows.length === 0) return { upsertedCount: 0, modifiedCount: 0 };

  const result = await collection.bulkWrite(
    rows.map((row) => ({
      updateOne: {
        filter: { id: row.id },
        update: { $set: row },
        upsert: true,
      },
    })),
  );

  return result;
}

async function syncCounter(db, collectionName, counterName) {
  const maxDoc = await db.collection(collectionName).find().sort({ id: -1 }).limit(1).next();
  await db.collection('counters').updateOne(
    { _id: counterName },
    { $set: { seq: Number(maxDoc?.id || 0) } },
    { upsert: true },
  );
}

async function main() {
  const schemaPath = path.resolve(__dirname, '..', '..', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const bills = readTable(schema, 'bills').map(mapBill);
  const customers = readTable(schema, 'customers').map(mapCustomer);
  const sales = readTable(schema, 'sales').map(mapSale);
  const loginLogs = readTable(schema, 'login_logs').map(mapLoginLog);

  const client = new MongoClient(mongoUri);
  await client.connect();

  const db = client.db(mongoDbName);
  await Promise.all([
    db.collection('bills').createIndex({ id: 1 }, { unique: true }),
    db.collection('customers').createIndex({ phone: 1 }, { unique: true, sparse: true }),
    db.collection('sales').createIndex({ id: 1 }, { unique: true }),
    db.collection('login_logs').createIndex({ id: 1 }, { unique: true }),
  ]);

  const [billResult, customerResult, saleResult, loginLogResult] = await Promise.all([
    upsertRows(db.collection('bills'), bills),
    upsertRows(db.collection('customers'), customers),
    upsertRows(db.collection('sales'), sales),
    upsertRows(db.collection('login_logs'), loginLogs),
  ]);

  await Promise.all([
    syncCounter(db, 'bills', 'bills'),
    syncCounter(db, 'customers', 'customers'),
    syncCounter(db, 'sales', 'sales'),
    syncCounter(db, 'login_logs', 'login_logs'),
  ]);

  const counts = {
    bills: await db.collection('bills').countDocuments(),
    customers: await db.collection('customers').countDocuments(),
    sales: await db.collection('sales').countDocuments(),
    loginLogs: await db.collection('login_logs').countDocuments(),
  };

  await client.close();

  console.log(`Bills imported: ${bills.length} (inserted ${billResult.upsertedCount}, updated ${billResult.modifiedCount})`);
  console.log(`Customers imported: ${customers.length} (inserted ${customerResult.upsertedCount}, updated ${customerResult.modifiedCount})`);
  console.log(`Sales imported: ${sales.length} (inserted ${saleResult.upsertedCount}, updated ${saleResult.modifiedCount})`);
  console.log(`Login logs imported: ${loginLogs.length} (inserted ${loginLogResult.upsertedCount}, updated ${loginLogResult.modifiedCount})`);
  console.log(`Mongo totals: bills ${counts.bills}, customers ${counts.customers}, sales ${counts.sales}, login logs ${counts.loginLogs}`);
}

main().catch((error) => {
  console.error('Failed to import old data:', error.message);
  process.exit(1);
});
