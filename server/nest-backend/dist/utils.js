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
exports.isHashedPassword = isHashedPassword;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const crypto = __importStar(require("crypto"));
function isHashedPassword(value) {
    return typeof value === 'string' && value.startsWith('scrypt$');
}
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto
        .scryptSync(String(password || ''), salt, 64, { N: 16384, r: 8, p: 1 })
        .toString('hex');
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
    const actual = crypto.scryptSync(plain, salt, expected.length, {
        N: Number(nStr),
        r: Number(rStr),
        p: Number(pStr),
    });
    return (actual.length === expected.length &&
        crypto.timingSafeEqual(actual, expected));
}
//# sourceMappingURL=utils.js.map