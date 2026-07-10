import React, { useMemo, useState, useEffect } from 'react';
import './Customers.css';

export default function Customers({ db, fetchCustomers }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('revenue-desc');

  useEffect(() => {
    if (fetchCustomers) {
      fetchCustomers().catch(() => {});
    }
  }, [fetchCustomers]);

  const filteredAndSortedCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const customers = Array.isArray(db.customers) ? [...db.customers] : [];

    const filtered = customers.filter((customer) => {
      const matchesSearch =
        String(customer.name || '').toLowerCase().includes(normalizedSearch) ||
        String(customer.phone || '').includes(normalizedSearch);

      if (!matchesSearch) return false;

      const lastVisitStr = customer.lastVisit;
      if (!startDate && !endDate) return true;
      if (!lastVisitStr) return false;

      const lastVisit = new Date(lastVisitStr);
      const afterStart = !startDate || lastVisit >= new Date(startDate);
      const beforeEnd = !endDate || lastVisit <= new Date(`${endDate}T23:59:59`);

      return afterStart && beforeEnd;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'revenue-desc') return Number(b.total || 0) - Number(a.total || 0);
      if (sortBy === 'revenue-asc') return Number(a.total || 0) - Number(b.total || 0);

      const dateA = new Date(a.lastVisit || 0);
      const dateB = new Date(b.lastVisit || 0);
      if (sortBy === 'visit-newest') return dateB - dateA;
      if (sortBy === 'visit-oldest') return dateA - dateB;

      return 0;
    });
  }, [db.customers, searchTerm, startDate, endDate, sortBy]);

  const totalCustomers = filteredAndSortedCustomers.length;
  const totalRevenue = filteredAndSortedCustomers.reduce(
    (sum, customer) => sum + Number(customer.total || 0),
    0
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-description">View customer purchase history and details.</p>
      </div>
    <div className="card customers-page">
      <div className="flex justify-between items-center mb-1 customers-header">
        <div className="section-title customers-title" style={{ margin: 0, border: 'none' }}>
          {'\u{1F465}'} Customer Database
        </div>
        <div className="customers-stats text-sm">
          <span className="text-muted">Total Customers: </span>
          <b className="text-accent">{totalCustomers}</b>
          <span className="text-muted ml-3"> | Amount: </span>
          <b className="text-accent">Rs {totalRevenue.toFixed(2)}</b>
        </div>
      </div>

      <div className="customers-filters flex flex-wrap gap-3 mb-4 no-print">
        <div className="control-group flex-1" style={{ minWidth: '220px' }}>
          <label>Search Customer/Phone</label>
          <input
            type="text"
            className="form-control"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search..."
          />
        </div>
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
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        <div className="control-group" style={{ minWidth: '180px' }}>
          <label>Sort By</label>
          <select
            className="form-control"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="visit-newest">Date (Newest First)</option>
            <option value="visit-oldest">Date (Oldest First)</option>
            <option value="revenue-desc">Revenue (High to Low)</option>
            <option value="revenue-asc">Revenue (Low to High)</option>
          </select>
        </div>
      </div>

      <div className="table-wrap customers-table">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Visits</th><th>Total Purchases</th><th>Last Visit</th><th>Type</th></tr>
          </thead>
          <tbody>
            {filteredAndSortedCustomers.map((customer) => (
              <tr key={customer.id}>
                <td><b>{customer.name}</b></td>
                <td>{customer.phone || '-'}</td>
                <td>{customer.visits}</td>
                <td className="fw-bold text-green">Rs {Number(customer.total || 0).toFixed(2)}</td>
                <td className="text-muted text-xs">{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '-'}</td>
                <td>{customer.visits > 1 ? <span className="badge badge-green">Returning</span> : <span className="badge badge-blue">New</span>}</td>
              </tr>
            ))}
            {filteredAndSortedCustomers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-5">
                  No customers found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
