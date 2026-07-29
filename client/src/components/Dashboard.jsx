import React, { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Modal,
  Form,
  InputNumber,
  Button,
  Progress,
  Empty,
  Typography,
} from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  TrophyOutlined,
  WarningOutlined,
  CalendarOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useTheme } from '../context/useTheme';
import { Line, Pie } from 'react-chartjs-2';import { hasAdminAccess, isRole, USER_ROLES } from '../utils/roles';
const dashboardStyles = ".dashboard-antd-wrap {\r\n  padding-bottom: 24px;\r\n}\r\n\r\n.dashboard-antd-wrap .page-title,\r\n.dashboard-antd-wrap .ant-typography.page-title {\r\n  color: var(--text, #111827) !important;\r\n}\r\n\r\n.dashboard-antd-wrap .page-description {\r\n  color: var(--text2, #64748b) !important;\r\n}\r\n\r\n:root[data-theme='dark'] .dashboard-antd-wrap .page-title,\r\n:root[data-theme='dark'] .dashboard-antd-wrap .ant-typography.page-title {\r\n  color: #f8fafc !important;\r\n}\r\n\r\n:root[data-theme='dark'] .dashboard-antd-wrap .page-description {\r\n  color: #cbd5e1 !important;\r\n}\r\n\r\n/* ─── Stat Cards ─── */\r\n.dashboard-stat-card.ant-card {\r\n  border-radius: 12px !important;\r\n  border: 1px solid var(--border) !important;\r\n  background: var(--card, #1e293b) !important;\r\n  transition: transform 0.2s ease, box-shadow 0.2s ease !important;\r\n  overflow: visible !important;\r\n}\r\n\r\n.dashboard-stat-card.ant-card:hover {\r\n  transform: translateY(-3px);\r\n  box-shadow: 0 12px 28px rgba(0,0,0,0.15) !important;\r\n}\r\n\r\n.dashboard-stat-card .ant-card-body {\r\n  padding: 20px !important;\r\n  min-height: 100px;\r\n}\r\n\r\n.stat-card-inner {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 12px;\r\n  height: 100%;\r\n  min-height: 76px;\r\n}\r\n\r\n.stat-card-body {\r\n  flex: 1;\r\n  min-width: 0;\r\n  display: flex;\r\n  flex-direction: column;\r\n  justify-content: center;\r\n}\r\n\r\n.stat-card-label {\r\n  font-size: 0.76rem;\r\n  letter-spacing: 0.12em;\r\n  color: var(--text2, #94a3b8);\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  margin-bottom: 6px;\r\n}\r\n\r\n.stat-card-text-value {\r\n  font-size: 1rem;\r\n  font-weight: 600;\r\n  color: var(--text, #f1f5f9);\r\n  line-height: 1.35;\r\n  margin-top: 4px;\r\n  margin-bottom: 4px;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n\r\n.stat-card-sub {\r\n  font-size: 0.75rem;\r\n  color: var(--text3, #64748b);\r\n  margin-top: 4px;\r\n}\r\n\r\n.stat-card-icon-wrap {\r\n  width: 48px;\r\n  height: 48px;\r\n  min-width: 48px;\r\n  border-radius: 12px;\r\n  background: rgba(255,255,255,0.06);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  font-size: 1.5rem;\r\n}\r\n\r\n/* antd Statistic override inside stat card */\r\n.dashboard-stat-card .ant-statistic-content {\r\n  color: var(--text, #f1f5f9) !important;\r\n}\r\n\r\n.dashboard-stat-card .ant-statistic-content-value {\r\n  font-size: 1.6rem !important;\r\n  font-weight: 700 !important;\r\n  letter-spacing: -0.03em !important;\r\n  line-height: 1.1 !important;\r\n}\r\n\r\n.dashboard-stat-card .ant-statistic-content-prefix {\r\n  font-size: 1rem !important;\r\n  font-weight: 700 !important;\r\n  margin-right: 2px !important;\r\n}\r\n\r\n/* ─── Chart Cards ─── */\r\n.dashboard-chart-card.ant-card {\r\n  border-radius: 12px !important;\r\n  border: 1px solid var(--border) !important;\r\n  background: var(--card, #1e293b) !important;\r\n  display: flex !important;\r\n  flex-direction: column !important;\r\n  height: 100% !important;\r\n  min-height: 390px !important;\r\n}\r\n\r\n.dashboard-chart-card .ant-card-head {\r\n  border-bottom: 1px solid var(--border) !important;\r\n  color: var(--text, #f1f5f9) !important;\r\n  font-weight: 600 !important;\r\n  font-size: 0.95rem !important;\r\n  min-height: 48px !important;\r\n  background: transparent !important;\r\n}\r\n\r\n.dashboard-chart-card .ant-card-head-title {\r\n  color: var(--text, #f1f5f9) !important;\r\n}\r\n\r\n.dashboard-chart-card .ant-card-body {\r\n  display: flex;\r\n  flex: 1;\r\n  flex-direction: column;\r\n  padding: 16px 20px !important;\r\n}\r\n\r\n.dashboard-chart-canvas {\r\n  flex: 1;\r\n  min-height: 296px;\r\n}\r\n\r\n/* ─── Performer rank badge ─── */\r\n.performer-rank-badge {\r\n  width: 28px;\r\n  height: 28px;\r\n  min-width: 28px;\r\n  border-radius: 50%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  font-weight: 600;\r\n  font-size: 0.82rem;\r\n  color: #fff;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.top-product-trend {\r\n  display: flex;\r\n  flex-direction: column;\r\n  justify-content: center;\r\n  flex: 1;\r\n  min-height: 296px;\r\n}\r\n\r\n.top-product-list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 18px;\r\n}\r\n\r\n.top-product-row {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 14px;\r\n}\r\n\r\n.top-product-content {\r\n  flex: 1;\r\n  min-width: 0;\r\n}\r\n\r\n.top-product-meta {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 16px;\r\n  margin-bottom: 8px;\r\n}\r\n\r\n.top-product-name {\r\n  color: var(--text, #111827);\r\n  display: block;\r\n  flex: 1;\r\n  font-size: 0.92rem;\r\n  font-weight: 800;\r\n  line-height: 1.35;\r\n  min-width: 0;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n\r\n.top-product-score {\r\n  align-items: center;\r\n  display: inline-flex;\r\n  flex: 0 0 auto;\r\n  gap: 10px;\r\n  font-weight: 800;\r\n}\r\n\r\n.top-product-count {\r\n  color: var(--text2, #64748b) !important;\r\n  font-size: 0.78rem;\r\n  font-weight: 700;\r\n}\r\n\r\n.top-product-percent {\r\n  color: #d95b3d;\r\n  min-width: 42px;\r\n  text-align: right;\r\n}\r\n\r\n:root[data-theme='dark'] .top-product-name {\r\n  color: #f8fafc;\r\n}\r\n\r\n:root[data-theme='dark'] .top-product-count {\r\n  color: #cbd5e1 !important;\r\n}\r\n\r\n/* ─── Tables ─── */\r\n.dashboard-antd-table .ant-table {\r\n  background: transparent !important;\r\n  color: var(--text, #f1f5f9) !important;\r\n}\r\n\r\n.dashboard-antd-table .ant-table-thead > tr > th {\r\n  background: rgba(255,255,255,0.04) !important;\r\n  color: var(--text2, #94a3b8) !important;\r\n  border-bottom: 1px solid var(--border) !important;\r\n  font-size: 0.8rem !important;\r\n  font-weight: 700 !important;\r\n  letter-spacing: 0.06em !important;\r\n}\r\n\r\n.dashboard-antd-table .ant-table-tbody > tr > td {\r\n  border-bottom: 1px solid var(--border, rgba(255,255,255,0.06)) !important;\r\n  color: var(--text, #f1f5f9) !important;\r\n  font-size: 0.88rem !important;\r\n}\r\n\r\n.dashboard-antd-table .ant-table-tbody > tr:hover > td {\r\n  background: rgba(255,255,255,0.035) !important;\r\n}\r\n\r\n.dashboard-antd-table .ant-empty-description {\r\n  color: var(--text3, #64748b) !important;\r\n}\r\n\r\n/* ─── Modals ─── */\r\n.dashboard-antd-modal .ant-modal-content {\r\n  background: var(--card, #1e293b) !important;\r\n  border: 1px solid var(--border) !important;\r\n  border-radius: 12px !important;\r\n  color: var(--text, #f1f5f9) !important;\r\n}\r\n\r\n.dashboard-antd-modal .ant-modal-header {\r\n  background: transparent !important;\r\n  border-bottom: 1px solid var(--border) !important;\r\n}\r\n\r\n.dashboard-antd-modal .ant-modal-title {\r\n  color: var(--text, #f1f5f9) !important;\r\n  font-weight: 700 !important;\r\n}\r\n\r\n.dashboard-antd-modal .ant-modal-close {\r\n  color: var(--text2, #94a3b8) !important;\r\n}\r\n\r\n.dashboard-antd-modal .ant-modal-footer {\r\n  border-top: 1px solid var(--border) !important;\r\n  background: transparent !important;\r\n}\r\n\r\n/* ─── Progress bar color inherit fix ─── */\r\n.ant-progress-line .ant-progress-bg {\r\n  transition: width 1s ease-out !important;\r\n}\r\n\r\n/* ─── InputNumber in refill form ─── */\r\n.dashboard-antd-modal .ant-input-number {\r\n  background: var(--bg2, #0f172a) !important;\r\n  border-color: var(--border) !important;\r\n  color: var(--text, #f1f5f9) !important;\r\n}\r\n\r\n.dashboard-antd-modal .ant-input-number-input {\r\n  color: var(--text, #f1f5f9) !important;\r\n}\r\n\r\n.dashboard-antd-modal .ant-form-item-label > label {\r\n  color: var(--text2, #e2e8f0) !important;\r\n}\r\n\r\n@media (max-width: 768px) {\r\n  .dashboard-stat-card .ant-statistic-content-value {\r\n    font-size: 1.3rem !important;\r\n  }\r\n\r\n  .dashboard-chart-card.ant-card {\r\n    min-height: 0 !important;\r\n  }\r\n\r\n  .dashboard-chart-canvas,\r\n  .top-product-trend {\r\n    min-height: 260px;\r\n  }\r\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-dashboard-styles")) {
  const style = document.createElement("style");
  style.id = "combined-dashboard-styles";
  style.textContent = dashboardStyles;
  document.head.appendChild(style);
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const { Title: AntTitle, Text } = Typography;

function getWeekStart(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function getDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}



function getProductLabel(product) {
  return product.name || product.code;
}

function isSameUserName(left, right) {
  return String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();
}

function getBillDate(bill) {
  return bill?.date || bill?.created_at || bill?.createdAt || null;
}

function sortBillsNewestFirst(left, right) {
  return new Date(getBillDate(right) || 0) - new Date(getBillDate(left) || 0);
}

function aggregateSoldProductsFromBills(sourceBills, products) {
  const productsById = new Map((products || []).map((product) => [String(product.id), product]));
  const productsByName = new Map((products || []).map((product) => [String(product.name || '').trim().toLowerCase(), product]));
  const soldByKey = new Map();

  (sourceBills || []).forEach((bill) => {
    (Array.isArray(bill.items) ? bill.items : []).forEach((item) => {
      const qty = Number(item.qty || item.quantity || 0);
      if (!Number.isFinite(qty) || qty <= 0) return;

      const itemId = item.id ?? item.product_id ?? item.productId;
      const itemName = String(item.name || item.product || '').trim();
      const matchedProduct = itemId != null
        ? productsById.get(String(itemId))
        : productsByName.get(itemName.toLowerCase());
      const key = matchedProduct?.id != null ? `id:${matchedProduct.id}` : `name:${itemName.toLowerCase()}`;
      const current = soldByKey.get(key) || {
        ...(matchedProduct || {}),
        id: matchedProduct?.id ?? itemId ?? key,
        code: matchedProduct?.code || item.code,
        name: matchedProduct?.name || itemName || item.code || 'Unknown Product',
        sold: 0
      };

      current.sold += qty;
      soldByKey.set(key, current);
    });
  });

  return [...soldByKey.values()]
    .filter((product) => Number(product.sold || 0) > 0)
    .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0));
}

