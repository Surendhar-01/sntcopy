const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envCandidates = [
  path.resolve(process.cwd(), '.env.development'),
  path.resolve(__dirname, '../.env.development')
];

function refreshRuntimeMailEnv() {
  const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
  if (!envPath) return;

  try {
    const env = fs.readFileSync(envPath, 'utf8');
    env.split(/\r?\n/).forEach((line) => {
      const [key, ...rest] = line.split('=');
      if (!key) return;
      const value = rest.join('=').trim();
      if (value) {
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.warn('Unable to refresh runtime mail env:', error.message);
  }
}

function isHashedPassword(value) {
  return typeof value === 'string' && value.startsWith('scrypt$');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password || ''), salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
  return `scrypt$16384$8$1$${salt}$${derived}`;
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

  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(plain, salt, expected.length, { N: Number(nStr), r: Number(rStr), p: Number(pStr) });
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function toMysqlDateTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function parseItems(rawItems) {
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

function getPaymentBreakdown(bills) {
  return (bills || []).reduce((acc, bill) => {
    const key = String(bill.payment || 'Unknown').trim() || 'Unknown';
    acc[key] = (acc[key] || 0) + Number(bill.grand || 0);
    return acc;
  }, {});
}

function buildCsv(headers, rows) {
  const escapeValue = (value) => {
    const text = value == null ? '' : String(value);
    if (/[,"\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  return [headers.map(escapeValue).join(','), ...rows.map((row) => row.map(escapeValue).join(','))].join('\n');
}

function getRemainingStockSummary(productRows, soldByProductId, refillByProductName) {
  const products = (productRows || []).map((product) => {
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
      healthyCount: products.filter((item) => item.status === 'Healthy').length,
      lowStockCount: products.filter((item) => item.status === 'Low Stock').length,
      outOfStockCount: products.filter((item) => item.status === 'Out of Stock').length
    },
    products
  };
}

function makeUniqueBillNo(baseBillNo = '') {
  const cleaned = String(baseBillNo || '').trim();
  const suffix = Date.now().toString().slice(-5);
  return cleaned ? `${cleaned}-${suffix}` : `SNT-${suffix}`;
}

module.exports = {
  refreshRuntimeMailEnv,
  isHashedPassword,
  hashPassword,
  verifyPassword,
  toMysqlDateTime,
  parseItems,
  getPaymentBreakdown,
  buildCsv,
  getRemainingStockSummary,
  makeUniqueBillNo
};
