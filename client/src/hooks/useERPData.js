import { useEffect, useState, useMemo, useCallback, useRef } from 'react';

const STORAGE_KEY = 'sri_nikil_erp_db';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const defaultProducts = [
  { id: 1, code: 'GNR-15K', name: 'Groundnut Oil (Refined) 15kg Tin', cat: 'Groundnut', unit: 'tins', price: 2920, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 2, code: 'GNR-05C', name: 'Groundnut Oil (Refined) 5L Can', cat: 'Groundnut', unit: 'cans', price: 930, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 3, code: 'GNR-02C', name: 'Groundnut Oil (Refined) 2L Can', cat: 'Groundnut', unit: 'cans', price: 383, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=2L+Can' },
  { id: 4, code: 'GNR-01B', name: 'Groundnut Oil (Refined) 1L Bottle', cat: 'Groundnut', unit: 'bottles', price: 188, stock: 30, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 5, code: 'GNR-01P', name: 'Groundnut Oil (Refined) 1L Packet', cat: 'Groundnut', unit: 'pkts', price: 184, stock: 50, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 6, code: 'GNR-HFP', name: 'Groundnut Oil (Refined) 1/2L Packet', cat: 'Groundnut', unit: 'pkts', price: 92, stock: 0, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  { id: 7, code: 'GNP-15K', name: 'Groundnut Oil (Pure) 15kg Tin', cat: 'Groundnut', unit: 'tins', price: 3000, stock: 8, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 8, code: 'GNP-05C', name: 'Groundnut Oil (Pure) 5L Can', cat: 'Groundnut', unit: 'cans', price: 955, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 9, code: 'GNP-01P', name: 'Groundnut Oil (Pure) 1L Packet', cat: 'Groundnut', unit: 'pkts', price: 193, stock: 40, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 10, code: 'SFR-15K', name: 'Sunflower Oil (Refined) 15kg Tin', cat: 'Sunflower', unit: 'tins', price: 2950, stock: 12, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 11, code: 'SFR-05C', name: 'Sunflower Oil (Refined) 5L Can', cat: 'Sunflower', unit: 'cans', price: 940, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 12, code: 'SFR-01P', name: 'Sunflower Oil (Refined) 1L Packet', cat: 'Sunflower', unit: 'pkts', price: 186, stock: 85, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 13, code: 'PAL-15K', name: 'Palm Oil 15kg Tin', cat: 'Palm', unit: 'tins', price: 2445, stock: 24, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 14, code: 'PAL-05C', name: 'Palm Oil 5L Can', cat: 'Palm', unit: 'cans', price: 780, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 15, code: 'PAL-01P', name: 'Palm Oil 1L Packet', cat: 'Palm', unit: 'pkts', price: 154, stock: 60, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 16, code: 'VAN-15K', name: 'Vanaspati 15kg Tin', cat: 'Vanaspati', unit: 'tins', price: 2700, stock: 5, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 17, code: 'SEM-01P', name: 'Sesame Oil (Mayil) 1L Packet', cat: 'Sesame', unit: 'pkts', price: 320, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 18, code: 'SEM-HFP', name: 'Sesame Oil (Mayil) 1/2L Packet', cat: 'Sesame', unit: 'pkts', price: 160, stock: 25, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  { id: 19, code: 'SEU-15K', name: 'Sesame Oil (Mukil) 15kg Tin', cat: 'Sesame', unit: 'tins', price: 4050, stock: 4, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 20, code: 'SEK-15K', name: 'Sesame Oil (Karmegam Premium) 15kg Tin', cat: 'Sesame', unit: 'tins', price: 4560, stock: 5, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 21, code: 'SEK-05C', name: 'Sesame Oil (Karmegam) 5L Can', cat: 'Sesame', unit: 'cans', price: 1575, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 22, code: 'SEK-01B', name: 'Sesame Oil (Karmegam) 1L Bottle', cat: 'Sesame', unit: 'bottles', price: 340, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 23, code: 'SEK-01P', name: 'Sesame Oil (Karmegam) 1L Packet', cat: 'Sesame', unit: 'pkts', price: 330, stock: 30, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 24, code: 'SEK-HFB', name: 'Sesame Oil (Karmegam) 1/2L Bottle', cat: 'Sesame', unit: 'bottles', price: 170, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Btl' },
  { id: 25, code: 'SEK-HFP', name: 'Sesame Oil (Karmegam) 1/2L Packet', cat: 'Sesame', unit: 'pkts', price: 165, stock: 25, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  { id: 26, code: 'SEK-200B', name: 'Sesame Oil (Karmegam) 200ml Bottle', cat: 'Sesame', unit: 'bottles', price: 70, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=200ml+Bottle' },
  { id: 27, code: 'CAS-01B', name: 'Castor Oil 1L Bottle', cat: 'Castor', unit: 'bottles', price: 220, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 28, code: 'CAS-HFB', name: 'Castor Oil 1/2L Bottle', cat: 'Castor', unit: 'bottles', price: 110, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Btl' },
  { id: 29, code: 'CON-01P', name: 'Coconut Oil 1L Packet', cat: 'Coconut', unit: 'pkts', price: 370, stock: 30, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 30, code: 'CON-01B', name: 'Coconut Oil 1L Bottle', cat: 'Coconut', unit: 'bottles', price: 370, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 31, code: 'CON-HFP', name: 'Coconut Oil 1/2L Packet', cat: 'Coconut', unit: 'pkts', price: 185, stock: 25, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  { id: 32, code: 'CON-HFB', name: 'Coconut Oil 1/2L Bottle', cat: 'Coconut', unit: 'bottles', price: 185, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Btl' },
  { id: 33, code: 'CON-200B', name: 'Coconut Oil 200g Bottle', cat: 'Coconut', unit: 'bottles', price: 100, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=200g+Bottle' },
  { id: 34, code: 'CON-100B', name: 'Coconut Oil 100g Bottle', cat: 'Coconut', unit: 'bottles', price: 50, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=100g+Bottle' }
];

const defaultDb = {
  products: defaultProducts.map((product) => ({
    ...product,
    opening_stock: 0,
    stock: 0,
    sold: 0
  })),
  bills: [],
  customers: [],
  suppliers: [],
  priceHistory: [],
  loginLogs: [],
  accounts: [],
  settings: {
    gst: 5,
    shop: 'Sri Nikil Tradings',
    addr: '058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004',
    gstin: '33AMCPD1118L1ZK',
    fssai: '12424007000946',
    phone: '94875 81302, 0424 2901803'
  },
  billSeq: 1000
};

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (text) {
    const looksLikeJson = contentType.includes('application/json') || contentType.includes('+json');
    if (looksLikeJson) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    } else {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
  }

  if (!response.ok) {
    const serverMessage = data?.detail || data?.message || data?.error;
    const isHtmlResponse = /^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text);
    const fallbackMessage = isHtmlResponse
      ? `API request failed (${response.status}). Backend returned HTML instead of JSON.`
      : `Request failed: ${response.status}`;

    throw new Error(serverMessage || fallbackMessage);
  }

  return data;
}

const parseBillItems = (rawItems) => {
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
};

const getNextBillSequence = (bills) => {
  const extractedSeq = bills
    .map((bill) => {
      const match = String(bill.billNo || bill.bill_no || '').match(/SNT-(\d+)/i);
      return match ? Number(match[1]) : 0;
    })
    .filter((value) => Number.isFinite(value));

  const maxSeq = extractedSeq.length > 0 ? Math.max(...extractedSeq) : 0;
  return Math.max(defaultDb.billSeq, maxSeq + 1);
};

function normalizeDb(data) {
  const merged = { ...defaultDb, ...(data || {}) };
  const incomingProducts = Array.isArray(merged.products) ? merged.products : defaultProducts;
  const incomingAccounts = Array.isArray(merged.accounts) ? merged.accounts : defaultDb.accounts;
  const incomingSettings = Array.isArray(merged.settings)
    ? (merged.settings[0] || {})
    : (merged.settings || {});

  merged.products = incomingProducts.map((product, index) => ({
    ...product,
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    sold: Number(product.sold || 0),
    opening_stock: Math.max(Number(product.opening_stock ?? 0), Number(product.stock || 0)),
    image: product.image || defaultProducts[index]?.image || 'https://placehold.co/150x150?text=Product'
  }));

  merged.bills = (Array.isArray(merged.bills) ? merged.bills : []).map((bill) => ({
    ...bill,
    billNo: bill.billNo || bill.bill_no,
    by: bill.by || bill.by_user,
    subtotal: Number(bill.subtotal || 0),
    cgst: Number(bill.cgst || 0),
    sgst: Number(bill.sgst || 0),
    grand: Number(bill.grand || 0),
    items: parseBillItems(bill.items)
  }));

  merged.customers = (Array.isArray(merged.customers) ? merged.customers : []).map((customer) => ({
    ...customer,
    visits: Number(customer.visits || 0),
    total: Number(customer.total || 0),
    firstVisit: customer.firstVisit || customer.lastVisit || null,
    lastVisit: customer.lastVisit || customer.firstVisit || null
  }));

  merged.purchases = (Array.isArray(merged.purchases) ? merged.purchases : []).map((purchase) => ({
    ...purchase,
    qty: Number(purchase.qty || 0),
    amount: Number(purchase.amount || 0),
    by: purchase.by || purchase.by_user
  }));

  merged.refills = (Array.isArray(merged.refills) ? merged.refills : []).map((refill) => ({
    ...refill,
    qty: Number(refill.qty || 0),
    by: refill.by || refill.by_user
  }));

  const incomingPriceHistory = Array.isArray(merged.priceHistory) ? merged.priceHistory : [];
  merged.priceHistory = incomingPriceHistory.map((history) => ({
    ...history,
    old: Number(history.old ?? history.old_price ?? 0),
    new: Number(history.new ?? history.new_price ?? 0),
    by: history.by || history.by_user
  }));

  merged.loginLogs = (Array.isArray(merged.loginLogs) ? merged.loginLogs : []).map((log) => ({
    ...log,
    user: log.user || log.user_name,
    loginTime: log.loginTime || log.login_time,
    logoutTime: log.logoutTime || log.logout_time
  }));

  merged.accounts = incomingAccounts
    .filter((account) => account && account.user)
    .map((account) => ({
      ...account,
      pass: account.pass || '',
      role: account.role || (account.user?.toLowerCase() === 'admin' ? 'Admin' : 'Staff')
    }));

  if (merged.accounts.length === 0) {
    merged.accounts = defaultDb.accounts;
  }

  merged.settings = {
    ...defaultDb.settings,
    ...incomingSettings,
    gst: Number(incomingSettings?.gst ?? defaultDb.settings.gst)
  };

  merged.billSeq = getNextBillSequence(merged.bills);

  return merged;
}

function makeUniqueBillNo(baseBillNo = '') {
  const cleaned = String(baseBillNo || '').trim();
  if (cleaned) {
    return `${cleaned}-${Date.now().toString().slice(-5)}`;
  }
  return `SNT-${Date.now()}`;
}

function loadStoredDb() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved || saved === 'undefined') {
      return defaultDb;
    }
    return normalizeDb(JSON.parse(saved));
  } catch (error) {
    console.error('Failed to load ERP data, resetting to defaults', error);
    return defaultDb;
  }
}

export function useERPData() {
  const initial = useMemo(() => loadStoredDb(), []);
  const [products, setProducts] = useState(initial.products);
  const [bills, setBills] = useState(initial.bills);
  const [customers, setCustomers] = useState(initial.customers);
  const [refills, setRefills] = useState(initial.refills);
  const [priceHistory, setPriceHistory] = useState(initial.priceHistory);
  const [loginLogs, setLoginLogs] = useState(initial.loginLogs);
  const [accounts, setAccounts] = useState(initial.accounts);
  const [settings, setSettings] = useState(initial.settings);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mutationNotice, setMutationNotice] = useState(null);

  const db = useMemo(() => ({
    products,
    bills,
    customers,
    refills,
    priceHistory,
    loginLogs,
    accounts,
    settings,
    billSeq: getNextBillSequence(bills)
  }), [products, bills, customers, refills, priceHistory, loginLogs, accounts, settings]);

  const initDone = useRef(false);
  const pendingRequests = useRef({});
  const noticeTimeout = useRef(null);
  const lastFetched = useRef({
    products: 0,
    bills: 0,
    customers: 0,
    refills: 0,
    priceHistory: 0,
    loginLogs: 0,
    accounts: 0,
    settings: 0
  });

  const CACHE_TTL = 15000; // 15 seconds cache duration

  const shouldFetch = useCallback((resource, force) => {
    if (force) return true;
    const last = lastFetched.current[resource] || 0;
    return Date.now() - last > CACHE_TTL;
  }, []);

  const showMutationNotice = useCallback((message, type = 'success') => {
    if (noticeTimeout.current) {
      window.clearTimeout(noticeTimeout.current);
    }

    setMutationNotice({
      id: Date.now(),
      message,
      type
    });

    noticeTimeout.current = window.setTimeout(() => {
      setMutationNotice(null);
      noticeTimeout.current = null;
    }, 2600);
  }, []);

  const fetchSettings = useCallback(async (force = false) => {
    if (!shouldFetch('settings', force)) {
      return settings;
    }
    if (pendingRequests.current.settings && !force) {
      return pendingRequests.current.settings;
    }
    const promise = (async () => {
      try {
        const data = await apiRequest('/api/settings');
        const normalized = {
          ...defaultDb.settings,
          ...(data || {}),
          gst: Number(data?.gst ?? defaultDb.settings.gst)
        };
        setSettings(normalized);
        lastFetched.current.settings = Date.now();
        return normalized;
      } catch (e) {
        console.error('Failed to fetch settings:', e);
        throw e;
      } finally {
        delete pendingRequests.current.settings;
      }
    })();
    pendingRequests.current.settings = promise;
    return promise;
  }, [shouldFetch, settings]);

  const fetchProducts = useCallback(async (force = false) => {
    if (!shouldFetch('products', force)) {
      return products;
    }
    if (pendingRequests.current.products && !force) {
      return pendingRequests.current.products;
    }
    const promise = (async () => {
      try {
        const data = await apiRequest('/api/products');
        const normalized = (Array.isArray(data) ? data : []).map((product, index) => ({
          ...product,
          price: Number(product.price || 0),
          stock: Number(product.stock || 0),
          sold: Number(product.sold || 0),
          opening_stock: Math.max(Number(product.opening_stock ?? 0), Number(product.stock || 0)),
          image: product.image || defaultProducts[index]?.image || 'https://placehold.co/150x150?text=Product'
        }));
        setProducts(normalized);
        lastFetched.current.products = Date.now();
        return normalized;
      } catch (e) {
        console.error('Failed to fetch products:', e);
        throw e;
      } finally {
        delete pendingRequests.current.products;
      }
    })();
    pendingRequests.current.products = promise;
    return promise;
  }, [shouldFetch, products]);

  const fetchBills = useCallback(async (force = false) => {
    if (!shouldFetch('bills', force)) {
      return bills;
    }
    if (pendingRequests.current.bills && !force) {
      return pendingRequests.current.bills;
    }
    const promise = (async () => {
      try {
        const data = await apiRequest('/api/bills');
        const normalized = (Array.isArray(data) ? data : []).map((bill) => ({
          ...bill,
          billNo: bill.billNo || bill.bill_no,
          by: bill.by || bill.by_user,
          subtotal: Number(bill.subtotal || 0),
          cgst: Number(bill.cgst || 0),
          sgst: Number(bill.sgst || 0),
          grand: Number(bill.grand || 0),
          items: parseBillItems(bill.items)
        }));
        setBills(normalized);
        lastFetched.current.bills = Date.now();
        return normalized;
      } catch (e) {
        console.error('Failed to fetch bills:', e);
        throw e;
      } finally {
        delete pendingRequests.current.bills;
      }
    })();
    pendingRequests.current.bills = promise;
    return promise;
  }, [shouldFetch, bills]);

  const fetchCustomers = useCallback(async (force = false) => {
    if (!shouldFetch('customers', force)) {
      return customers;
    }
    if (pendingRequests.current.customers && !force) {
      return pendingRequests.current.customers;
    }
    const promise = (async () => {
      try {
        const data = await apiRequest('/api/customers');
        const normalized = (Array.isArray(data) ? data : []).map((customer) => ({
          ...customer,
          visits: Number(customer.visits || 0),
          total: Number(customer.total || 0),
          firstVisit: customer.firstVisit || customer.lastVisit || null,
          lastVisit: customer.lastVisit || customer.firstVisit || null
        }));
        setCustomers(normalized);
        lastFetched.current.customers = Date.now();
        return normalized;
      } catch (e) {
        console.error('Failed to fetch customers:', e);
        throw e;
      } finally {
        delete pendingRequests.current.customers;
      }
    })();
    pendingRequests.current.customers = promise;
    return promise;
  }, [shouldFetch, customers]);

  const fetchRefills = useCallback(async (force = false) => {
    if (!shouldFetch('refills', force)) {
      return refills;
    }
    if (pendingRequests.current.refills && !force) {
      return pendingRequests.current.refills;
    }
    const promise = (async () => {
      try {
        const data = await apiRequest('/api/refills');
        const normalized = (Array.isArray(data) ? data : []).map((refill) => ({
          ...refill,
          qty: Number(refill.qty || 0),
          by: refill.by || refill.by_user
        }));
        setRefills(normalized);
        lastFetched.current.refills = Date.now();
        return normalized;
      } catch (e) {
        console.error('Failed to fetch refills:', e);
        throw e;
      } finally {
        delete pendingRequests.current.refills;
      }
    })();
    pendingRequests.current.refills = promise;
    return promise;
  }, [shouldFetch, refills]);

  const fetchPriceHistory = useCallback(async (force = false) => {
    if (!shouldFetch('priceHistory', force)) {
      return priceHistory;
    }
    if (pendingRequests.current.priceHistory && !force) {
      return pendingRequests.current.priceHistory;
    }
    const promise = (async () => {
      try {
        const data = await apiRequest('/api/price-history');
        const normalized = (Array.isArray(data) ? data : []).map((history) => ({
          ...history,
          old: Number(history.old ?? history.old_price ?? 0),
          new: Number(history.new ?? history.new_price ?? 0),
          by: history.by || history.by_user
        }));
        setPriceHistory(normalized);
        lastFetched.current.priceHistory = Date.now();
        return normalized;
      } catch (e) {
        console.error('Failed to fetch price history:', e);
        throw e;
      } finally {
        delete pendingRequests.current.priceHistory;
      }
    })();
    pendingRequests.current.priceHistory = promise;
    return promise;
  }, [shouldFetch, priceHistory]);

  const fetchLoginLogs = useCallback(async (force = false) => {
    if (!shouldFetch('loginLogs', force)) {
      return loginLogs;
    }
    if (pendingRequests.current.loginLogs && !force) {
      return pendingRequests.current.loginLogs;
    }
    const promise = (async () => {
      try {
        const data = await apiRequest('/api/login-logs');
        const normalized = (Array.isArray(data) ? data : []).map((log) => ({
          ...log,
          user: log.user || log.user_name,
          loginTime: log.loginTime || log.login_time,
          logoutTime: log.logoutTime || log.logout_time
        }));
        setLoginLogs(normalized);
        lastFetched.current.loginLogs = Date.now();
        return normalized;
      } catch (e) {
        console.error('Failed to fetch login logs:', e);
        throw e;
      } finally {
        delete pendingRequests.current.loginLogs;
      }
    })();
    pendingRequests.current.loginLogs = promise;
    return promise;
  }, [shouldFetch, loginLogs]);

  const fetchAccounts = useCallback(async (force = false) => {
    if (!shouldFetch('accounts', force)) {
      return accounts;
    }
    if (pendingRequests.current.accounts && !force) {
      return pendingRequests.current.accounts;
    }
    const promise = (async () => {
      try {
        const data = await apiRequest('/api/accounts');
        const normalized = (Array.isArray(data) ? data : []).filter((account) => account && account.user).map((account) => ({
          ...account,
          pass: account.pass || '',
          role: account.role || (account.user?.toLowerCase() === 'admin' ? 'Admin' : 'Staff')
        }));
        setAccounts(normalized);
        lastFetched.current.accounts = Date.now();
        return normalized;
      } catch (e) {
        console.error('Failed to fetch accounts:', e);
        throw e;
      } finally {
        delete pendingRequests.current.accounts;
      }
    })();
    pendingRequests.current.accounts = promise;
    return promise;
  }, [shouldFetch, accounts]);

  const refreshData = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      await Promise.all([
        fetchProducts(true).catch(() => {}),
        fetchBills(true).catch(() => {}),
        fetchCustomers(true).catch(() => {}),
        fetchRefills(true).catch(() => {}),
        fetchPriceHistory(true).catch(() => {}),
        fetchLoginLogs(true).catch(() => {}),
        fetchAccounts(true).catch(() => {}),
        fetchSettings(true).catch(() => {})
      ]);
      setError('');
      return db;
    } catch (refreshError) {
      console.error('Failed to refresh ERP data', refreshError);
      setError('Backend data unavailable. Showing local data.');
      throw refreshError;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [fetchProducts, fetchBills, fetchCustomers, fetchRefills, fetchPriceHistory, fetchLoginLogs, fetchAccounts, fetchSettings, db]);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSettings(true).catch(() => {}),
          fetchProducts(true).catch(() => {}),
          fetchBills(true).catch(() => {})
        ]);
        setError('');
      } catch {
        setError('Backend data unavailable. Showing local data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (noticeTimeout.current) {
      window.clearTimeout(noticeTimeout.current);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }
      try {
        const parsed = normalizeDb(JSON.parse(event.newValue));
        setProducts(parsed.products);
        setBills(parsed.bills);
        setCustomers(parsed.customers);
        setRefills(parsed.refills);
        setPriceHistory(parsed.priceHistory);
        setLoginLogs(parsed.loginLogs);
        setAccounts(parsed.accounts);
        setSettings(parsed.settings);
      } catch (error) {
        console.warn('Failed to sync ERP data from another tab', error);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateDb = useCallback((key, value) => {
    if (key === 'products') setProducts(value);
    else if (key === 'bills') setBills(value);
    else if (key === 'customers') setCustomers(value);
    else if (key === 'refills') setRefills(value);
    else if (key === 'priceHistory') setPriceHistory(value);
    else if (key === 'loginLogs') setLoginLogs(value);
    else if (key === 'accounts') setAccounts(value);
    else if (key === 'settings') setSettings(value);
  }, []);

  const runMutation = useCallback(async (path, options, fetchers = [], config = {}) => {
    try {
      const result = await apiRequest(path, options);
      if (fetchers.length > 0) {
        await Promise.all(fetchers.map((fetcher) => fetcher(true)));
      } else {
        await refreshData();
      }
      setError('');
      showMutationNotice(config.successMessage || 'Updated successfully');
      return result;
    } catch (mutationError) {
      const message = mutationError?.message || 'Update failed';
      setError(message);
      showMutationNotice(message, 'error');
      throw mutationError;
    }
  }, [refreshData, showMutationNotice]);

  const restoreDatabase = useCallback((data) => {
    const parsed = normalizeDb(data);
    setProducts(parsed.products);
    setBills(parsed.bills);
    setCustomers(parsed.customers);
    setRefills(parsed.refills);
    setPriceHistory(parsed.priceHistory);
    setLoginLogs(parsed.loginLogs);
    setAccounts(parsed.accounts);
    setSettings(parsed.settings);
  }, []);

  const login = useCallback(async (user, password) => {
    try {
      return await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ user, password })
      });
    } catch (loginError) {
      console.warn('Failed to authenticate with backend', loginError);
      throw loginError;
    }
  }, []);

  const addProduct = useCallback((product) => runMutation('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      code: product.code || '',
      name: product.name,
      cat: product.cat,
      unit: product.unit,
      price: Number(product.price),
      stock: Number(product.stock || 0),
      image: product.image || null
    })
  }, [fetchProducts, fetchPriceHistory]), [runMutation, fetchProducts, fetchPriceHistory]);

  const deleteProduct = useCallback((id) => runMutation(`/api/products/${id}`, { method: 'DELETE' }, [fetchProducts]), [runMutation, fetchProducts]);

  const addBill = useCallback(async (bill) => {
    const payload = {
      billNo: bill.billNo || makeUniqueBillNo(),
      customer: bill.customer,
      phone: bill.phone,
      payment: bill.payment,
      items: bill.items,
      date: bill.date || new Date().toISOString(),
      subtotal: Number(bill.subtotal),
      cgst: Number(bill.cgst),
      sgst: Number(bill.sgst),
      grand: Number(bill.grand),
      by_user: bill.by || bill.by_user
    };

    await runMutation('/api/bills', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, [fetchProducts, fetchBills, fetchCustomers]);
  }, [runMutation, fetchProducts, fetchBills, fetchCustomers]);

  const deleteBill = useCallback(async (id) => {
    try {
      await runMutation(`/api/bills/${id}`, { method: 'DELETE' }, [fetchProducts, fetchBills, fetchCustomers]);
    } catch (mutationError) {
      console.warn('Failed to delete bill in backend', mutationError);
      throw mutationError;
    }
  }, [runMutation, fetchProducts, fetchBills, fetchCustomers]);

  const clearBills = useCallback(async () => {
    try {
      await runMutation('/api/bills', { method: 'DELETE' }, [fetchProducts, fetchBills, fetchCustomers]);
    } catch (mutationError) {
      console.warn('Failed to clear bills in backend', mutationError);
      throw mutationError;
    }
  }, [runMutation, fetchProducts, fetchBills, fetchCustomers]);

  const addPurchase = useCallback(async (purchase) => {
    try {
      await runMutation('/api/purchases', {
        method: 'POST',
        body: JSON.stringify({
          supplier: purchase.supplier,
          product: purchase.product,
          qty: Number(purchase.qty),
          amount: Number(purchase.amount),
          by_user: purchase.by || purchase.by_user
        })
      }, [fetchProducts]);
    } catch (mutationError) {
      console.warn('Failed to save purchase to backend', mutationError);
      throw mutationError;
    }
  }, [runMutation, fetchProducts]);

  const updateProductPrice = useCallback((id, newPrice, userName) => runMutation(`/api/products/${id}/price`, {
    method: 'PUT',
    body: JSON.stringify({
      new_price: Number(newPrice),
      by_user: userName
    })
  }, [fetchProducts, fetchPriceHistory]), [runMutation, fetchProducts, fetchPriceHistory]);

  const deletePriceHistory = useCallback((id) => runMutation(`/api/price-history/${id}`, { method: 'DELETE' }, [fetchPriceHistory]), [runMutation, fetchPriceHistory]);

  const clearPriceHistory = useCallback(async () => {
    try {
      await runMutation('/api/price-history', { method: 'DELETE' }, [fetchPriceHistory]);
    } catch (mutationError) {
      console.warn('Failed to clear price history in backend', mutationError);
      throw mutationError;
    }
  }, [runMutation, fetchPriceHistory]);

  const addRefill = useCallback(async (refill) => {
    await runMutation('/api/refills', {
      method: 'POST',
      body: JSON.stringify({
        product_id: refill.product_id || refill.productId || refill.id,
        product: refill.product,
        qty: Number(refill.qty),
        by_user: refill.by || refill.by_user
      })
    }, [fetchProducts, fetchRefills]);
  }, [runMutation, fetchProducts, fetchRefills]);

  const deleteRefill = useCallback((id) => runMutation(`/api/refills/${id}`, { method: 'DELETE' }, [fetchProducts, fetchRefills]), [runMutation, fetchProducts, fetchRefills]);

  const clearRefills = useCallback(async () => {
    try {
      await runMutation('/api/refills', { method: 'DELETE' }, [fetchProducts, fetchRefills]);
    } catch (mutationError) {
      console.warn('Failed to clear refills in backend', mutationError);
      throw mutationError;
    }
  }, [runMutation, fetchProducts, fetchRefills]);

  const addLoginLog = useCallback(async (log) => {
    return runMutation('/api/login-logs', {
      method: 'POST',
      body: JSON.stringify({
        user_name: log.user || log.user_name,
        role: log.role,
        login_time: log.loginTime || log.login_time
      })
    }, [fetchLoginLogs]);
  }, [runMutation, fetchLoginLogs]);

  const updateLoginLog = useCallback(async (id) => {
    return runMutation(`/api/login-logs/${id}/logout`, { method: 'PUT' }, [fetchLoginLogs]);
  }, [runMutation, fetchLoginLogs]);

  const startShift = useCallback(async ({ user, role, shiftStart }) => {
    const response = await apiRequest('/api/shifts/start', {
      method: 'POST',
      body: JSON.stringify({
        user,
        role,
        shiftStart: shiftStart || new Date().toISOString()
      })
    });
    await fetchLoginLogs(true);
    showMutationNotice(response?.message || 'Updated successfully');
    return response;
  }, [fetchLoginLogs, showMutationNotice]);

  const endShift = useCallback(async ({ user, role, sessionId, shiftStart, recipientEmail }) => {
    const response = await apiRequest('/api/shifts/end', {
      method: 'POST',
      body: JSON.stringify({
        user,
        role,
        sessionId,
        shiftStart,
        recipientEmail
      })
    });
    await Promise.all([
      fetchProducts(true),
      fetchBills(true),
      fetchLoginLogs(true)
    ]);
    showMutationNotice(response?.message || 'Updated successfully');
    return response;
  }, [fetchProducts, fetchBills, fetchLoginLogs, showMutationNotice]);

  const deleteLoginLog = useCallback((id) => runMutation(`/api/login-logs/${id}`, { method: 'DELETE' }, [fetchLoginLogs]), [runMutation, fetchLoginLogs]);

  const clearLoginLogs = useCallback(async ({ roles = [] } = {}) => {
    const normalizedRoles = (Array.isArray(roles) ? roles : [])
      .map((role) => String(role || '').trim())
      .filter(Boolean);
    const query = normalizedRoles.length > 0
      ? `?roles=${encodeURIComponent(normalizedRoles.join(','))}`
      : '';

    try {
      await runMutation(`/api/login-logs${query}`, { method: 'DELETE' }, [fetchLoginLogs]);
    } catch (logError) {
      console.warn('Failed to clear login logs in backend', logError);
      throw logError;
    }
  }, [runMutation, fetchLoginLogs]);

  const clearCustomers = useCallback(async () => {
    try {
      await runMutation('/api/customers', { method: 'DELETE' }, [fetchCustomers]);
    } catch (mutationError) {
      console.warn('Failed to clear customers in backend', mutationError);
      throw mutationError;
    }
  }, [runMutation, fetchCustomers]);

  const resetProductStock = useCallback(async () => {
    try {
      return await runMutation('/api/products/opening-stock/sync', { method: 'PUT' }, [fetchProducts]);
    } catch (mutationError) {
      console.warn('Failed to reset product stock in backend', mutationError);
      throw mutationError;
    }
  }, [runMutation, fetchProducts]);

  const resetSalesData = useCallback(async () => {
    try {
      return await runMutation('/api/reset-sales-data', { method: 'POST' }, [
        fetchProducts,
        fetchBills,
        fetchCustomers,
        fetchRefills,
        fetchPriceHistory,
        fetchLoginLogs
      ]);
    } catch (mutationError) {
      console.warn('Failed to reset sales data in backend', mutationError);
      throw mutationError;
    }
  }, [runMutation, fetchProducts, fetchBills, fetchCustomers, fetchRefills, fetchPriceHistory, fetchLoginLogs]);

  const updateSettings = useCallback(async (nextSettings) => {
    try {
      await runMutation('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          gst: Number(nextSettings.gst || 0),
          shop: nextSettings.shop || '',
          addr: nextSettings.addr || '',
          gstin: nextSettings.gstin || '',
          fssai: nextSettings.fssai || '',
          phone: nextSettings.phone || ''
        })
      }, [fetchSettings]);
    } catch (mutationError) {
      console.warn('Failed to update settings in backend', mutationError);
      throw mutationError;
    }
  }, [runMutation, fetchSettings]);

  const addStaff = useCallback((account) => runMutation('/api/accounts', {
    method: 'POST',
    body: JSON.stringify({
      user: account.user,
      password: account.pass,
      role: account.role
    })
  }, [fetchAccounts]), [runMutation, fetchAccounts]);

  const deleteStaff = useCallback((username) => runMutation(`/api/accounts/${encodeURIComponent(username)}`, {
    method: 'DELETE'
  }, [fetchAccounts]), [runMutation, fetchAccounts]);

  const updateStaffPassword = useCallback(async (username, password) => {
    await runMutation(`/api/accounts/${encodeURIComponent(username)}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password: String(password || '') })
    }, [fetchAccounts]);
  }, [runMutation, fetchAccounts]);

  const actions = useMemo(() => ({
    refreshData,
    fetchProducts,
    fetchBills,
    fetchCustomers,
    fetchRefills,
    fetchPriceHistory,
    fetchLoginLogs,
    fetchAccounts,
    fetchSettings,
    updateDb,
    restoreDatabase,
    login,
    addProduct,
    deleteProduct,
    addBill,
    deleteBill,
    clearBills,
    addPurchase,
    updateProductPrice,
    deletePriceHistory,
    clearPriceHistory,
    addRefill,
    deleteRefill,
    clearRefills,
    addLoginLog,
    updateLoginLog,
    startShift,
    endShift,
    deleteLoginLog,
    clearLoginLogs,
    clearCustomers,
    resetProductStock,
    resetSalesData,
    updateSettings,
    addStaff,
    deleteStaff,
    updateStaffPassword
  }), [
    refreshData,
    fetchProducts,
    fetchBills,
    fetchCustomers,
    fetchRefills,
    fetchPriceHistory,
    fetchLoginLogs,
    fetchAccounts,
    fetchSettings,
    updateDb,
    restoreDatabase,
    login,
    addProduct,
    deleteProduct,
    addBill,
    deleteBill,
    clearBills,
    addPurchase,
    updateProductPrice,
    deletePriceHistory,
    clearPriceHistory,
    addRefill,
    deleteRefill,
    clearRefills,
    addLoginLog,
    updateLoginLog,
    startShift,
    endShift,
    deleteLoginLog,
    clearLoginLogs,
    clearCustomers,
    resetProductStock,
    resetSalesData,
    updateSettings,
    addStaff,
    deleteStaff,
    updateStaffPassword
  ]);

  return useMemo(() => ({
    db,
    loading,
    error,
    mutationNotice,
    ...actions
  }), [db, loading, error, mutationNotice, actions]);
}
