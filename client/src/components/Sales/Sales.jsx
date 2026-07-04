import React, { useState, useEffect } from 'react';
import './Sales.css';
import { hasAdminAccess } from '../../utils/roles';

export default function Sales({ db, fetchBills, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const canManageAdminPages = hasAdminAccess(user);

  useEffect(() => {
    if (fetchBills) {
      fetchBills().catch(() => {});
    }
  }, [fetchBills]);

  const filteredBills = (db.bills || [])
    .filter((bill) => {
      const isMine = (bill.by || bill.by_user) === user?.user;
      const canSee = canManageAdminPages || isMine;
      if (!canSee) return false;

      const matchesSearch =
        (bill.billNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.customer || '').toLowerCase().includes(searchTerm.toLowerCase());

      const billDateStr = bill.date || bill.created_at;
      if (!billDateStr) return matchesSearch;

      const billDate = new Date(billDateStr);
      const afterStart = !startDate || billDate >= new Date(startDate);
      const beforeEnd = !endDate || billDate <= new Date(`${endDate}T23:59:59`);

      return matchesSearch && afterStart && beforeEnd;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0);
      const dateB = new Date(b.date || b.created_at || 0);

      if (sortBy === 'date-desc') return dateB - dateA;
      if (sortBy === 'date-asc') return dateA - dateB;
      if (sortBy === 'price-high') return (b.grand || 0) - (a.grand || 0);
      if (sortBy === 'price-low') return (a.grand || 0) - (b.grand || 0);
      return 0;
    });

  const totalSalesCount = filteredBills.length;
  const totalSalesAmount = filteredBills.reduce((sum, bill) => sum + (bill.grand || 0), 0);

  return (
    <div className="card sales-page">
      <div className="flex justify-between items-center mb-1 sales-header-row">
        <div className="section-title sales-title" style={{ margin: 0, border: 'none' }}>
          {'\u{1F4CB}'} {canManageAdminPages ? 'Sales History (All Bills)' : 'My Sales History'}
        </div>
        <div className="flex items-center gap-2">
          <div className="sales-stats text-sm">
            <span className="text-muted">Total Bills: </span>
            <b className="text-accent">{totalSalesCount}</b>
            <span className="text-muted ml-3"> | Amount: </span>
            <b className="text-accent">Rs {totalSalesAmount.toFixed(2)}</b>
          </div>
        </div>
      </div>

      <div className="sales-controls flex flex-wrap gap-3 mb-4 no-print">
        <div className="control-group flex-1" style={{ minWidth: '200px' }}>
          <label>Search Customer/Bill</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="form-control"
          />
        </div>
        <div className="control-group">
          <label>From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="form-control"
          />
        </div>
        <div className="control-group">
          <label>To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="form-control"
          />
        </div>
        <div className="control-group" style={{ minWidth: '160px' }}>
          <label>Sort By</label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="form-control"
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="price-high">Price (Highest First)</option>
            <option value="price-low">Price (Lowest First)</option>
          </select>
        </div>
      </div>

      <div className="table-wrap sales-table">
        <table>
          <thead>
            <tr><th>Bill No</th><th>Date</th><th>Customer</th><th>Amount</th><th>Method</th><th>Issued By</th></tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill.id}>
                <td className="fw-bold text-accent">{bill.billNo}</td>
                <td className="text-xs">{new Date(bill.date || bill.created_at).toLocaleString()}</td>
                <td>{bill.customer}</td>
                <td className="fw-bold">{`Rs ${(bill.grand || 0).toFixed(2)}`}</td>
                <td><span className={`badge ${bill.payment === 'Cash' ? 'badge-green' : 'badge-blue'}`}>{bill.payment}</span></td>
                <td className="text-muted text-xs"><b>{bill.by || bill.by_user || 'System'}</b></td>
              </tr>
            ))}
            {filteredBills.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-5">
                  No bills found matching filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
