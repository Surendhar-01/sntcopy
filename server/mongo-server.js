const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const dns = require('dns');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

const envCandidates = [
  path.resolve(process.cwd(), '.env.development'),
  path.resolve(__dirname, '.env.development'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '.env'),
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
if (envPath) dotenv.config({ path: envPath });

const app = express();
const port = Number(process.env.PORT || 5001);
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const mongoDbName = process.env.MONGODB_DB || process.env.MONGO_DB || 'sri_nikil_erp';
const mongoDnsServers = String(process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (mongoDnsServers.length > 0) {
  dns.setServers(mongoDnsServers);
}

if (!mongoUri) {
  console.error('Missing MONGODB_URI. Add your MongoDB Atlas connection string to server/.env.development.');
  process.exit(1);
}

const DEFAULT_SETTINGS = {
  gst: 5,
  shop: 'Sri Nikil Tradings',
  addr: '058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004',
  gstin: '33AMCPD1118L1ZK',
  fssai: '12424007000946',
  phone: '94875 81302, 0424 2901803',
};

const client = new MongoClient(mongoUri);
let db;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const jsonBody = {
  required: false,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        additionalProperties: true,
      },
    },
  },
};

function createSwaggerPath(summary, methods) {
  return Object.fromEntries(
    methods.map((method) => [
      method.toLowerCase(),
      {
        summary,
        tags: [summary.split(' ')[0]],
        ...(method === 'GET' || method === 'DELETE' ? {} : { requestBody: jsonBody }),
        responses: {
          200: { description: 'Success' },
          201: { description: 'Created' },
          400: { description: 'Bad request' },
          404: { description: 'Not found' },
          500: { description: 'Server error' },
        },
      },
    ])
  );
}

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Sri Nikil Mongo API',
    version: '1.0.0',
    description: 'Express + MongoDB Atlas backend API',
  },
  servers: [{ url: `http://localhost:${port}` }],
  paths: {
    '/api/db': createSwaggerPath('Database snapshot', ['GET']),
    '/api/products': createSwaggerPath('Products', ['GET', 'POST']),
    '/api/products/{id}': createSwaggerPath('Products by id', ['DELETE']),
    '/api/products/{id}/price': createSwaggerPath('Product price update', ['PUT']),
    '/api/products/opening-stock/sync': createSwaggerPath('Products opening stock sync', ['PUT']),
    '/api/bills': createSwaggerPath('Bills', ['GET', 'POST', 'DELETE']),
    '/api/bills/{id}': createSwaggerPath('Bills by id', ['DELETE']),
    '/api/customers': createSwaggerPath('Customers', ['GET', 'DELETE']),
    '/api/refills': createSwaggerPath('Refills', ['GET', 'POST', 'DELETE']),
    '/api/refills/{id}': createSwaggerPath('Refills by id', ['DELETE']),
    '/api/price-history': createSwaggerPath('Price history', ['GET', 'POST', 'DELETE']),
    '/api/price-history/{id}': createSwaggerPath('Price history by id', ['DELETE']),
    '/api/accounts': createSwaggerPath('Accounts', ['GET', 'POST']),
    '/api/accounts/{user}/password': createSwaggerPath('Account password reset', ['PUT']),
    '/api/accounts/{user}': createSwaggerPath('Accounts by user', ['DELETE']),
    '/api/auth/login': createSwaggerPath('Auth login', ['POST']),
    '/api/settings': createSwaggerPath('Settings', ['GET', 'PUT']),
    '/api/login-logs': createSwaggerPath('Login logs', ['GET', 'POST', 'DELETE']),
    '/api/login-logs/{id}/logout': createSwaggerPath('Login log logout', ['PUT']),
    '/api/login-logs/{id}': createSwaggerPath('Login logs by id', ['DELETE']),
    '/api/shifts/active': createSwaggerPath('Active shift', ['GET']),
    '/api/shifts/start': createSwaggerPath('Shift start', ['POST']),
    '/api/shifts/end': createSwaggerPath('Shift end', ['POST']),
    '/api/reset-sales-data': createSwaggerPath('Reset sales data', ['POST']),
    '/api/purchases': createSwaggerPath('Purchases', ['POST']),
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

  if (!stored.startsWith('scrypt$')) return plain === stored;

  const [prefix, nStr, rStr, pStr, salt, hashHex] = stored.split('$');
  if (prefix !== 'scrypt' || !salt || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(plain, salt, expected.length, {
    N: Number(nStr || 16384),
    r: Number(rStr || 8),
    p: Number(pStr || 1),
  });

  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function c(name) {
  return db.collection(name);
}

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function getSmtpConfig() {
  const host = String(process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || process.env.MAIL_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.MAIL_APP_PASSWORD || process.env.MAIL_PASSWORD || '').trim();
  const from = String(process.env.SMTP_FROM || process.env.MAIL_FROM || user).trim();
  const secure = String(process.env.SMTP_SECURE || '').trim().toLowerCase() === 'true' || port === 465;

  if (!host || !port || !user || !pass || !from) {
    throw new Error('SMTP configuration is incomplete');
  }

  return { host, port, secure, from, auth: { user, pass } };
}

async function sendShiftReportEmail({ recipient, subject, text, html }) {
  const smtpConfig = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth,
  });

  return transporter.sendMail({
    from: smtpConfig.from,
    to: recipient,
    subject,
    text,
    html,
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getPaymentBreakdown(bills) {
  return bills.reduce((acc, bill) => {
    const method = bill.payment || 'Unknown';
    acc[method] = (acc[method] || 0) + toNumber(bill.grand);
    return acc;
  }, {});
}

function getShiftItemsSummary(bills) {
  const byProduct = new Map();
  let totalItemsSold = 0;

  for (const bill of bills) {
    for (const item of normalizeBillItems(bill.items)) {
      const key = item.id || item.name;
      const qty = toNumber(item.qty);
      if (!key || qty <= 0) continue;

      const current = byProduct.get(key) || {
        id: item.id || '',
        name: item.name || 'Product',
        qty: 0,
        amount: 0,
      };
      current.qty += qty;
      current.amount += toNumber(item.total, toNumber(item.price) * qty);
      byProduct.set(key, current);
      totalItemsSold += qty;
    }
  }

  return {
    totalItemsSold,
    products: [...byProduct.values()].sort((a, b) => b.qty - a.qty),
  };
}

function buildShiftReportEmail({ report, shopName, paymentBreakdown, itemSummary }) {
  const paymentRows = Object.entries(paymentBreakdown)
    .map(([method, amount]) => `<tr><td>${escapeHtml(method)}</td><td style="text-align:right">Rs. ${toNumber(amount).toFixed(2)}</td></tr>`)
    .join('');
  const itemRows = itemSummary.products
    .map((item) => `<tr><td>${escapeHtml(item.name)}</td><td style="text-align:right">${item.qty}</td><td style="text-align:right">Rs. ${toNumber(item.amount).toFixed(2)}</td></tr>`)
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.45">
      <h2 style="margin:0 0 8px">${escapeHtml(shopName)} - Shift Report</h2>
      <p style="margin:0 0 16px;color:#4b5563">Generated automatically when shift ended.</p>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:720px">
        <tr><td><b>User</b></td><td>${escapeHtml(report.user)} (${escapeHtml(report.role)})</td></tr>
        <tr><td><b>Shift Start</b></td><td>${escapeHtml(report.shiftStartDisplay)}</td></tr>
        <tr><td><b>Shift End</b></td><td>${escapeHtml(report.shiftEndDisplay)}</td></tr>
        <tr><td><b>Total Bills</b></td><td>${report.billsCount}</td></tr>
        <tr><td><b>Total Items Sold</b></td><td>${report.totalItemsSold}</td></tr>
        <tr><td><b>Total Sales</b></td><td>Rs. ${toNumber(report.totalSalesAmount).toFixed(2)}</td></tr>
      </table>
      <h3>Payment Summary</h3>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:720px;border:1px solid #e5e7eb">
        <thead><tr style="background:#f3f4f6"><th align="left">Method</th><th align="right">Amount</th></tr></thead>
        <tbody>${paymentRows || '<tr><td colspan="2">No payments in this shift</td></tr>'}</tbody>
      </table>
      <h3>Products Sold</h3>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:720px;border:1px solid #e5e7eb">
        <thead><tr style="background:#f3f4f6"><th align="left">Product</th><th align="right">Qty</th><th align="right">Amount</th></tr></thead>
        <tbody>${itemRows || '<tr><td colspan="3">No products sold in this shift</td></tr>'}</tbody>
      </table>
    </div>
  `;

  const text = [
    `${shopName} - Shift Report`,
    `User: ${report.user} (${report.role})`,
    `Shift Start: ${report.shiftStartDisplay}`,
    `Shift End: ${report.shiftEndDisplay}`,
    `Total Bills: ${report.billsCount}`,
    `Total Items Sold: ${report.totalItemsSold}`,
    `Total Sales: Rs. ${toNumber(report.totalSalesAmount).toFixed(2)}`,
  ].join('\n');

  return { html, text };
}

function serialize(doc) {
  if (!doc) return doc;
  const rest = { ...doc };
  delete rest._id;
  return rest;
}

function serializeAccount(account) {
  const rest = serialize(account);
  delete rest.pass;
  return { ...rest, pass: '' };
}

function serializeMany(rows) {
  return rows.map(serialize);
}

async function nextId(name) {
  const result = await c('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return result?.seq ?? result?.value?.seq;
}

async function syncCounter(name, collectionName) {
  const highest = await c(collectionName)
    .find({})
    .sort({ id: -1 })
    .limit(1)
    .next();
  await c('counters').updateOne(
    { _id: name },
    { $max: { seq: toNumber(highest?.id, 0) } },
    { upsert: true },
  );
}

async function syncShiftLoginLogs() {
  const shifts = await c('shifts').find().sort({ shiftStart: 1 }).toArray();

  for (const shift of shifts) {
    if (!shift?.id) continue;

    const logoutTime = shift.shiftEnd || null;
    const status = logoutTime || shift.active === false ? 'Completed' : 'Active';
    const existingLog = await c('login_logs').findOne({ shiftSessionId: shift.id });

    if (existingLog) {
      await c('login_logs').updateOne(
        { id: existingLog.id },
        {
          $set: {
            user: shift.user,
            user_name: shift.user,
            role: shift.role || 'Staff',
            loginTime: shift.shiftStart,
            login_time: shift.shiftStart,
            logoutTime,
            logout_time: logoutTime,
            status,
          },
        },
      );
      continue;
    }

    await c('login_logs').insertOne({
      id: await nextId('login_logs'),
      user: shift.user,
      user_name: shift.user,
      role: shift.role || 'Staff',
      loginTime: shift.shiftStart,
      login_time: shift.shiftStart,
      logoutTime,
      logout_time: logoutTime,
      shiftSessionId: shift.id,
      status,
      created_at: shift.created_at || new Date(),
    });
  }

  await syncCounter('login_logs', 'login_logs');
}

function normalizeBillItems(rawItems) {
  if (Array.isArray(rawItems)) return rawItems;
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

function getNextBillNo(bills) {
  const maxSeq = bills
    .map((bill) => {
      const match = String(bill.billNo || bill.bill_no || '').match(/SNT-(\d+)/i);
      return match ? Number(match[1]) : 0;
    })
    .filter(Number.isFinite)
    .reduce((max, value) => Math.max(max, value), 999);
  return `SNT-${String(maxSeq + 1).padStart(4, '0')}`;
}

async function findProductById(id) {
  return c('products').findOne({ id: toNumber(id) });
}

async function initializeMongo() {
  await client.connect();
  db = client.db(mongoDbName);

  await Promise.all([
    c('products').createIndex({ id: 1 }, { unique: true }),
    c('products').createIndex({ code: 1 }, { unique: true, sparse: true }),
    c('bills').createIndex({ id: 1 }, { unique: true }),
    c('sales').createIndex({ id: 1 }, { unique: true }),
    c('customers').createIndex({ phone: 1 }, { unique: true, sparse: true }),
    c('refills').createIndex({ id: 1 }, { unique: true }),
    c('price_history').createIndex({ id: 1 }, { unique: true }),
    c('login_logs').createIndex({ id: 1 }, { unique: true }),
    c('login_logs').createIndex({ shiftSessionId: 1 }, { sparse: true }),
    c('accounts').createIndex({ user: 1 }, { unique: true }),
    c('shifts').createIndex({ id: 1 }, { unique: true }),
    c('shift_reports').createIndex({ id: 1 }, { unique: true }),
  ]);

  await Promise.all([
    syncCounter('products', 'products'),
    syncCounter('bills', 'bills'),
    syncCounter('sales', 'sales'),
    syncCounter('customers', 'customers'),
    syncCounter('refills', 'refills'),
    syncCounter('price_history', 'price_history'),
    syncCounter('login_logs', 'login_logs'),
    syncCounter('shifts', 'shifts'),
    syncCounter('shift_reports', 'shift_reports'),
  ]);

  await c('settings').updateOne(
    { key: 'main' },
    { $setOnInsert: { key: 'main', ...DEFAULT_SETTINGS } },
    { upsert: true },
  );

  const accountCount = await c('accounts').countDocuments();
  if (accountCount === 0) {
    await c('accounts').insertOne({
      user: 'admin',
      pass: hashPassword(process.env.DEFAULT_ADMIN_PASSWORD || 'admin12345'),
      role: 'Admin',
      created_at: new Date(),
    });
  }

  await syncShiftLoginLogs();
}

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'Sri Nikil Express Mongo API', database: mongoDbName });
});

app.get('/api/db', async (req, res, next) => {
  try {
    await syncShiftLoginLogs();
    const [products, bills, sales, customers, refills, priceHistory, loginLogs, accounts, settings] = await Promise.all([
      c('products').find().sort({ id: 1 }).toArray(),
      c('bills').find().sort({ date: -1 }).toArray(),
      c('sales').find().sort({ date: -1 }).toArray(),
      c('customers').find().sort({ lastVisit: -1 }).toArray(),
      c('refills').find().sort({ date: -1 }).toArray(),
      c('price_history').find().sort({ date: -1 }).toArray(),
      c('login_logs').find().sort({ loginTime: -1, login_time: -1 }).toArray(),
      c('accounts').find().sort({ user: 1 }).toArray(),
      c('settings').findOne({ key: 'main' }),
    ]);

    res.json({
      products: serializeMany(products),
      bills: serializeMany(bills),
      sales: serializeMany(sales),
      customers: serializeMany(customers),
      refills: serializeMany(refills),
      priceHistory: serializeMany(priceHistory),
      loginLogs: serializeMany(loginLogs),
      accounts: accounts.map(serializeAccount),
      settings: serialize(settings),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', async (req, res, next) => {
  try {
    res.json(serializeMany(await c('products').find().sort({ id: 1 }).toArray()));
  } catch (error) {
    next(error);
  }
});

app.post('/api/products', async (req, res, next) => {
  try {
    const id = await nextId('products');
    const product = {
      id,
      code: req.body.code || `P-${id}`,
      name: req.body.name || '',
      cat: req.body.cat || req.body.category || '',
      unit: req.body.unit || '',
      price: toNumber(req.body.price),
      stock: toNumber(req.body.stock),
      opening_stock: toNumber(req.body.opening_stock, toNumber(req.body.stock)),
      sold: toNumber(req.body.sold),
      image: req.body.image || '',
      created_at: new Date(),
    };
    await c('products').insertOne(product);
    res.status(201).json(serialize(product));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/:id', async (req, res, next) => {
  try {
    await c('products').deleteOne({ id: toNumber(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.put('/api/products/:id/price', async (req, res, next) => {
  try {
    const id = toNumber(req.params.id);
    const product = await findProductById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const oldPrice = toNumber(product.price);
    const newPrice = toNumber(req.body.new_price ?? req.body.newPrice);
    await c('products').updateOne({ id }, { $set: { price: newPrice } });
    await c('price_history').insertOne({
      id: await nextId('price_history'),
      date: new Date(),
      product_id: id,
      product: product.name,
      old: oldPrice,
      new: newPrice,
      by: req.body.by_user || req.body.by || 'system',
      created_at: new Date(),
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/bills', async (req, res, next) => {
  try {
    res.json(serializeMany(await c('bills').find().sort({ date: -1 }).toArray()));
  } catch (error) {
    next(error);
  }
});

app.post('/api/bills', async (req, res, next) => {
  try {
    const items = normalizeBillItems(req.body.items);
    const productIds = items.map((item) => toNumber(item.id)).filter(Boolean);
    const products = await c('products').find({ id: { $in: productIds } }).toArray();
    const productById = new Map(products.map((product) => [product.id, product]));

    for (const item of items) {
      const product = productById.get(toNumber(item.id));
      const qty = toNumber(item.qty);
      if (!product || qty <= 0 || toNumber(product.stock) < qty) {
        return res.status(400).json({ error: `Insufficient stock for ${item.name || item.id}` });
      }
    }

    for (const item of items) {
      const id = toNumber(item.id);
      const qty = toNumber(item.qty);
      await c('products').updateOne(
        { id },
        { $inc: { stock: -qty, sold: qty } },
      );
    }

    const existingBills = await c('bills').find({}, { projection: { billNo: 1, bill_no: 1 } }).toArray();
    const bill = {
      ...req.body,
      id: await nextId('bills'),
      billNo: req.body.billNo || req.body.bill_no || getNextBillNo(existingBills),
      bill_no: req.body.billNo || req.body.bill_no || getNextBillNo(existingBills),
      items,
      subtotal: toNumber(req.body.subtotal),
      cgst: toNumber(req.body.cgst),
      sgst: toNumber(req.body.sgst),
      grand: toNumber(req.body.grand),
      by: req.body.by || req.body.by_user || 'system',
      by_user: req.body.by || req.body.by_user || 'system',
      date: req.body.date ? new Date(req.body.date) : new Date(),
      created_at: new Date(),
    };
    await c('bills').insertOne(bill);

    if (bill.phone) {
      const now = new Date();
      await c('customers').updateOne(
        { phone: bill.phone },
        {
          $set: { name: bill.customer || '', phone: bill.phone, lastVisit: now },
          $setOnInsert: { id: await nextId('customers'), firstVisit: now },
          $inc: { visits: 1, total: bill.grand },
        },
        { upsert: true },
      );
    }

    res.status(201).json(serialize(bill));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/bills/:id', async (req, res, next) => {
  try {
    const id = toNumber(req.params.id);
    const bill = await c('bills').findOne({ id });
    if (bill) {
      for (const item of normalizeBillItems(bill.items)) {
        await c('products').updateOne(
          { id: toNumber(item.id) },
          { $inc: { stock: toNumber(item.qty), sold: -toNumber(item.qty) } },
        );
      }
      await c('bills').deleteOne({ id });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/bills', async (req, res, next) => {
  try {
    const bills = await c('bills').find().toArray();
    for (const bill of bills) {
      for (const item of normalizeBillItems(bill.items)) {
        await c('products').updateOne(
          { id: toNumber(item.id) },
          { $inc: { stock: toNumber(item.qty), sold: -toNumber(item.qty) } },
        );
      }
    }
    await Promise.all([c('bills').deleteMany({}), c('customers').deleteMany({})]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/customers', async (req, res, next) => {
  try {
    res.json(serializeMany(await c('customers').find().sort({ lastVisit: -1 }).toArray()));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/customers', async (req, res, next) => {
  try {
    await c('customers').deleteMany({});
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/refills', async (req, res, next) => {
  try {
    res.json(serializeMany(await c('refills').find().sort({ date: -1 }).toArray()));
  } catch (error) {
    next(error);
  }
});

app.post('/api/refills', async (req, res, next) => {
  try {
    const productId = toNumber(req.body.product_id || req.body.productId || req.body.id);
    const qty = toNumber(req.body.qty);
    const product = await findProductById(productId);
    if (!product || qty <= 0) return res.status(400).json({ error: 'Invalid product or quantity' });

    await c('products').updateOne(
      { id: productId },
      { $inc: { stock: qty, opening_stock: qty } },
    );
    const refill = {
      id: await nextId('refills'),
      date: req.body.date ? new Date(req.body.date) : new Date(),
      product_id: productId,
      product: req.body.product || product.name,
      qty,
      by: req.body.by_user || req.body.by || 'system',
      created_at: new Date(),
    };
    await c('refills').insertOne(refill);
    res.status(201).json(serialize(refill));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/refills/:id', async (req, res, next) => {
  try {
    const id = toNumber(req.params.id);
    const refill = await c('refills').findOne({ id });
    if (refill) {
      await c('products').updateOne(
        { id: toNumber(refill.product_id) },
        { $inc: { stock: -toNumber(refill.qty), opening_stock: -toNumber(refill.qty) } },
      );
      await c('refills').deleteOne({ id });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/refills', async (req, res, next) => {
  try {
    const refills = await c('refills').find().toArray();
    for (const refill of refills) {
      await c('products').updateOne(
        { id: toNumber(refill.product_id) },
        { $inc: { stock: -toNumber(refill.qty), opening_stock: -toNumber(refill.qty) } },
      );
    }
    await c('refills').deleteMany({});
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/price-history', async (req, res, next) => {
  try {
    res.json(serializeMany(await c('price_history').find().sort({ date: -1 }).toArray()));
  } catch (error) {
    next(error);
  }
});

app.post('/api/price-history', async (req, res, next) => {
  try {
    const history = {
      id: await nextId('price_history'),
      date: req.body.date ? new Date(req.body.date) : new Date(),
      product_id: toNumber(req.body.product_id || req.body.productId),
      product: req.body.product || '',
      old: toNumber(req.body.old),
      new: toNumber(req.body.new),
      by: req.body.by || req.body.by_user || 'system',
      created_at: new Date(),
    };
    await c('price_history').insertOne(history);
    res.status(201).json(serialize(history));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/price-history/:id', async (req, res, next) => {
  try {
    await c('price_history').deleteOne({ id: toNumber(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/price-history', async (req, res, next) => {
  try {
    await c('price_history').deleteMany({});
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/accounts', async (req, res, next) => {
  try {
    const accounts = await c('accounts').find().sort({ user: 1 }).toArray();
    res.json(accounts.map(serializeAccount));
  } catch (error) {
    next(error);
  }
});

app.post('/api/accounts', async (req, res, next) => {
  try {
    const account = {
      user: String(req.body.user || '').trim(),
      pass: hashPassword(req.body.password || req.body.pass || ''),
      role: req.body.role || 'Staff',
      created_at: new Date(),
    };
    if (!account.user || !req.body.password) return res.status(400).json({ error: 'User and password are required' });
    await c('accounts').insertOne(account);
    res.status(201).json({ user: account.user, role: account.role, pass: '' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/accounts/:user/password', async (req, res, next) => {
  try {
    await c('accounts').updateOne(
      { user: req.params.user },
      { $set: { pass: hashPassword(req.body.password || '') } },
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/accounts/:user', async (req, res, next) => {
  try {
    if (req.params.user === 'admin') return res.status(400).json({ error: 'Admin cannot be deleted' });
    await c('accounts').deleteOne({ user: req.params.user });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const username = String(req.body.user || '').trim();
    const account = await c('accounts').findOne({ user: username });
    if (!account || !verifyPassword(req.body.password, account.pass)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({ user: account.user, role: account.role || 'Staff' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/settings', async (req, res, next) => {
  try {
    res.json(serialize(await c('settings').findOne({ key: 'main' })));
  } catch (error) {
    next(error);
  }
});

app.put('/api/settings', async (req, res, next) => {
  try {
    const settings = {
      gst: toNumber(req.body.gst),
      shop: req.body.shop || '',
      addr: req.body.addr || '',
      gstin: req.body.gstin || '',
      fssai: req.body.fssai || '',
      phone: req.body.phone || '',
    };
    await c('settings').updateOne({ key: 'main' }, { $set: settings }, { upsert: true });
    res.json({ success: true, ...settings });
  } catch (error) {
    next(error);
  }
});

app.get('/api/login-logs', async (req, res, next) => {
  try {
    await syncShiftLoginLogs();
    res.json(serializeMany(await c('login_logs').find().sort({ loginTime: -1, login_time: -1 }).toArray()));
  } catch (error) {
    next(error);
  }
});

app.post('/api/login-logs', async (req, res, next) => {
  try {
    const log = {
      id: await nextId('login_logs'),
      user: req.body.user || req.body.user_name,
      user_name: req.body.user || req.body.user_name,
      role: req.body.role || 'Staff',
      loginTime: req.body.loginTime || req.body.login_time || new Date().toISOString(),
      login_time: req.body.loginTime || req.body.login_time || new Date().toISOString(),
      logoutTime: null,
      logout_time: null,
      created_at: new Date(),
    };
    await c('login_logs').insertOne(log);
    res.status(201).json(serialize(log));
  } catch (error) {
    next(error);
  }
});

app.put('/api/login-logs/:id/logout', async (req, res, next) => {
  try {
    const logout = new Date().toISOString();
    await c('login_logs').updateOne(
      { id: toNumber(req.params.id) },
      { $set: { logoutTime: logout, logout_time: logout } },
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/login-logs/:id', async (req, res, next) => {
  try {
    await c('login_logs').deleteOne({ id: toNumber(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/login-logs', async (req, res, next) => {
  try {
    const roles = String(req.query.roles || '')
      .split(',')
      .map((role) => role.trim().toLowerCase())
      .filter(Boolean);
    const filter = roles.length ? { role: { $in: roles.map((role) => new RegExp(`^${role}$`, 'i')) } } : {};
    await c('login_logs').deleteMany(filter);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/shifts/active', async (req, res, next) => {
  try {
    const user = String(req.query.user || '').trim();
    const shift = await c('shifts').findOne({ user, active: true }, { sort: { shiftStart: -1 } });
    res.json(shift ? { active: true, ...serialize(shift) } : { active: false });
  } catch (error) {
    next(error);
  }
});

app.post('/api/shifts/start', async (req, res, next) => {
  try {
    const user = String(req.body.user || '').trim();
    const autoShiftEnd = new Date().toISOString();
    const activeShifts = await c('shifts').find({ user, active: true }).toArray();
    await c('shifts').updateMany({ user, active: true }, { $set: { active: false, shiftEnd: autoShiftEnd } });
    for (const activeShift of activeShifts) {
      await c('login_logs').updateOne(
        { shiftSessionId: activeShift.id, logoutTime: null },
        { $set: { logoutTime: autoShiftEnd, logout_time: autoShiftEnd, status: 'Completed' } },
      );
    }
    const shift = {
      id: await nextId('shifts'),
      user,
      role: req.body.role || 'Staff',
      shiftStart: req.body.shiftStart || new Date().toISOString(),
      active: true,
      created_at: new Date(),
    };
    await c('shifts').insertOne(shift);
    await c('login_logs').insertOne({
      id: await nextId('login_logs'),
      user,
      user_name: user,
      role: shift.role,
      loginTime: shift.shiftStart,
      login_time: shift.shiftStart,
      logoutTime: null,
      logout_time: null,
      shiftSessionId: shift.id,
      status: 'Active',
      created_at: new Date(),
    });
    res.status(201).json({ success: true, active: true, sessionId: shift.id, ...serialize(shift) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/shifts/end', async (req, res, next) => {
  try {
    const user = String(req.body.user || '').trim();
    const role = String(req.body.role || 'Staff').trim();
    const recipientEmail = String(
      req.body.recipientEmail ||
      process.env.SHIFT_REPORT_EMAIL ||
      process.env.MAIL_USER ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      '',
    ).trim();
    const shiftStart = req.body.shiftStart ? new Date(req.body.shiftStart) : new Date();
    const shiftEnd = new Date();

    if (!user) return res.status(400).json({ error: 'Shift user is required' });
    if (Number.isNaN(shiftStart.getTime())) return res.status(400).json({ error: 'Valid shift start time is required' });

    const filter = req.body.sessionId
      ? { id: toNumber(req.body.sessionId) }
      : { user, active: true };
    await c('shifts').updateOne(filter, {
      $set: {
        active: false,
        shiftEnd: shiftEnd.toISOString(),
        recipientEmail,
      },
    });
    const logout = shiftEnd.toISOString();
    await c('login_logs').updateOne(
      req.body.sessionId
        ? { shiftSessionId: toNumber(req.body.sessionId) }
        : { user, logoutTime: null },
      { $set: { logoutTime: logout, logout_time: logout, status: 'Completed' } },
    );

    const settings = await c('settings').findOne({ key: 'main' });
    const shopName = settings?.shop || 'Sri Nikil Tradings';
    const userRegex = new RegExp(`^${user.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const bills = await c('bills')
      .find({ by_user: userRegex, date: { $gte: shiftStart, $lte: shiftEnd } })
      .sort({ date: 1 })
      .toArray();
    const paymentBreakdown = getPaymentBreakdown(bills);
    const itemSummary = getShiftItemsSummary(bills);
    const totalShiftSales = bills.reduce((sum, bill) => sum + toNumber(bill.grand), 0);
    const report = {
      user,
      role,
      shiftStart: shiftStart.toISOString(),
      shiftEnd: shiftEnd.toISOString(),
      shiftStartDisplay: shiftStart.toLocaleString('en-GB'),
      shiftEndDisplay: shiftEnd.toLocaleString('en-GB'),
      billsCount: bills.length,
      totalItemsSold: itemSummary.totalItemsSold,
      totalSalesAmount: totalShiftSales,
      paymentBreakdown,
      productsSold: itemSummary.products,
    };

    const friendlyDate = shiftEnd.toLocaleDateString('en-GB');
    const subject = `Shift Report - ${shopName} - ${user} - ${friendlyDate}`;
    let emailStatus = 'skipped';
    let emailError = null;
    let emailSentAt = null;

    if (recipientEmail) {
      try {
        const emailBody = buildShiftReportEmail({ report, shopName, paymentBreakdown, itemSummary });
        await sendShiftReportEmail({
          recipient: recipientEmail,
          subject,
          text: emailBody.text,
          html: emailBody.html,
        });
        emailStatus = 'sent';
        emailSentAt = new Date();
      } catch (mailError) {
        emailStatus = 'failed';
        emailError = mailError.message || 'Email sending failed';
        console.error('Failed to send shift report mail:', mailError);
      }
    } else {
      emailError = 'Report recipient email is not configured';
    }

    await c('shift_reports').insertOne({
      id: await nextId('shift_reports'),
      session_id: req.body.sessionId ? toNumber(req.body.sessionId) : null,
      user,
      role,
      shift_start: shiftStart,
      shift_end: shiftEnd,
      total_bills: bills.length,
      total_items_sold: itemSummary.totalItemsSold,
      total_sales_amount: totalShiftSales,
      payment_breakdown: paymentBreakdown,
      products_sold: itemSummary.products,
      report_email: recipientEmail || null,
      report_subject: subject,
      email_status: emailStatus,
      email_error: emailError,
      email_sent_at: emailSentAt,
      status: 'Completed',
      created_at: new Date(),
    });

    await c('products').updateMany({}, [{ $set: { opening_stock: '$stock', sold: 0 } }]);

    res.json({
      success: true,
      message: emailStatus === 'sent'
        ? 'Shift closed and report sent successfully'
        : `Shift closed but mail ${emailStatus}`,
      emailedTo: emailStatus === 'sent' ? recipientEmail : null,
      emailStatus,
      emailError,
      shiftStart: shiftStart.toISOString(),
      shiftEnd: shiftEnd.toISOString(),
      billsCount: bills.length,
      totalItemsSold: itemSummary.totalItemsSold,
      totalSales: totalShiftSales,
      paymentBreakdown,
      promptNextShift: role.toLowerCase() !== 'admin',
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/products/opening-stock/sync', async (req, res, next) => {
  try {
    const products = await c('products').find().toArray();
    for (const product of products) {
      await c('products').updateOne(
        { id: product.id },
        { $set: { opening_stock: toNumber(product.stock), sold: 0 } },
      );
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/reset-sales-data', async (req, res, next) => {
  try {
    await Promise.all([
      c('bills').deleteMany({}),
      c('customers').deleteMany({}),
      c('refills').deleteMany({}),
      c('price_history').deleteMany({}),
      c('login_logs').deleteMany({}),
      c('shifts').deleteMany({}),
      c('products').updateMany({}, [{ $set: { stock: '$opening_stock', sold: 0 } }]),
    ]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/purchases', (req, res) => {
  res.status(201).json({ success: true });
});

app.use((error, req, res, _next) => {
  void _next;
  console.error(error);
  if (error.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value already exists' });
  }
  res.status(500).json({ error: error.message || 'Server error' });
});

initializeMongo()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Express Mongo API running on http://localhost:${port}`);
      console.log(`MongoDB database: ${mongoDbName}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Stop the running backend or set PORT to another value.`);
      } else {
        console.error('Failed to start Mongo API:', error);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('Failed to start Mongo API:', error);
    process.exit(1);
  });