/* ── Stat card wrapper using antd Card + Statistic ── */
function StatCard({ title, value, prefix, suffix, sub, icon, color, onClick, isText }) {
  const colorMap = {
    orange: '#f97316',
    green:  '#22c55e',
    blue:   '#3b82f6',
    red:    '#ef4444',
    purple: '#8b5cf6',
  };
  const bg = colorMap[color] || '#6366f1';

  return (
    <Card
      className={`dashboard-stat-card dashboard-stat-card-${color}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      variant="borderless"
    >
      <div className="stat-card-inner">
        <div className="stat-card-body">
          <div className="stat-card-label">{title}</div>
          {isText ? (
            <div className="stat-card-text-value" title={value}>{value}</div>
          ) : (
            <Statistic
              value={value}
              prefix={prefix}
              suffix={suffix}
              styles={{ content: { color: 'inherit', fontSize: '1.6rem', fontWeight: 700 } }}
            />
          )}
          <div className="stat-card-sub">{sub}</div>
        </div>
        <div className="stat-card-icon-wrap" style={{ color: bg }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard({ db, erp, user }) {
  const { effectiveTheme } = useTheme();
  const [showLowStockPopup, setShowLowStockPopup] = useState(false);
  const [showTodaySalesPopup, setShowTodaySalesPopup] = useState(false);
  const [refillProduct, setRefillProduct] = useState(null);
  const [isRefilling, setIsRefilling] = useState(false);
  const [refillForm] = Form.useForm();

  const canManageAdminPages = hasAdminAccess(user);
  const isAdmin = isRole(user, USER_ROLES.ADMIN);



  const bills = useMemo(() => (db.bills || []).filter((bill) => {
    if (canManageAdminPages) return true;
    return isSameUserName(bill.by || bill.by_user, user?.user);
  }), [db.bills, canManageAdminPages, user?.user]);

  const products = useMemo(() => db.products || [], [db.products]);
  const fetchProducts = erp?.fetchProducts;

  useEffect(() => {
    if (!fetchProducts) return undefined;
    fetchProducts(true).catch(() => {});
    const onFocus = () => fetchProducts(true).catch(() => {});
    const onVisible = () => { if (document.visibilityState === 'visible') fetchProducts(true).catch(() => {}); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchProducts]);

  const submitRefill = async (values) => {
    const qty = values.qty;
    if (!refillProduct || !Number.isFinite(qty) || qty <= 0 || isRefilling) return;
    setIsRefilling(true);
    try {
      await erp.addRefill({
        product_id: refillProduct.id,
        product: refillProduct.name,
        qty,
        by: user ? user.user : 'Admin'
      });
      setRefillProduct(null);
      refillForm.resetFields();
    } catch (error) {
      Modal.error({ title: 'Refill Failed', content: error.message || 'Failed to refill stock' });
    } finally {
      setIsRefilling(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const weekStart = getWeekStart(now);
    
    const lastShiftEndStr = localStorage.getItem('snt_last_shift_end');
    let currentShiftStart = startOfToday;
    if (lastShiftEndStr) {
      const lse = new Date(lastShiftEndStr);
      if (lse > startOfToday) {
        currentShiftStart = lse;
      }
    }

    const todayBills = bills
      .filter((b) => {
        const dateValue = getBillDate(b);
        if (!dateValue) return false;
        const d = new Date(dateValue);
        return d >= currentShiftStart && d < startOfTomorrow;
      })
      .sort(sortBillsNewestFirst);
    const latestBillDate = bills.reduce((latest, bill) => {
      const dateValue = getBillDate(bill);
      if (!dateValue) return latest;
      const billDate = new Date(dateValue);
      if (Number.isNaN(billDate.getTime())) return latest;
      return !latest || billDate > latest ? billDate : latest;
    }, null);
    const latestBillDateKey = latestBillDate ? getDateKey(latestBillDate) : '';
    const latestDayBills = latestBillDateKey
      ? bills.filter((bill) => getDateKey(getBillDate(bill)) === latestBillDateKey).sort(sortBillsNewestFirst)
      : [];
    const displaySalesBills = todayBills.length > 0 || bills.length === 0 ? todayBills : latestDayBills;
    const displaySalesDate = todayBills.length > 0 || bills.length === 0 ? now : latestBillDate;
    const isShowingTodaySales = todayBills.length > 0 || bills.length === 0;
    const weeklyBills = bills.filter((b) => { const dateValue = getBillDate(b); if (!dateValue) return false; return new Date(dateValue) >= weekStart; });
    const latestWeekStart = latestBillDate ? new Date(latestBillDate) : null;
    if (latestWeekStart) {
      latestWeekStart.setDate(latestWeekStart.getDate() - 6);
      latestWeekStart.setHours(0, 0, 0, 0);
    }
    const latestWeekBills = latestWeekStart
      ? bills.filter((bill) => {
          const dateValue = getBillDate(bill);
          if (!dateValue) return false;
          const billDate = new Date(dateValue);
          return billDate >= latestWeekStart && billDate <= latestBillDate;
        })
      : [];
    const displayWeeklyBills = weeklyBills.length > 0 || bills.length === 0 ? weeklyBills : latestWeekBills;
    const isShowingCurrentWeek = weeklyBills.length > 0 || bills.length === 0;
    const monthlyBills = bills.filter((b) => { const dateValue = getBillDate(b); if (!dateValue) return false; const d = new Date(dateValue); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; });
    const yearlyBills = bills.filter((b) => { const dateValue = getBillDate(b); if (!dateValue) return false; return new Date(dateValue).getFullYear() === currentYear; });

    const todaySales = todayBills.reduce((s, b) => s + (b.grand || 0), 0);
    const displaySales = displaySalesBills.reduce((s, b) => s + (b.grand || 0), 0);
    const weeklyRevenue = weeklyBills.reduce((s, b) => s + (b.grand || 0), 0);
    const displayWeeklyRevenue = displayWeeklyBills.reduce((s, b) => s + (b.grand || 0), 0);
    const monthlyRevenue = monthlyBills.reduce((s, b) => s + (b.grand || 0), 0);
    const yearlyRevenue = yearlyBills.reduce((s, b) => s + (b.grand || 0), 0);

    const lowStock = [...products].filter((p) => Number(p.stock || 0) < 5).sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
    const soldProductsFromBills = aggregateSoldProductsFromBills(bills, products);
    const soldProductsFromInventory = [...products]
      .filter((p) => Number(p.sold || 0) > 0)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0));
    const soldProducts = soldProductsFromBills.length > 0 ? soldProductsFromBills : soldProductsFromInventory;
    const topProduct = soldProducts[0] || null;
    const topSellingProducts = soldProducts.slice(0, 5);
    const totalInventoryValue = products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);

    return { todayBills, displaySalesBills, displaySalesDate, isShowingTodaySales, weeklyBills, displayWeeklyBills, isShowingCurrentWeek, monthlyBills, yearlyBills, todaySales, displaySales, weeklyRevenue, displayWeeklyRevenue, monthlyRevenue, yearlyRevenue, lowStock, topProduct, topSellingProducts, totalInventoryValue };
  }, [bills, products]);

  const { todayBills, todaySales, displayWeeklyBills, isShowingCurrentWeek, displayWeeklyRevenue, monthlyRevenue, yearlyRevenue, lowStock, topProduct, topSellingProducts, totalInventoryValue } = stats;

  const sharedAnimation = useMemo(() => ({
    duration: 1600,
    easing: 'easeOutQuart',
    delay: (ctx) => (ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 100 : 0)
  }), []);

  const topProductsData = useMemo(() => {
    // Generate brown shades
    const brownColors = ['#5c2314', '#8a351e', '#bd4728', '#d95b3d', '#e3826b'];
    return {
      labels: topSellingProducts.map(getProductLabel),
      datasets: [{
        label: 'Units Sold',
        data: topSellingProducts.map((p) => p.sold || 0),
        backgroundColor: brownColors.slice(0, topSellingProducts.length),
        borderColor: 'transparent'
      }]
    };
  }, [topSellingProducts]);

  /* ── Ant Design Table columns ── */
  const recentTxColumns = [
    { title: 'Bill No', dataIndex: 'billNo', key: 'billNo', render: (v) => <b>{v}</b> },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Amount', dataIndex: 'grand', key: 'grand', render: (v) => <b>{formatCurrency(v)}</b> },
    { title: 'Method', dataIndex: 'payment', key: 'payment', render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Time', dataIndex: 'date', key: 'date', render: (v) => <Text type="secondary" style={{ fontSize: '0.8rem' }}>{new Date(v).toLocaleTimeString()}</Text> },
  ];

  const todaySalesColumns = [
    { title: 'Bill No', dataIndex: 'billNo', key: 'billNo', render: (v) => <b>{v}</b> },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Amount', dataIndex: 'grand', key: 'grand', align: 'right', render: (v) => <b>{formatCurrency(v)}</b> },
    { title: 'Time', dataIndex: 'date', key: 'date', align: 'right', render: (v) => <Text type="secondary" style={{ fontSize: '0.8rem' }}>{new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text> },
  ];

  const lowStockColumns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Product', dataIndex: 'name', key: 'name' },
    { title: 'Stock', dataIndex: 'stock', key: 'stock', align: 'right', render: (v) => <b style={{ color: '#ef4444' }}>{Number(v || 0)}</b> },
    {
      title: 'Status', key: 'status', render: (_, r) => (
        Number(r.stock || 0) === 0
          ? <Tag color="red">Out of Stock</Tag>
          : <Tag color="orange">Low Stock</Tag>
      )
    },
    {
      title: 'Action', key: 'action', align: 'right',
      render: (_, r) => (
        <Button size="small" type="primary" onClick={() => { setRefillProduct(r); refillForm.resetFields(); }}>
          Refill
        </Button>
      )
    },
  ];

  return (
    <div className="dashboard-antd-wrap">
      {/* Page header */}
      <div className="page-header">
        <AntTitle level={2} className="page-title" style={{ margin: 0 }}>Dashboard</AntTitle>
        <p className="page-description">Overview of your business metrics and performance.</p>
      </div>

      {/* ── Primary stat cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={canManageAdminPages ? 6 : 8}>
          <StatCard
            title="Today Sales"
            value={todaySales}
            prefix="₹"
            sub={`${todayBills.length} bills today`}
            icon={<DollarOutlined style={{ fontSize: 32 }} />}
            color="orange"
            onClick={() => setShowTodaySalesPopup(true)}
          />
        </Col>
        <Col xs={24} sm={12} lg={canManageAdminPages ? 6 : 8}>
          <StatCard title="Today Bills" value={todayBills.length} sub={`${todayBills.length} bills today`} icon={<FileTextOutlined style={{ fontSize: 32 }} />} color="green" />
        </Col>
        <Col xs={24} sm={12} lg={canManageAdminPages ? 6 : 8}>
          <StatCard title="Top Product" value={topProduct ? topProduct.name : 'No sales yet'} isText sub={topProduct ? `${topProduct.sold || 0} units sold` : 'Waiting for sales data'} icon={<TrophyOutlined style={{ fontSize: 32 }} />} color="blue" />
        </Col>
        {canManageAdminPages && (
          <Col xs={24} sm={12} lg={6}>
            <StatCard title="Low Stock Items" value={lowStock.length} sub={`${products.filter((p) => Number(p.stock || 0) === 0).length} out of stock`} icon={<WarningOutlined style={{ fontSize: 32 }} />} color="red" onClick={() => setShowLowStockPopup(true)} />
          </Col>
        )}
      </Row>

      {/* Staff extra row */}
      {!canManageAdminPages && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12}>
            <StatCard title="Low Stock Items" value={lowStock.length} sub={`${products.filter((p) => Number(p.stock || 0) === 0).length} out of stock`} icon={<WarningOutlined style={{ fontSize: 32 }} />} color="red" onClick={() => setShowLowStockPopup(true)} />
          </Col>
          <Col xs={24} sm={12}>
            <StatCard title="Stock Value" value={totalInventoryValue} prefix="₹" sub="Current on-hand" icon={<InboxOutlined style={{ fontSize: 32 }} />} color="orange" />
          </Col>
        </Row>
      )}

      {/* Admin revenue row */}
      {isAdmin && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title={isShowingCurrentWeek ? 'Weekly Revenue' : 'Latest Week'} value={displayWeeklyRevenue} prefix="₹" sub={`${displayWeeklyBills.length} bills`} icon={<CalendarOutlined style={{ fontSize: 32 }} />} color="purple" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title="Monthly Revenue" value={monthlyRevenue} prefix="₹" sub="This month" icon={<CalendarOutlined style={{ fontSize: 32 }} />} color="orange" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title="Yearly Revenue" value={yearlyRevenue} prefix="₹" sub="This year" icon={<CalendarOutlined style={{ fontSize: 32 }} />} color="green" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard title="Stock Value" value={totalInventoryValue} prefix="₹" sub="Current on-hand" icon={<InboxOutlined style={{ fontSize: 32 }} />} color="orange" />
          </Col>
        </Row>
      )}

      {/* ── Charts row ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <Card className="dashboard-chart-card" title="Top Product Trend" variant="borderless">
              <div className="dashboard-chart-canvas">
                {topSellingProducts.length > 0 ? (
                  <Pie data={topProductsData} options={{ maintainAspectRatio: false, animation: sharedAnimation, plugins: { legend: { position: 'right', labels: { color: effectiveTheme === 'dark' ? '#f8fafc' : '#111827' } } } }} />
                ) : (
                  <Empty description="No sold products yet" />
                )}
              </div>
            </Card>
          </Col>
        <Col xs={24} lg={12}>
          <Card className="dashboard-chart-card" title="Products Share By Volume" variant="borderless">
            <div className="top-product-trend">
              {topSellingProducts.length > 0 ? (
                <div className="top-product-list">
                  {topSellingProducts.map((product, index) => {
                    const maxSold = topSellingProducts[0]?.sold || 1;
                    const pct = Math.round((product.sold / maxSold) * 100);
                    const colors = ['#5c2314', '#8a351e', '#bd4728', '#d95b3d', '#e3826b'];
                    return (
                      <div key={product.id || index} className="top-product-row">
                        <div className="performer-rank-badge" style={{ background: colors[index] }}>
                          {index + 1}
                        </div>
                        <div className="top-product-content">
                          <div className="top-product-meta">
                            <span className="top-product-name" title={getProductLabel(product)}>
                              {getProductLabel(product)}
                            </span>
                            <span className="top-product-score">
                              <Text type="secondary" className="top-product-count">{product.sold}/{maxSold}</Text>
                              <span className="top-product-percent">{pct}%</span>
                            </span>
                          </div>
                          <Progress percent={pct} strokeColor={colors[index]} showInfo={false} size={['100%', 4]} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty description="No sold products yet" />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Recent Transactions ── */}
      {canManageAdminPages && (
        <Card className="dashboard-chart-card" title="Recent Transactions - Today" variant="borderless" style={{ marginBottom: 16 }}>
          <Table
            columns={recentTxColumns}
            dataSource={todayBills.slice(0, 5)}
            rowKey="id"
            pagination={false}
            size="small"
            locale={{ emptyText: 'No transactions today' }}
            className="dashboard-antd-table"
          />
        </Card>
      )}

      {/* ── Low Stock Modal ── */}
      <Modal
        open={showLowStockPopup}
        onCancel={() => setShowLowStockPopup(false)}
        title="Low Stock Items"
        footer={<Button onClick={() => setShowLowStockPopup(false)}>Close</Button>}
        width={680}
        className="dashboard-antd-modal"
      >
        <Table
          columns={lowStockColumns}
          dataSource={lowStock}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ y: 300 }}
          locale={{ emptyText: 'No low stock items' }}
          className="dashboard-antd-table"
        />
      </Modal>

      {/* ── Refill Modal ── */}
      <Modal
        open={!!refillProduct}
        onCancel={() => { setRefillProduct(null); refillForm.resetFields(); }}
        title="Refill Stock"
        footer={null}
        className="dashboard-antd-modal"
      >
        {refillProduct && (
          <>
            <p style={{ marginBottom: 16 }}>
              Add stock for <b>{refillProduct.name}</b>. Current stock: <b>{Number(refillProduct.stock || 0)}</b>
            </p>
            <Form form={refillForm} layout="vertical" onFinish={submitRefill}>
              <Form.Item
                name="qty"
                label="Refill Quantity"
                rules={[{ required: true, message: 'Enter quantity' }, { type: 'number', min: 1, message: 'Must be at least 1' }]}
              >
                <InputNumber min={1} placeholder="Enter quantity" style={{ width: '100%' }} autoFocus size="large" />
              </Form.Item>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button onClick={() => { setRefillProduct(null); refillForm.resetFields(); }}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isRefilling}>
                  {isRefilling ? 'Saving...' : 'Save Refill'}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal>

      {/* ── Today's Sales Modal ── */}
      <Modal
        open={showTodaySalesPopup}
        onCancel={() => setShowTodaySalesPopup(false)}
        title="Today's Sales"
        footer={<Button onClick={() => setShowTodaySalesPopup(false)}>Close</Button>}
        width={600}
        className="dashboard-antd-modal"
      >
        <Table
          columns={todaySalesColumns}
          dataSource={todayBills}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ y: 300 }}
          locale={{ emptyText: 'No sales found' }}
          className="dashboard-antd-table"
        />
      </Modal>
    </div>
  );
}
