import React, { useEffect, useEffectEvent, useMemo, useState } from 'react';
import {
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileAddOutlined,
  FileTextOutlined,
  MinusOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  SearchOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme as antdTheme,
} from 'antd';
import { useTheme } from '../context/useTheme';
import { isRole, USER_ROLES } from '../utils/roles';
const { Text } = Typography;
const billingStyles = ".billing-page {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  min-width: 0;\n  width: 100%;\n}\n\n.billing-layout {\n  display: grid;\n  grid-template-columns: minmax(0, 1.7fr) minmax(340px, 1fr);\n  gap: 18px;\n  align-items: start;\n}\n\n.billing-main {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  min-width: 0;\n}\n\n.billing-page .ant-card {\n  background: var(--card);\n  border-color: var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px var(--shadow-soft);\n}\n\n.billing-page .ant-card-body,\n.billing-page .ant-card-head,\n.billing-page .ant-typography {\n  color: var(--text) !important;\n}\n\n.billing-page .ant-card-head {\n  min-height: 52px;\n  padding: 0 20px;\n  border-bottom-color: var(--border);\n}\n\n.billing-page .ant-card-head-title {\n  color: var(--text);\n  font-weight: 800;\n}\n\n.billing-shop-copy {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin-bottom: 16px;\n}\n\n.billing-form {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 0 14px;\n}\n\n.billing-form .ant-form-item:nth-last-child(-n + 2) {\n  grid-column: span 1;\n}\n\n.billing-page .ant-form-item {\n  margin-bottom: 14px;\n}\n\n.billing-page .ant-form-item-label > label {\n  color: var(--text) !important;\n  font-weight: 700;\n}\n\n.billing-bill-no-input,\n.billing-bill-no {\n  color: var(--accent) !important;\n  font-weight: 800;\n}\n\n.billing-cart-card {\n  overflow: hidden;\n}\n\n.billing-cart-card .ant-card-body {\n  padding: 0;\n}\n\n.billing-product-trigger {\n  margin: 16px;\n  width: calc(100% - 32px);\n}\n\n.billing-cart-card .ant-table,\n.billing-preview-table .ant-table {\n  background: transparent;\n  color: var(--text);\n  table-layout: fixed;\n}\n\n.billing-cart-card .ant-table-thead > tr > th,\n.billing-preview-table .ant-table-thead > tr > th {\n  background: var(--surface) !important;\n  color: var(--text2) !important;\n  border-bottom-color: var(--border);\n  font-weight: 800;\n  padding: 13px 22px;\n  vertical-align: middle;\n}\n\n.billing-cart-card .ant-table-thead > tr > th::before,\n.billing-preview-table .ant-table-thead > tr > th::before {\n  display: none !important;\n}\n\n.billing-cart-card .ant-table-tbody > tr > td,\n.billing-preview-table .ant-table-tbody > tr > td {\n  background: var(--card);\n  border-bottom-color: var(--border);\n  color: var(--text);\n  height: 58px;\n  padding: 10px 22px;\n  vertical-align: middle;\n}\n\n.billing-cart-card .ant-table-tbody > tr:hover > td,\n.billing-preview-table .ant-table-tbody > tr:hover > td {\n  background: var(--surface-hover) !important;\n}\n\n.billing-item-cell {\n  max-width: 100%;\n}\n\n.billing-item-name,\n.billing-money {\n  color: var(--text) !important;\n  display: block;\n  font-weight: 800;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.billing-money {\n  white-space: nowrap;\n}\n\n.billing-qty-control .ant-btn {\n  width: 34px;\n}\n\n.billing-qty-control .billing-qty-value {\n  width: 42px;\n  pointer-events: none;\n}\n\n.billing-totals {\n  display: grid;\n  gap: 6px;\n  margin: 16px;\n  padding: 14px;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  background: var(--surface);\n}\n\n.billing-total-row {\n  display: flex;\n  justify-content: space-between;\n  gap: 16px;\n  color: var(--text);\n  font-size: 0.9rem;\n}\n\n.billing-grand-row {\n  margin-top: 6px;\n  padding-top: 8px;\n  border-top: 1px solid var(--border);\n  color: var(--accent);\n  font-size: 1.12rem;\n  font-weight: 800;\n}\n\n.billing-actions {\n  margin: 0 16px 16px;\n}\n\n.billing-recent-card {\n  overflow: hidden;\n}\n\n.billing-recent-card .ant-card-body {\n  padding: 10px;\n}\n\n.billing-recent-card .ant-empty {\n  padding: 28px 0;\n}\n\n.billing-recent-list {\n  display: grid;\n  gap: 10px;\n}\n\n.billing-recent-item {\n  align-items: flex-start !important;\n  display: flex;\n  justify-content: space-between;\n  gap: 12px;\n  border: 1px solid var(--border) !important;\n  border-radius: 8px;\n  cursor: pointer;\n  margin-bottom: 10px;\n  padding: 12px !important;\n  transition: background 0.2s ease, border-color 0.2s ease;\n}\n\n.billing-recent-item:hover {\n  background: var(--surface-hover);\n  border-color: var(--accent3) !important;\n}\n\n.billing-recent-title,\n.billing-recent-copy {\n  width: 100%;\n}\n\n.billing-modal .ant-modal-content {\n  padding: 0 !important;\n  overflow: hidden;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n\n.billing-modal .ant-modal-header {\n  margin: 0;\n  padding: 20px 24px 12px;\n  border-bottom: 1px solid var(--border);\n}\n\n.billing-modal .ant-modal-body {\n  padding: 20px 24px;\n}\n\n.billing-modal .ant-modal-footer {\n  margin: 0;\n  padding: 16px 24px 20px;\n  border-top: 1px solid var(--border);\n}\n\n.billing-modal .ant-modal-title,\n.billing-modal .ant-typography {\n  color: var(--text) !important;\n}\n\n.billing-preview-meta {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 14px;\n  margin-bottom: 16px;\n  padding-bottom: 16px;\n  border-bottom: 1px solid var(--border);\n}\n\n.billing-preview-meta > div {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  min-width: 0;\n}\n\n.billing-preview-totals {\n  margin: 16px 0 0;\n}\n\n.billing-product-search {\n  margin-bottom: 14px;\n}\n\n.billing-product-list {\n  max-height: min(56vh, 460px);\n  overflow: auto;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n\n.billing-product-row {\n  align-items: center !important;\n  cursor: pointer;\n  gap: 12px;\n  padding: 12px 14px !important;\n  transition: background 0.2s ease;\n}\n\n.billing-product-row.selected {\n  background: var(--surface-hover);\n  box-shadow: inset 4px 0 0 var(--accent);\n}\n\n.billing-product-row.disabled {\n  cursor: not-allowed;\n  opacity: 0.55;\n}\n\n.billing-product-info {\n  min-width: 0;\n}\n\n.billing-product-qty {\n  width: 80px;\n}\n\n.billing-selected-count {\n  display: block;\n  margin-top: 14px;\n}\n\n@media print {\n  body * {\n    visibility: hidden;\n  }\n\n  #printArea,\n  #printArea * {\n    visibility: visible;\n  }\n\n  #printArea {\n    position: absolute;\n    left: 0;\n    top: 0;\n    width: 80mm;\n    background: #fff;\n    color: #000;\n    font-family: monospace;\n    font-size: 10px;\n    padding: 4mm;\n  }\n\n  .no-print {\n    display: none !important;\n  }\n}\n\n#printArea {\n  display: none;\n}\n\n:root[data-theme='dark'] .billing-page .ant-card {\n  background: #1b2433;\n  border-color: #334155;\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .billing-page,\n:root[data-theme='dark'] .billing-page .ant-card-body,\n:root[data-theme='dark'] .billing-page .ant-card-head,\n:root[data-theme='dark'] .billing-page .ant-card-head-title,\n:root[data-theme='dark'] .billing-page .ant-typography,\n:root[data-theme='dark'] .billing-item-name,\n:root[data-theme='dark'] .billing-money {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .billing-cart-card .ant-table,\n:root[data-theme='dark'] .billing-cart-card .ant-table-container,\n:root[data-theme='dark'] .billing-cart-card .ant-table-content,\n:root[data-theme='dark'] .billing-preview-table .ant-table,\n:root[data-theme='dark'] .billing-preview-table .ant-table-container,\n:root[data-theme='dark'] .billing-preview-table .ant-table-content {\n  background: #1b2433 !important;\n}\n\n:root[data-theme='dark'] .billing-cart-card .ant-table-thead > tr > th,\n:root[data-theme='dark'] .billing-preview-table .ant-table-thead > tr > th {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n  border-bottom-color: #334155 !important;\n}\n\n:root[data-theme='dark'] .billing-cart-card .ant-table-tbody > tr > td,\n:root[data-theme='dark'] .billing-preview-table .ant-table-tbody > tr > td {\n  background: #1b2433 !important;\n  border-bottom-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .billing-cart-card .ant-table-tbody > tr:hover > td,\n:root[data-theme='dark'] .billing-preview-table .ant-table-tbody > tr:hover > td {\n  background: #263244 !important;\n}\n\nhtml[data-theme='dark'] body .billing-modal .ant-modal-content,\nhtml[data-theme='dark'] body .billing-modal .ant-modal-header,\nhtml[data-theme='dark'] body .billing-modal .ant-modal-body,\nhtml[data-theme='dark'] body .billing-modal .ant-modal-footer {\n  background-color: #1b2433 !important;\n  border-color: #334155 !important;\n}\n\nhtml[data-theme='dark'] body .billing-modal .ant-modal-title,\nhtml[data-theme='dark'] body .billing-modal .ant-typography {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .billing-modal .ant-modal-close,\nhtml[data-theme='dark'] body .billing-modal .ant-modal-close-x {\n  color: #cbd5e1 !important;\n}\n\nhtml[data-theme='dark'] body .billing-page .ant-input,\nhtml[data-theme='dark'] body .billing-page .ant-input-number,\nhtml[data-theme='dark'] body .billing-page .ant-input-number-input,\nhtml[data-theme='dark'] body .billing-page .ant-select-selector,\nhtml[data-theme='dark'] body .billing-modal .ant-input,\nhtml[data-theme='dark'] body .billing-modal .ant-input-number,\nhtml[data-theme='dark'] body .billing-modal .ant-input-number-input {\n  background-color: #111827 !important;\n  color: #f8fafc !important;\n  border-color: #334155 !important;\n}\n\nhtml[data-theme='dark'] body .billing-page .ant-input::placeholder,\nhtml[data-theme='dark'] body .billing-modal .ant-input::placeholder {\n  color: #94a3b8 !important;\n}\n\n@media (max-width: 1100px) {\n  .billing-layout {\n    grid-template-columns: 1fr;\n  }\n}\n\n@media (max-width: 760px) {\n  .billing-form,\n  .billing-preview-meta {\n    grid-template-columns: 1fr;\n  }\n\n  .billing-page .ant-card-head {\n    padding: 0 14px;\n  }\n\n  .billing-product-row {\n    align-items: flex-start !important;\n    flex-direction: column;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-billing-styles")) {
  const style = document.createElement("style");
  style.id = "combined-billing-styles";
  style.textContent = billingStyles;
  document.head.appendChild(style);
}

