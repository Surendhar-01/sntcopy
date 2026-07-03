import React, { useMemo, useState } from 'react';
import './Reports.css';
import { hasAdminAccess } from '../../utils/roles';

export default function Reports({ db, user }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const effectiveStartDate = startDate || today;
  const effectiveEndDate = endDate || today;
  const canManageAdminPages = hasAdminAccess(user);
  const isAdmin = user?.role === 'Admin';

  const isWithinRange = (value) => {
    if (!value) return false;

    const current = new Date(value);
    if (Number.isNaN(current.getTime())) return false;

    const afterStart = current >= new Date(effectiveStartDate);
    const beforeEnd = current <= new Date(`${effectiveEndDate}T23:59:59`);
    return afterStart && beforeEnd;
  };

  const bills = useMemo(() => (
    (db.bills || []).filter((bill) => {
      const isMine = (bill.by || bill.by_user) === user?.user;
      const canSee = canManageAdminPages || isMine;
      if (!canSee) return false;

      const billDate = bill.date || bill.created_at;
      return isWithinRange(billDate);
    })
  ), [canManageAdminPages, db.bills, user, effectiveStartDate, effectiveEndDate]);

  const filteredPriceHistory = useMemo(() => (
    (db.priceHistory || []).filter((history) => {
      return isWithinRange(history.date || history.created_at);
    })
  ), [db.priceHistory, effectiveStartDate, effectiveEndDate]);

  const filteredLoginLogs = useMemo(() => (
    (db.loginLogs || []).filter((log) => {
      return isWithinRange(log.loginTime || log.login_time || log.created_at);
    })
  ), [db.loginLogs, effectiveStartDate, effectiveEndDate]);

  const filteredCustomers = useMemo(() => (
    (db.customers || []).filter((customer) => {
      return isWithinRange(customer.lastVisit || customer.last_visit || customer.created_at);
    })
  ), [db.customers, effectiveStartDate, effectiveEndDate]);

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const formatDateLabel = () => {
    const from = effectiveStartDate;
    const to = effectiveEndDate;
    return `_${from}_to_${to}`;
  };

  const downloadCSV = (type) => {
    if (!isAdmin && ['price', 'login', 'customer'].includes(type)) {
      return;
    }

    let csv = '';
    let filename = '';
    const dateSuffix = formatDateLabel();

    if (type === 'sales') {
      csv = 'Bill No,Date,Customer,Phone,Payment,Items,Subtotal,CGST,SGST,Grand Total,By\n';
      csv += bills.map((bill) => `${bill.billNo},${new Date(bill.date || bill.created_at).toLocaleString()},${bill.customer},${bill.phone || ''},${bill.payment},${(bill.items || []).length},${Number(bill.subtotal || 0).toFixed(2)},${Number(bill.cgst || 0).toFixed(2)},${Number(bill.sgst || 0).toFixed(2)},${Number(bill.grand || 0).toFixed(2)},${bill.by || bill.by_user || ''}`).join('\n');
      filename = canManageAdminPages
        ? `FullSalesReport${dateSuffix}_${today}.csv`
        : `MySalesReport_${user?.user}${dateSuffix}_${today}.csv`;
    } else if (type === 'stock') {
      csv = 'Product,Category,Unit,Price,Opening Stock,Sold,Current Stock,Status\n';
      csv += (db.products || []).map((product) => `${product.name},${product.cat},${product.unit},${product.price},${(product.stock || 0) + (product.sold || 0)},${product.sold || 0},${product.stock},${product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'OK'}`).join('\n');
      filename = `StockReport_${today}.csv`;
    } else if (type === 'price') {
      csv = 'Date,Product,Old Price,New Price,Changed By\n';
      csv += filteredPriceHistory.map((history) => `${new Date(history.date || history.created_at).toLocaleDateString()},${history.product},${history.old},${history.new},${history.by}`).join('\n');
      filename = `PriceHistory${dateSuffix}_${today}.csv`;
    } else if (type === 'login') {
      csv = '#,User,Role,Login Time,Logout Time,Duration,Status\n';
      csv += filteredLoginLogs.map((log, index) => {
        const duration = log.logoutTime ? formatDuration(log.loginTime, log.logoutTime) : 'Active';
        return `${index + 1},${log.user},${log.role},${new Date(log.loginTime || log.login_time).toLocaleString()},${log.logoutTime ? new Date(log.logoutTime).toLocaleString() : 'Online'},${duration},${log.logoutTime ? 'Ended' : 'Online'}`;
      }).join('\n');
      filename = `LoginActivity${dateSuffix}_${today}.csv`;
    } else if (type === 'customer') {
      csv = 'Name,Phone,Visits,Total Purchased,First Visit,Last Visit\n';
      csv += filteredCustomers.map((customer) => `${customer.name},${customer.phone || ''},${customer.visits},${Number(customer.total || 0).toFixed(2)},${customer.firstVisit ? new Date(customer.firstVisit).toLocaleDateString() : '-'},${customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '-'}`).join('\n');
      filename = `CustomerReport${dateSuffix}_${today}.csv`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return (
    <div className="reports-page-wrap">
      <div className="card reports-filter-card no-print">
        <div className="reports-filter-head">
          <div className="section-title" style={{ margin: 0 }}>Reports Download</div>
          <p className="text-muted text-sm">Choose a date range, or leave both empty to download only today&apos;s reports.</p>
        </div>

        <div className="reports-filters">
          <div className="control-group">
            <label>From Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="control-group">
            <label>To Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="reports-filter-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-3 reports-page">
        <div className="card reports-card reports-card-sales" onClick={() => downloadCSV('sales')}>
          <div className="section-title">{canManageAdminPages ? 'Sales Report (All)' : 'My Sales Report'}</div>
          <p className="text-muted text-sm mb-3">Bills in range: {bills.length}</p>
          <button className="btn btn-primary btn-sm btn-full">Download CSV</button>
        </div>

        <div className="card reports-card reports-card-stock" onClick={() => downloadCSV('stock')}>
          <div className="section-title">Current Stock Report</div>
          <p className="text-muted text-sm mb-3">Total Products: {(db.products || []).length}</p>
          <button className="btn btn-blue btn-sm btn-full">Download CSV</button>
        </div>

        {isAdmin ? (
          <>
            <div className="card reports-card reports-card-price" onClick={() => downloadCSV('price')}>
              <div className="section-title">Price History</div>
              <p className="text-muted text-sm mb-3">Changes in range: {filteredPriceHistory.length}</p>
              <button className="btn btn-success btn-sm btn-full">Download CSV</button>
            </div>

            <div className="card reports-card reports-card-login" onClick={() => downloadCSV('login')}>
              <div className="section-title">Login Activity</div>
              <p className="text-muted text-sm mb-3">Sessions in range: {filteredLoginLogs.length}</p>
              <button className="btn btn-purple btn-sm btn-full">Download CSV</button>
            </div>

            <div className="card reports-card reports-card-customer" onClick={() => downloadCSV('customer')}>
              <div className="section-title">Customer Report</div>
              <p className="text-muted text-sm mb-3">Customers in range: {filteredCustomers.length}</p>
              <button className="btn btn-secondary btn-sm btn-full">Download CSV</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
