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

function readProductsFromSchema() {
  const schemaPath = path.resolve(__dirname, '..', '..', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const match = schema.match(/INSERT INTO `products`[\s\S]*?VALUES\s*([\s\S]*?);/);

  if (!match) {
    throw new Error('Products insert block not found in schema.sql');
  }

  const tuples = [];
  let current = '';
  let inString = false;
  let depth = 0;

  for (let i = 0; i < match[1].length; i += 1) {
    const char = match[1][i];
    const next = match[1][i + 1];

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

  const products = [];

  for (const tuple of tuples) {
    const [id, name, code, cat, unit, price, stock, sold, image, createdAt] = splitSqlTuple(tuple);
    const remainingStock = Number(stock || 0);
    const soldCount = Number(sold || 0);

    products.push({
      id: Number(id),
      name,
      code,
      cat,
      unit,
      price: Number(price || 0),
      stock: remainingStock,
      sold: soldCount,
      opening_stock: remainingStock + soldCount,
      image,
      created_at: createdAt ? new Date(`${createdAt.replace(' ', 'T')}+05:30`) : new Date(),
    });
  }

  return products;
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
  const products = readProductsFromSchema();
  const client = new MongoClient(mongoUri);

  await client.connect();
  const db = client.db(mongoDbName);
  const collection = db.collection('products');

  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ code: 1 }, { unique: true, sparse: true });
  const cleanup = await collection.deleteMany({
    $or: [{ id: null }, { code: null }, { name: null }],
  });

  const result = await collection.bulkWrite(
    products.map((product) => ({
      updateOne: {
        filter: { code: product.code },
        update: { $set: product },
        upsert: true,
      },
    })),
  );

  await syncCounter(db, 'products', 'products');
  const total = await collection.countDocuments();

  await client.close();

  console.log(`Products imported: ${products.length}`);
  console.log(`Cleaned malformed rows: ${cleanup.deletedCount}`);
  console.log(`Inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}`);
  console.log(`Mongo products total: ${total}`);
}

main().catch((error) => {
  console.error('Failed to import products:', error.message);
  process.exit(1);
});
