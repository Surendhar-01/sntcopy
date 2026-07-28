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
import { Line, Pie } from 'react-chartjs-2';
import './Dashboard.css';
import { hasAdminAccess, isRole, USER_ROLES } from '../../utils/roles';

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
                  <Pie data={topProductsData} options={{ maintainAspectRatio: false, animation: sharedAnimation, plugins: { legend: { position: 'right', labels: { color: 'inherit' } } } }} />
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