const billingProductModalFixStyles = `
.billing-product-row {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: center !important;
  column-gap: 18px !important;
}

.billing-product-info {
  min-width: 0;
}

.billing-product-info .ant-space-item:last-child {
  min-width: 0;
}

.billing-product-actions {
  display: grid !important;
  grid-template-columns: minmax(96px, auto) 84px;
  align-items: center;
  justify-content: end;
  gap: 12px !important;
  min-width: 204px;
}

.billing-product-actions .billing-money {
  text-align: right;
}

.billing-product-actions .billing-product-qty {
  width: 84px;
}

@media (max-width: 760px) {
  .billing-product-row {
    grid-template-columns: 1fr !important;
    row-gap: 10px !important;
  }

  .billing-product-actions {
    width: 100%;
    min-width: 0;
    grid-template-columns: 1fr 84px;
  }
}
`;

if (typeof document !== "undefined" && !document.getElementById("billing-product-modal-fix-styles")) {
  const style = document.createElement("style");
  style.id = "billing-product-modal-fix-styles";
  style.textContent = billingProductModalFixStyles;
  document.head.appendChild(style);
}

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
const isSameUserName = (left, right) =>
  String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();

export default function Billing({ erp, user }) {
  const { effectiveTheme } = useTheme();
  const [items, setItems] = useState([]);
  const [viewBill, setViewBill] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState('Cash');
  const [hiddenRecentBillIds, setHiddenRecentBillIds] = useState([]);

  const { db, addBill } = erp;
  const isDarkTheme = effectiveTheme === 'dark';
  const billingAntTheme = useMemo(
    () => ({
      algorithm: isDarkTheme
        ? antdTheme.darkAlgorithm
        : antdTheme.defaultAlgorithm,
      token: {
        borderRadius: 6,
        colorPrimary: '#d95b3d',
        colorBgBase: isDarkTheme ? '#111827' : '#ffffff',
        colorBgContainer: isDarkTheme ? '#1b2433' : '#ffffff',
        colorBgElevated: isDarkTheme ? '#111827' : '#ffffff',
        colorBorder: isDarkTheme ? '#334155' : '#e2e5ea',
        colorText: isDarkTheme ? '#f8fafc' : '#1a1f2e',
        colorTextSecondary: isDarkTheme ? '#cbd5e1' : '#5a6278',
      },
      components: {
        Button: {
          defaultBg: isDarkTheme ? '#111827' : '#ffffff',
          defaultBorderColor: isDarkTheme ? '#334155' : '#d9d9d9',
          defaultColor: isDarkTheme ? '#f8fafc' : '#1a1f2e',
        },
        Card: {
          colorBgContainer: isDarkTheme ? '#1b2433' : '#ffffff',
        },
        Input: {
          activeBg: isDarkTheme ? '#111827' : '#ffffff',
          colorBgContainer: isDarkTheme ? '#111827' : '#ffffff',
        },
        InputNumber: {
          activeBg: isDarkTheme ? '#111827' : '#ffffff',
          colorBgContainer: isDarkTheme ? '#111827' : '#ffffff',
        },
        Modal: {
          contentBg: isDarkTheme ? '#1b2433' : '#ffffff',
          footerBg: isDarkTheme ? '#1b2433' : '#ffffff',
          headerBg: isDarkTheme ? '#1b2433' : '#ffffff',
        },
        Select: {
          optionSelectedBg: isDarkTheme ? '#263244' : '#e6f4ff',
          selectorBg: isDarkTheme ? '#111827' : '#ffffff',
        },
        Table: {
          headerBg: isDarkTheme ? '#111827' : '#f4f6f9',
          rowHoverBg: isDarkTheme ? '#263244' : '#fafafa',
        },
      },
    }),
    [isDarkTheme],
  );
  const syncBillingData = useEffectEvent(() => {
    erp.refreshData({ showLoading: false }).catch(() => {});
  });

  useEffect(() => {
    syncBillingData();

    const handleWindowFocus = () => {
      syncBillingData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncBillingData();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getNextBillSeq = (sourceBills) => {
    const bills = Array.isArray(sourceBills) ? sourceBills : [];
    const maxSeq = bills
      .map((bill) => {
        const match = String(bill.billNo || bill.bill_no || '').match(/SNT-(\d+)/i);
        return match ? Number(match[1]) : 0;
      })
      .filter((value) => Number.isFinite(value))
      .reduce((max, value) => Math.max(max, value), 999);

    return Math.max(1000, maxSeq + 1);
  };

  const nextBillSeq = getNextBillSeq(db.bills);

  const showToast = (msg, type = 'success') => {
    if (type === 'error') {
      message.error(msg);
      return;
    }

    message.success(msg);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setViewBill(null);
        setIsReviewMode(false);
        setShowProductPopup(false);
        setSelectedProducts({});
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const products = Array.isArray(db.products) ? db.products : [];
  const getProductStock = (product) => Number(product?.stock || 0);
  const getCartQtyForProduct = (productId, skipIndex = -1) => (
    items.reduce((sum, item, index) => {
      if (index === skipIndex || String(item.id) !== String(productId)) {
        return sum;
      }
      return sum + Number(item.qty || 0);
    }, 0)
  );
  const getRemainingStockForCart = (product, skipIndex = -1) => (
    Math.max(0, getProductStock(product) - getCartQtyForProduct(product?.id, skipIndex))
  );
  const getMaxQtyForCartItem = (item, index) => {
    const product = products.find((p) => String(p.id) === String(item.id));
    return getRemainingStockForCart(product || item, index);
  };
  const availableProductCount = products.filter((product) => getProductStock(product) > 0).length;
  const popupProducts = (Array.isArray(db.products) ? db.products : [])
    .filter((product) => {
      if (!normalizedSearch) {
        return true;
      }

      const name = String(product.name || '').toLowerCase();
      const code = String(product.code || '').toLowerCase();
      return name.includes(normalizedSearch) || code.includes(normalizedSearch);
    })
    .slice(0, 80);

  const openProductPopup = async () => {
    setShowProductPopup(true);
    try {
      await erp.fetchProducts(true);
    } catch (error) {
      showToast(error.message || 'Failed to fetch latest stock', 'error');
    }
  };

  const toggleProductSelection = (product) => {
    const remainingStock = getRemainingStockForCart(product);
    if (remainingStock <= 0) {
      showToast(`${product.name} is out of stock.`, 'error');
      return;
    }

    setSelectedProducts((prev) => {
      const next = { ...prev };
      if (next[product.id] !== undefined) {
        delete next[product.id];
      } else {
        next[product.id] = Math.min(Number(qty) || 1, remainingStock);
      }
      return next;
    });
  };

  const handleAddSelected = () => {
    const newItems = [];
    for (const prodId of Object.keys(selectedProducts)) {
      const product = db.products.find((p) => String(p.id) === String(prodId));
      if (product) {
        const remainingStock = getRemainingStockForCart(product);
        const parsedQty = parseInt(selectedProducts[prodId], 10) || 1;
        if (remainingStock <= 0) {
          showToast(`${product.name} is out of stock.`, 'error');
          return;
        }
        if (parsedQty > remainingStock) {
          showToast(`Only ${remainingStock} item(s) are available in stock.`, 'error');
          return;
        }
        newItems.push({
          cartKey: `${product.id}-${Date.now()}-${newItems.length}`,
          id: product.id,
          name: product.name,
          qty: parsedQty,
          price: product.price,
          total: product.price * parsedQty
        });
      }
    }

    if (newItems.length > 0) {
      setItems((prevItems) => [...prevItems, ...newItems]);
      showToast(`${newItems.length} products added to cart`);
    }
    setSelectedProducts({});
    setSearchTerm('');
    setQty(1);
    setShowProductPopup(false);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, currentIndex) => currentIndex !== index));
  };

  const changeItemQty = (index, delta) => {
    setItems((prevItems) => prevItems.map((item, currentIndex) => {
      if (currentIndex !== index) {
        return item;
      }

      const product = products.find((p) => String(p.id) === String(item.id));
      const maxQty = getRemainingStockForCart(product || item, currentIndex);
      const nextQty = Math.max(1, Math.min(maxQty, Number(item.qty || 1) + delta));
      if (delta > 0 && nextQty === Number(item.qty || 1)) {
        showToast(`Only ${maxQty} item(s) are available in stock.`, 'error');
      }
      return {
        ...item,
        qty: nextQty,
        total: Number(item.price || 0) * nextQty
      };
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstRate = db.settings.gst / 100;
  const netSubtotal = subtotal / (1 + gstRate || 1);
  const gstAmt = subtotal - netSubtotal;
  const grandTotal = subtotal;

  const openBillPrintWindow = (billData) => {
    const settings = db.settings;
    const printedAt = billData.date
      ? new Date(billData.date).toLocaleString()
      : new Date().toLocaleString();
    const billItems = Array.isArray(billData.items) ? billData.items : [];
    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; width: 760px; margin: 0 auto; padding: 18px; color: #1f2a44; font-size: 15px; line-height: 1.25; }
    .invoice { border: 2px solid #324f86; padding: 14px 18px 20px; }
    .invoice-title { text-align: center; font-size: 26px; font-weight: 700; text-decoration: underline; letter-spacing: 1px; margin-bottom: 10px; }
    .top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 10px; }
    .license-block { font-size: 16px; line-height: 1.5; }
    .date-block { min-width: 220px; font-size: 16px; text-align: right; }
    .date-line { margin-bottom: 8px; }
    .shop-name { text-align: center; font-size: 46px; font-style: italic; color: #324f86; margin: 8px 0 2px; line-height: 1; }
    .shop-address { text-align: center; font-size: 17px; line-height: 1.35; margin-bottom: 10px; }
    .to-line { display: flex; align-items: center; gap: 10px; font-size: 18px; margin: 10px 0 14px; }
    .to-line-label { min-width: 32px; font-weight: 700; }
    .to-line-value { flex: 1; border-bottom: 2px dotted #324f86; padding: 0 0 4px; min-height: 28px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; table-layout: fixed; }
    th, td { border: 2px solid #324f86; padding: 8px 10px; vertical-align: top; }
    th { text-align: center; font-size: 16px; font-weight: 700; }
    .col-rate { width: 110px; text-align: right; }
    .col-item { width: auto; }
    .col-qty { width: 90px; text-align: center; }
    .col-amount { width: 140px; text-align: right; }
    .item-cell { min-height: 320px; }
    .item-line { margin-bottom: 6px; }
    .qty-cell { text-align: center; font-size: 20px; }
    .money { text-align: right; white-space: nowrap; }
    .summary-wrap { display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; margin-top: 8px; }
    .summary-left { font-size: 17px; min-width: 140px; }
    .summary-right { margin-left: auto; min-width: 260px; }
    .summary-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #9aa8c7; }
    .summary-row.total { font-size: 24px; font-weight: 700; border-bottom: 0; padding-top: 8px; }
    .footer-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 28px; }
    .footer-left { font-size: 18px; }
    .footer-right { text-align: right; font-size: 18px; min-width: 240px; }
    .signature-space { height: 34px; }
    @media print {
      body { width: 100%; padding: 0; }
      .invoice { border-width: 1.5px; }
      @page { margin: 0; size: auto; }
    }
  </style>
</head>
<body onload="setTimeout(() => { window.print(); window.close(); }, 300)">
  <div class="invoice">
    <div class="invoice-title">TAX INVOICE</div>
    <div class="top-row">
      <div class="license-block">
        <div>GSTIN : ${settings.gstin || '-'}</div>
        <div>FSSAI License No : ${settings.fssai || '-'}</div>
      </div>
      <div class="date-block">
        <div class="date-line"><b>Date:</b> ${printedAt}</div>
        <div><b>Phone:</b> ${settings.phone}</div>
      </div>
    </div>
    <div class="shop-name">${settings.shop}</div>
    <div class="shop-address">${settings.addr}</div>
    <div class="to-line">
      <div class="to-line-label">To</div>
      <div class="to-line-value">${billData.customer || ''}</div>
    </div>
    <table>
      <tr>
        <th class="col-rate">Rate</th>
        <th class="col-item">Description</th>
        <th class="col-qty">Qty</th>
        <th class="col-amount">Amount</th>
      </tr>
      <tr>
        <td class="money">
          ${billItems.map((item) => `<div class="item-line">${Number(item.price || 0).toFixed(2)}</div>`).join('')}
        </td>
        <td class="item-cell">
          ${billItems.map((item) => `<div class="item-line">${item.name}</div>`).join('')}
        </td>
        <td class="qty-cell">
          ${billItems.map((item) => `<div class="item-line">${item.qty}</div>`).join('')}
        </td>
        <td class="money">
          ${billItems.map((item) => `<div class="item-line">${Number(item.total || 0).toFixed(2)}</div>`).join('')}
        </td>
      </tr>
    </table>
    <div class="summary-wrap">
      <div class="summary-left">E & O.E.</div>
      <div class="summary-right">
        <div class="summary-row"><span>Bill No</span><span>${billData.billNo || ''}</span></div>
        <div class="summary-row"><span>Subtotal</span><span>${Number(billData.subtotal || 0).toFixed(2)}</span></div>
        <div class="summary-row"><span>CGST</span><span>${Number(billData.cgst || 0).toFixed(2)}</span></div>
        <div class="summary-row"><span>SGST</span><span>${Number(billData.sgst || 0).toFixed(2)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${Number(billData.grand || 0).toFixed(2)}</span></div>
      </div>
    </div>
    <div class="footer-row">
      <div class="footer-left">${billData.payment || ''}</div>
      <div class="footer-right">
        <div class="signature-space"></div>
        <div>For ${settings.shop}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleSaveBill = async () => {
    if (items.length === 0) return showToast('Cart is empty!', 'error');
    if (!customer.trim()) return showToast('Please enter Customer Name!', 'error');
    if (!phone.trim() || phone.length < 10) return showToast('Valid Mobile Number is required!', 'error');
    const nextSeq = getNextBillSeq(db.bills);

    for (const item of items) {
      const product = products.find((p) => String(p.id) === String(item.id));
      const availableStock = getProductStock(product);
      if (!product || availableStock <= 0) {
        return showToast(`${item.name} is out of stock.`, 'error');
      }
      if (Number(item.qty || 0) > availableStock) {
        return showToast(`Only ${availableStock} item(s) are available in stock.`, 'error');
      }
    }

    const bill = {
      billNo: `SNT-${String(nextSeq).padStart(4, '0')}`,
      date: new Date().toISOString(),
      customer,
      phone,
      payment,
      items,
      subtotal: netSubtotal,
      cgst: gstAmt / 2,
      sgst: gstAmt / 2,
      grand: grandTotal,
      by: user.user
    };

    try {
      await addBill(bill);
      showToast('Bill Saved Successfully!');
      setItems([]);
      setCustomer('');
      setPhone('');
      setPayment('Cash');
    } catch (error) {
      showToast(error.message || 'Failed to save bill', 'error');
    }
  };

  const printBill = () => {
    if (items.length === 0) return showToast('No items to print!', 'error');
    if (!customer.trim()) return showToast('Please enter Customer Name!', 'error');
    if (!phone.trim() || phone.length < 10) return showToast('Valid Mobile Number is required!', 'error');
    const nextSeq = getNextBillSeq(db.bills);
    openBillPrintWindow({
      billNo: `SNT-${String(nextSeq).padStart(4, '0')}`,
      date: new Date().toISOString(),
      customer,
      phone,
      payment,
      items,
      subtotal: netSubtotal,
      cgst: gstAmt / 2,
      sgst: gstAmt / 2,
      grand: grandTotal
    });
  };

  const reviewBill = () => {
    if (items.length === 0) return showToast('No items to review!', 'error');
    if (!customer.trim()) return showToast('Please enter Customer Name!', 'error');
    if (!phone.trim() || phone.length < 10) return showToast('Valid Mobile Number is required!', 'error');
    const nextSeq = getNextBillSeq(db.bills);

    setViewBill({
      billNo: `SNT-${String(nextSeq).padStart(4, '0')}`,
      date: new Date().toISOString(),
      customer,
      phone,
      payment,
      items,
      subtotal: netSubtotal,
      cgst: gstAmt / 2,
      sgst: gstAmt / 2,
      grand: grandTotal,
      by: user.user
    });
    setIsReviewMode(true);
  };

  const isAdmin = isRole(user, USER_ROLES.ADMIN);
  const hideRecentBill = (billId) => {
    setHiddenRecentBillIds((prev) => (
      prev.includes(billId) ? prev : [...prev, billId]
    ));
    if (viewBill?.id === billId) {
      setViewBill(null);
      setIsReviewMode(false);
    }
    showToast('Removed from recent list');
  };
  const findCustomerByPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length !== 10) {
      return null;
    }

    // First check the customers table
    const fromCustomers = (Array.isArray(db.customers) ? db.customers : []).find((existingCustomer) => (
      String(existingCustomer.phone || '').replace(/\D/g, '') === digits
    ));
    if (fromCustomers) return fromCustomers;

    // Fallback: check past bills for this phone number
    const fromBills = (Array.isArray(db.bills) ? db.bills : []).find((bill) => (
      String(bill.phone || '').replace(/\D/g, '') === digits && bill.customer
    ));
    if (fromBills) return { name: fromBills.customer, phone: fromBills.phone };

    return null;
  };



  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  
  const lastShiftEndStr = localStorage.getItem('snt_last_shift_end');
  let currentShiftStart = startOfToday;
  if (lastShiftEndStr) {
    const lse = new Date(lastShiftEndStr);
    if (lse > startOfToday) {
      currentShiftStart = lse;
    }
  }

  const recentBills = (db.bills || [])
    .filter((bill) => {
      const isVisibleUser = isAdmin || isSameUserName(bill.by || bill.by_user, user?.user);
      const isNotHidden = !hiddenRecentBillIds.includes(bill.id);
      
      const billDateStr = bill.date || bill.created_at;
      if (!billDateStr) return false;
      const d = new Date(billDateStr);
      const isCurrentShift = d >= currentShiftStart && d < startOfTomorrow;
      
      return isVisibleUser && isNotHidden && isCurrentShift;
    })
    .sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0))
    .slice(0, 6);
  const recentBillsTitle = "Today's Bills";

  const modalStyles = {
    content: {
      background: isDarkTheme ? '#1b2433' : '#ffffff',
      border: `1px solid ${isDarkTheme ? '#334155' : '#e2e5ea'}`,
      padding: 0,
    },
    header: {
      background: isDarkTheme ? '#1b2433' : '#ffffff',
      borderBottom: `1px solid ${isDarkTheme ? '#334155' : '#e2e5ea'}`,
    },
    body: {
      background: isDarkTheme ? '#1b2433' : '#ffffff',
    },
    footer: {
      background: isDarkTheme ? '#1b2433' : '#ffffff',
      borderTop: `1px solid ${isDarkTheme ? '#334155' : '#e2e5ea'}`,
    },
  };

  const cartColumns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (name, item) => (
        <Space orientation="vertical" size={2} className="billing-item-cell">
          <Text className="billing-item-name">{name}</Text>
          <Text type="secondary">{formatCurrency(item.price)}</Text>
        </Space>
      ),
    },
    {
      title: 'Qty',
      key: 'qty',
      align: 'center',
      width: 150,
      render: (_, item, index) => {
        const maxQty = getMaxQtyForCartItem(item, index);
        const itemQty = Number(item.qty || 0);

        return (
          <Space.Compact className="billing-qty-control">
            <Button
              icon={<MinusOutlined />}
              disabled={itemQty <= 1}
              onClick={() => changeItemQty(index, -1)}
            />
            <Button className="billing-qty-value">{itemQty}</Button>
            <Button
              icon={<PlusOutlined />}
              disabled={itemQty >= maxQty}
              onClick={() => changeItemQty(index, 1)}
            />
          </Space.Compact>
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 150,
      render: (total) => <Text className="billing-money">{formatCurrency(total)}</Text>,
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      width: 80,
      render: (_, item, index) => (
        <Tooltip title="Remove item">
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => removeItem(index)}
          />
        </Tooltip>
      ),
    },
  ];

  const billDetailColumns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (name) => <Text className="billing-item-name">{name}</Text>,
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      align: 'right',
      width: 80,
    },
    {
      title: 'Rate',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 130,
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 130,
      render: (total) => <Text className="billing-money">{formatCurrency(total)}</Text>,
    },
  ];

  return (
    <ConfigProvider theme={billingAntTheme}>
      <div className="page-header">
        <h1 className="page-title">Billing Workspace</h1>
        <p className="page-description">Create, manage and print customer bills.</p>
      </div>

      <div className="billing-page">
        <div className="billing-layout">
          <div className="billing-main">
            <Card
              className="billing-card no-print"
              title={
                <Space>
                  <ShopOutlined />
                  <span>{db.settings.shop}</span>
                </Space>
              }
            >
              <div className="billing-shop-copy">
                <Text type="secondary">{db.settings.addr}</Text>
                <Text type="secondary">Ph: {db.settings.phone}</Text>
              </div>
              <Form layout="vertical" requiredMark={false} className="billing-form">
                <Form.Item label="Bill No">
                  <Input
                    readOnly
                    value={`SNT-${String(nextBillSeq).padStart(4, '0')}`}
                    className="billing-bill-no-input"
                  />
                </Form.Item>
                <Form.Item label="Date">
                  <Input readOnly value={new Date().toLocaleString()} />
                </Form.Item>
                <Form.Item label="Payment">
                  <Select
                    value={payment}
                    onChange={setPayment}
                    options={[
                      { label: 'Cash', value: 'Cash' },
                      { label: 'UPI', value: 'UPI' },
                      { label: 'Card', value: 'Card' },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="Customer Name" required>
                  <Input
                    value={customer}
                    onChange={(event) => setCustomer(event.target.value)}
                    placeholder="Required"
                  />
                </Form.Item>
                <Form.Item label="Mobile No" required>
                  <Input
                    value={phone}
                    maxLength={10}
                    placeholder="10 Digits Required"
                    onChange={(event) => {
                      const nextPhone = event.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(nextPhone);

                      const matchedCustomer = findCustomerByPhone(nextPhone);
                      if (matchedCustomer?.name) {
                        setCustomer(matchedCustomer.name);
                      }
                    }}
                  />
                </Form.Item>
              </Form>
            </Card>

            <Card
              className="billing-card billing-cart-card"
              title={
                <Space>
                  <ShoppingCartOutlined />
                  <span>Add Item</span>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<FileAddOutlined />}
                  onClick={openProductPopup}
                >
                  Select Products
                </Button>
              }
            >
              <Input
                readOnly
                prefix={<SearchOutlined />}
                placeholder="Click to select products..."
                value={searchTerm}
                onClick={openProductPopup}
                className="billing-product-trigger"
              />

              <Table
                rowKey="cartKey"
                columns={cartColumns}
                dataSource={items}
                pagination={false}
                scroll={{ x: 660 }}
                tableLayout="fixed"
                locale={{ emptyText: <Empty description="No cart items" /> }}
              />

              <div className="billing-totals">
                <div className="billing-total-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(netSubtotal)}</span>
                </div>
                <div className="billing-total-row">
                  <span>CGST @{(db.settings.gst / 2).toFixed(1)}%</span>
                  <span>{formatCurrency(gstAmt / 2)}</span>
                </div>
                <div className="billing-total-row">
                  <span>SGST @{(db.settings.gst / 2).toFixed(1)}%</span>
                  <span>{formatCurrency(gstAmt / 2)}</span>
                </div>
                <div className="billing-total-row billing-grand-row">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <Space wrap className="billing-actions">
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveBill}>
                  Save Bill
                </Button>
                <Button icon={<EyeOutlined />} onClick={reviewBill}>
                  Review Bill
                </Button>
                <Button icon={<PrinterOutlined />} onClick={printBill}>
                  Print Bill
                </Button>
                <Button danger icon={<CloseOutlined />} onClick={() => setItems([])}>
                  Clear
                </Button>
              </Space>
            </Card>
          </div>

          <Card
            className="billing-card billing-recent-card no-print"
            title={
              <Space>
                <FileTextOutlined />
                <span>{recentBillsTitle}</span>
              </Space>
            }
          >
            {recentBills.length === 0 ? (
              <Empty description="No recent bills" />
            ) : (
              <div className="billing-recent-list">
                {recentBills.map((bill) => (
                  <div
                    key={bill.id || bill.billNo}
                  className="billing-recent-item"
                  onClick={() => {
                    setViewBill(bill);
                    setIsReviewMode(false);
                  }}
                  >
                    <div className="billing-recent-meta">
                      <Space className="billing-recent-title">
                        <Text className="billing-bill-no">{bill.billNo}</Text>
                        <Text type="secondary">
                          {new Date(bill.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </Space>
                      <Space orientation="vertical" size={8} className="billing-recent-copy">
                        <Text className="billing-item-name">{bill.customer}</Text>
                        <Space>
                          <Tag color="green">{bill.payment}</Tag>
                          <Text className="billing-money">{formatCurrency(bill.grand)}</Text>
                        </Space>
                      </Space>
                    </div>

                    <Tooltip title="Remove from recent list">
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={(event) => {
                          event.stopPropagation();
                          hideRecentBill(bill.id);
                        }}
                      />
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Modal
          title={isReviewMode ? 'Review Bill' : 'Bill Details'}
          open={Boolean(viewBill)}
          onCancel={() => {
            setViewBill(null);
            setIsReviewMode(false);
          }}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => {
                setViewBill(null);
                setIsReviewMode(false);
              }}
            >
              Close
            </Button>,
          ]}
          width={760}
          centered
          className="billing-modal"
          styles={modalStyles}
        >
          {viewBill && (
            <>
              <div className="billing-preview-meta">
                <div>
                  <Text type="secondary">Bill No</Text>
                  <Text className="billing-bill-no">{viewBill.billNo}</Text>
                </div>
                <div>
                  <Text type="secondary">Date</Text>
                  <Text>{new Date(viewBill.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
                </div>
                <div>
                  <Text type="secondary">Customer</Text>
                  <Text className="billing-item-name">{viewBill.customer}</Text>
                </div>
                <div>
                  <Text type="secondary">Phone</Text>
                  <Text>{viewBill.phone || 'N/A'}</Text>
                </div>
                <div>
                  <Text type="secondary">Payment</Text>
                  <Tag color="green">{viewBill.payment}</Tag>
                </div>
                <div>
                  <Text type="secondary">Billed By</Text>
                  <Text>{viewBill.by || 'System'}</Text>
                </div>
              </div>

              <Table
                rowKey={(item) => `${item.id || item.product_id || item.name}-${item.price}-${item.qty}-${item.total}`}
                columns={billDetailColumns}
                dataSource={viewBill.items || []}
                pagination={false}
                scroll={{ x: 580, y: 220 }}
                tableLayout="fixed"
                className="billing-preview-table"
              />

              <div className="billing-totals billing-preview-totals">
                <div className="billing-total-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(viewBill.subtotal)}</span>
                </div>
                <div className="billing-total-row">
                  <span>CGST</span>
                  <span>{formatCurrency(viewBill.cgst)}</span>
                </div>
                <div className="billing-total-row">
                  <span>SGST</span>
                  <span>{formatCurrency(viewBill.sgst)}</span>
                </div>
                <div className="billing-total-row billing-grand-row">
                  <span>Total</span>
                  <span>{formatCurrency(viewBill.grand)}</span>
                </div>
              </div>
            </>
          )}
        </Modal>

        <Modal
          title="Select Products"
          open={showProductPopup}
          onCancel={() => {
            setShowProductPopup(false);
            setSelectedProducts({});
          }}
          onOk={handleAddSelected}
          okText="Add Selected to Cart"
          cancelText="Cancel"
          okButtonProps={{ disabled: Object.keys(selectedProducts).length === 0 }}
          width={780}
          centered
          destroyOnHidden
          className="billing-modal billing-product-modal"
          styles={modalStyles}
        >
          <Input
            autoFocus
            prefix={<SearchOutlined />}
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="billing-product-search"
          />

          <div className="billing-product-list">
            {popupProducts.length === 0 ? (
              <Empty
                description={
                  availableProductCount === 0
                    ? 'No products are currently available for billing.'
                    : 'No matching products found'
                }
              />
            ) : (
              popupProducts.map((product) => {
                const isSelected = selectedProducts[product.id] !== undefined;
                const currentStock = getProductStock(product);
                const remainingStock = getRemainingStockForCart(product);
                const isDisabled = currentStock <= 0 || remainingStock <= 0;

                return (
                  <div
                    key={product.id}
                  className={`billing-product-row ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => toggleProductSelection(product)}
                >
                  <Space className="billing-product-info">
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => toggleProductSelection(product)}
                    />
                    <Space orientation="vertical" size={2}>
                      <Text className="billing-item-name">{product.name}</Text>
                      {product.code && <Text type="secondary">{product.code}</Text>}
                      {currentStock > 0 ? (
                        <Tag color="green">Available Stock: {currentStock}</Tag>
                      ) : (
                        <Tag color="red">Out of Stock</Tag>
                      )}
                    </Space>
                  </Space>
                  <Space className="billing-product-actions" onClick={(event) => event.stopPropagation()}>
                    <Text className="billing-money">{formatCurrency(product.price)}</Text>
                    {isSelected && (
                      <InputNumber
                        min={1}
                        max={remainingStock}
                        precision={0}
                        value={selectedProducts[product.id]}
                        className="billing-product-qty"
                        onChange={(value) => {
                          const parsed = Number(value || 1);
                          const nextValue = Math.max(1, Math.min(remainingStock, parsed));
                          if (nextValue < parsed) {
                            showToast(`Only ${remainingStock} item(s) are available in stock.`, 'error');
                          }
                          setSelectedProducts((prev) => ({
                            ...prev,
                            [product.id]: nextValue,
                          }));
                        }}
                      />
                    )}
                  </Space>
                  </div>
                );
              })
            )}
          </div>

          <Text type="secondary" className="billing-selected-count">
            Selected: <Text className="billing-bill-no">{Object.keys(selectedProducts).length}</Text> product(s)
          </Text>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
