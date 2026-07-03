import React, { useState, useMemo } from 'react';
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
import { Line, Bar } from 'react-chartjs-2';
import './Dashboard.css';
import { hasAdminAccess } from '../../utils/roles';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

function getWeekStart(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatCurrency(value) {
  return `\u20B9${Number(value || 0).toFixed(2)}`;
}

function getProductLabel(product) {
  if (product.code) {
    return product.code;
  }

  return product.name;
}

function DashboardStatIcon({ icon }) {
  switch (icon) {
    case 'sales':
      return <span className="dashboard-currency-icon">{'\u20B9'}</span>;
    case 'bills':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h10v18l-2-1.5L13 21l-2-1.5L9 21l-2-1.5L5 21V5a2 2 0 0 1 2-2Z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      );
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 4h8v3a4 4 0 0 1-8 0Z" />
          <path d="M6 5H4a2 2 0 0 0 2 5h1" />
          <path d="M18 5h2a2 2 0 0 1-2 5h-1" />
          <path d="M12 11v4" />
          <path d="M9 21h6" />
          <path d="M10 15h4v3h-4z" />
        </svg>
      );
    case 'warning':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4 3 20h18Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );
    case 'calendar-week':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3v3" />
          <path d="M17 3v3" />
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M4 10h16" />
          <path d="M8 14h3" />
          <path d="M13 14h3" />
        </svg>
      );
    case 'calendar-month':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3v3" />
          <path d="M17 3v3" />
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M4 10h16" />
          <path d="M8 14h8" />
        </svg>
      );
    case 'calendar-year':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3v3" />
          <path d="M17 3v3" />
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M4 10h16" />
          <path d="M8 14h2" />
          <path d="M12 14h2" />
          <path d="M16 14h2" />
        </svg>
      );
    case 'package':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
          <path d="m12 12 8-4.5" />
          <path d="m12 12-8-4.5" />
          <path d="M12 12v9" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Dashboard({ db, user }) {
  const [showLowStockPopup, setShowLowStockPopup] = useState(false);
  const [showTodaySalesPopup, setShowTodaySalesPopup] = useState(false);
  const canManageAdminPages = hasAdminAccess(user);
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const showSalesTrend = !isManager;

  const bills = useMemo(() => (db.bills || []).filter((bill) => {
    if (canManageAdminPages) return true;
    return (bill.by || bill.by_user) === user?.user;
  }), [db.bills, canManageAdminPages, user?.user]);

  const products = useMemo(() => db.products || [], [db.products]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const weekStart = getWeekStart(now);

    const todayBills = bills.filter((bill) => {
      if (!bill.date) return false;
      const billDate = new Date(bill.date);
      return billDate >= startOfToday && billDate < startOfTomorrow;
    });
    const weeklyBills = bills.filter((bill) => {
      if (!bill.date) return false;
      return new Date(bill.date) >= weekStart;
    });
    const monthlyBills = bills.filter((bill) => {
      if (!bill.date) return false;
      const date = new Date(bill.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const yearlyBills = bills.filter((bill) => {
      if (!bill.date) return false;
      return new Date(bill.date).getFullYear() === currentYear;
    });

    const todaySales = todayBills.reduce((sum, bill) => sum + (bill.grand || 0), 0);
    const weeklyRevenue = weeklyBills.reduce((sum, bill) => sum + (bill.grand || 0), 0);
    const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + (bill.grand || 0), 0);
    const yearlyRevenue = yearlyBills.reduce((sum, bill) => sum + (bill.grand || 0), 0);

    const lowStock = products.filter((product) => (product.stock || 0) <= 5);
    const soldProducts = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
    const topProduct = soldProducts[0] || null;
    const topSellingProducts = soldProducts
      .filter((product) => Number(product.sold || 0) > 0)
      .slice(0, 5);
    const totalInventoryValue = products.reduce((sum, product) => sum + ((product.stock || 0) * (product.price || 0)), 0);

    return {
      todayBills,
      weeklyBills,
      monthlyBills,
      yearlyBills,
      todaySales,
      weeklyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      lowStock,
      topProduct,
      topSellingProducts,
      totalInventoryValue
    };
  }, [bills, products]);

  const {
    todayBills,
    weeklyBills,
    monthlyBills,
    yearlyBills,
    todaySales,
    weeklyRevenue,
    monthlyRevenue,
    yearlyRevenue,
    lowStock,
    topProduct,
    topSellingProducts,
    totalInventoryValue
  } = stats;

  const salesTrendData = useMemo(() => ({
    labels: ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'],
    datasets: [
      {
        label: 'Sales (\u20B9)',
        data: [12000, 15000, 8000, 19000, 22000, 17000, todaySales],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }), [todaySales]);

  const topProductsData = useMemo(() => ({
    labels: topSellingProducts.map(getProductLabel),
    datasets: [
      {
        label: 'Units Sold',
        data: topSellingProducts.map((product) => product.sold || 0),
        backgroundColor: ['#f97316', '#22c55e', '#2363eb', '#7c3aed', '#dc2626']
      }
    ]
  }), [topSellingProducts]);

  return (
    <div>
      <div className={`grid ${canManageAdminPages ? 'grid-4' : 'grid-3'} mb-4`}>
        <div className="stat-card dashboard-summary-card orange" onClick={() => setShowTodaySalesPopup(true)} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Today Sales</div>
          <div className="stat-value">{formatCurrency(todaySales)}</div>
          <div className="stat-sub">{todayBills.length} bills today</div>
          <div className="stat-icon"><DashboardStatIcon icon="sales" /></div>
        </div>
        <div className="stat-card dashboard-summary-card green">
          <div className="stat-label">Bills Today</div>
          <div className="stat-value">{todayBills.length}</div>
          <div className="stat-sub">Total {bills.length} all time</div>
          <div className="stat-icon"><DashboardStatIcon icon="bills" /></div>
        </div>
        <div className="stat-card dashboard-summary-card blue">
          <div className="stat-label">Top Product</div>
          <div className="stat-value dashboard-text-stat">{topProduct ? topProduct.name : 'No sales yet'}</div>
          <div className="stat-sub">{topProduct ? `${topProduct.sold || 0} units sold` : 'Waiting for sales data'}</div>
          <div className="stat-icon"><DashboardStatIcon icon="trophy" /></div>
        </div>
        {canManageAdminPages && (
          <div className="stat-card dashboard-summary-card red" onClick={() => setShowLowStockPopup(true)} style={{ cursor: 'pointer' }}>
            <div className="stat-label">Low Stock Items</div>
            <div className="stat-value">{lowStock.length}</div>
            <div className="stat-sub">{products.filter((product) => product.stock === 0).length} out of stock</div>
            <div className="stat-icon"><DashboardStatIcon icon="warning" /></div>
          </div>
        )}
      </div>

      {!canManageAdminPages && (
        <div className="grid grid-2 mb-4">
          <div className="stat-card dashboard-summary-card red" onClick={() => setShowLowStockPopup(true)} style={{ cursor: 'pointer' }}>
            <div className="stat-label">Low Stock Items</div>
            <div className="stat-value">{lowStock.length}</div>
            <div className="stat-sub">{products.filter((product) => product.stock === 0).length} out of stock</div>
            <div className="stat-icon"><DashboardStatIcon icon="warning" /></div>
          </div>
          <div className="stat-card dashboard-summary-card orange">
            <div className="stat-label">Stock Value</div>
            <div className="stat-value">{formatCurrency(totalInventoryValue)}</div>
            <div className="stat-sub">Current on-hand</div>
            <div className="stat-icon"><DashboardStatIcon icon="package" /></div>
          </div>
        </div>
      )}

      {isAdmin ? (
        <div className="grid grid-4 mb-4">
          <div className="stat-card dashboard-summary-card purple">
            <div className="stat-label">Weekly Revenue</div>
            <div className="stat-value">{formatCurrency(weeklyRevenue)}</div>
            <div className="stat-sub">{weeklyBills.length} bills</div>
            <div className="stat-icon"><DashboardStatIcon icon="calendar-week" /></div>
          </div>
          <div className="stat-card dashboard-summary-card orange">
            <div className="stat-label">Monthly Revenue</div>
            <div className="stat-value">{formatCurrency(monthlyRevenue)}</div>
            <div className="stat-sub">This month</div>
            <div className="stat-icon"><DashboardStatIcon icon="calendar-month" /></div>
          </div>
          <div className="stat-card dashboard-summary-card green">
            <div className="stat-label">Yearly Revenue</div>
            <div className="stat-value">{formatCurrency(yearlyRevenue)}</div>
            <div className="stat-sub">This year</div>
            <div className="stat-icon"><DashboardStatIcon icon="calendar-year" /></div>
          </div>
          <div className="stat-card dashboard-summary-card orange">
            <div className="stat-label">Stock Value</div>
            <div className="stat-value">{formatCurrency(totalInventoryValue)}</div>
            <div className="stat-sub">Current on-hand</div>
            <div className="stat-icon"><DashboardStatIcon icon="package" /></div>
          </div>
        </div>
      ) : null}

      <div
        className="grid mb-4"
        style={{ gridTemplateColumns: showSalesTrend ? 'repeat(2, 1fr)' : '1fr' }}
      >
        {showSalesTrend ? (
          <div className="card">
            <div className="section-title">Sales Trend</div>
            <div className="chart-wrap" style={{ height: '220px' }}>
              <Line data={salesTrendData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        ) : null}
        <div className="card">
          <div className="section-title">Top Products</div>
          <div className="chart-wrap" style={{ height: '220px' }}>
            {topSellingProducts.length > 0 ? (
              <Bar data={topProductsData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            ) : (
              <div className="empty-state">No sold products yet</div>
            )}
          </div>
        </div>
      </div>

      {canManageAdminPages && (
        <div className="card">
          <div className="section-title">Recent Transactions</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {todayBills.slice(0, 5).map((bill) => (
                  <tr key={bill.id}>
                    <td><b>{bill.billNo}</b></td>
                    <td>{bill.customer}</td>
                    <td className="fw-bold">{formatCurrency(bill.grand)}</td>
                    <td><span className="badge badge-blue">{bill.payment}</span></td>
                    <td className="text-muted text-xs">{new Date(bill.date).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {todayBills.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No transactions today</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showLowStockPopup && (
        <div className="modal-overlay open" onClick={() => setShowLowStockPopup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '15px' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Low Stock Items</h3>
              <button className="modal-close" onClick={() => setShowLowStockPopup(false)}>✕</button>
            </div>
            <div className="table-wrap" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(product => (
                    <tr key={product.id}>
                      <td>{product.code}</td>
                      <td>{product.name}</td>
                      <td style={{ textAlign: 'right' }} className="text-red fw-bold">{product.stock}</td>
                    </tr>
                  ))}
                  {lowStock.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">No low stock items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button className="btn btn-secondary" onClick={() => setShowLowStockPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showTodaySalesPopup && (
        <div className="modal-overlay open" onClick={() => setShowTodaySalesPopup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '15px' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Today's Sales</h3>
              <button className="modal-close" onClick={() => setShowTodaySalesPopup(false)}>✕</button>
            </div>
            <div className="table-wrap" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Bill No</th>
                    <th>Customer</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {todayBills.map((bill) => (
                    <tr key={bill.id}>
                      <td><b>{bill.billNo}</b></td>
                      <td>{bill.customer}</td>
                      <td style={{ textAlign: 'right' }} className="fw-bold">{formatCurrency(bill.grand)}</td>
                      <td style={{ textAlign: 'right' }} className="text-muted text-xs">{new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                  {todayBills.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">No sales today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button className="btn btn-secondary" onClick={() => setShowTodaySalesPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
