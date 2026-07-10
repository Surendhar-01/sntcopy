"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMysqlDateTime = toMysqlDateTime;
exports.formatCurrency = formatCurrency;
exports.escapeHtml = escapeHtml;
exports.parseItems = parseItems;
exports.isHashedPassword = isHashedPassword;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.buildCsv = buildCsv;
exports.getPaymentBreakdown = getPaymentBreakdown;
exports.getRemainingStockSummary = getRemainingStockSummary;
const crypto = __importStar(require("crypto"));
function toMysqlDateTime(value) {
    const parsed = value ? new Date(value) : new Date();
    if (Number.isNaN(parsed.getTime())) {
        const now = new Date();
        return now.toLocaleString('sv').replace('T', ' ').slice(0, 19);
    }
    return parsed.toLocaleString('sv').replace('T', ' ').slice(0, 19);
}
function formatCurrency(value) {
    return `Rs ${Number(value || 0).toFixed(2)}`;
}
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function parseItems(rawItems) {
    if (Array.isArray(rawItems))
        return rawItems;
    if (typeof rawItems === 'string') {
        try {
            const parsed = JSON.parse(rawItems);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    return [];
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
    if (prefix !== 'scrypt' || !salt || !hashHex)
        return false;
    const N = Number(nStr || 16384);
    const r = Number(rStr || 8);
    const p = Number(pStr || 1);
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(plain, salt, expected.length, { N, r, p });
    if (actual.length !== expected.length)
        return false;
    return crypto.timingSafeEqual(actual, expected);
}
function buildCsv(headers, rows) {
    const escapeCsvValue = (value) => {
        const normalized = value == null ? '' : String(value);
        if (/[",\n]/.test(normalized)) {
            return `"${normalized.replace(/"/g, '""')}"`;
        }
        return normalized;
    };
    return [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n');
}
function getPaymentBreakdown(bills) {
    return bills.reduce((acc, bill) => {
        const key = String(bill.payment || 'Unknown').trim() || 'Unknown';
        acc[key] = Number(acc[key] || 0) + Number(bill.grand || 0);
        return acc;
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
            id: Number(product.id), name: product.name, category: product.cat || '',
            unit: product.unit || '', price: Number(product.price || 0),
            estimatedOpeningStock, soldInShift, refilledInShift, currentStock, status,
        };
    });
    return {
        totals: {
            totalProducts: products.length,
            healthyCount: products.filter((p) => p.status === 'Healthy').length,
            lowStockCount: products.filter((p) => p.status === 'Low Stock').length,
            outOfStockCount: products.filter((p) => p.status === 'Out of Stock').length,
        },
        products,
    };
}
//# sourceMappingURL=utils.js.map