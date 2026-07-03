import React, { useEffect, useEffectEvent, useState } from 'react';
import './Billing.css';

export default function Billing({ erp, user }) {
  const [items, setItems] = useState([]);
  const [viewBill, setViewBill] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [qty, setQty] = useState(1);
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState('Cash');
  const [toast, setToast] = useState(null);
  const [hiddenRecentBillIds, setHiddenRecentBillIds] = useState([]);

  const { db, addBill } = erp;
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
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setViewBill(null);
        setIsReviewMode(false);
        setShowProductPopup(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
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

  const addItem = (product) => {
    const parsedQty = parseInt(qty, 10) || 1;
    const newItem = {
      id: product.id,
      name: product.name,
      qty: parsedQty,
      price: product.price,
      total: product.price * parsedQty
    };

    setItems([...items, newItem]);
    setSearchTerm('');
    setQty(1);
    setShowProductPopup(false);
    showToast('Product added to cart');
  };

  const removeItem = (index) => {
    setItems(items.filter((_, currentIndex) => currentIndex !== index));
  };

  const changeItemQty = (index, delta) => {
    setItems((prevItems) => prevItems.map((item, currentIndex) => {
      if (currentIndex !== index) {
        return item;
      }

      const nextQty = Math.max(1, Number(item.qty || 1) + delta);
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

  const isAdmin = user?.role === 'Admin';
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

    return (Array.isArray(db.customers) ? db.customers : []).find((existingCustomer) => (
      String(existingCustomer.phone || '').replace(/\D/g, '') === digits
    )) || null;
  };
  const todayStr = new Date().toDateString();
  const recentBills = (db.bills || [])
    .filter(bill => (isAdmin || (bill.by || bill.by_user) === user?.user) && !hiddenRecentBillIds.includes(bill.id) && new Date(bill.date).toDateString() === todayStr)
    .slice(0, 6);

  return (
    <>
      {toast && (
        <div className={`toast-msg ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: 'minmax(0, 1.7fr) minmax(360px, 1fr)',
          alignItems: 'start'
        }}
      >
      <div style={{ minWidth: 0 }}>
        <div className="card mb-4 no-print">
          <div className="bill-header">
            <div className="bill-shop-name gold-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <img src="/logo.svg" alt="Logo" style={{ height: '32px' }} />
              {db.settings.shop}
            </div>
            <div className="bill-address">{db.settings.addr}<br />Ph: {db.settings.phone}</div>
          </div>
          <div className="form-row mb-3">
            <div className="form-group"><label>Bill No</label><input readOnly value={`SNT-${String(nextBillSeq).padStart(4, '0')}`} style={{ color: 'var(--accent)', fontWeight: 700 }} /></div>
            <div className="form-group"><label>Date</label><input readOnly value={new Date().toLocaleString()} /></div>
            <div className="form-group"><label>Payment</label>
              <select value={payment} onChange={(event) => setPayment(event.target.value)}>
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Customer Name <span className="text-red" title="Required">*</span></label><input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Required" /></div>
            <div className="form-group"><label>Mobile No <span className="text-red" title="Required">*</span></label><input value={phone} onChange={(event) => {
              const nextPhone = event.target.value.replace(/\D/g, '').slice(0, 10);
              setPhone(nextPhone);

              const matchedCustomer = findCustomerByPhone(nextPhone);
              if (matchedCustomer?.name) {
                setCustomer(matchedCustomer.name);
              }
            }} maxLength="10" placeholder="10 Digits Required" /></div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Add Item</div>
          <div className="form-group mb-3">
            <input
              placeholder="Click to select products..."
              value={searchTerm}
              readOnly
              onClick={() => setShowProductPopup(true)}
              style={{ flex: 1 }}
            />
          </div>

          <div className="table-wrap mb-3">
            <table>
              <thead><tr><th style={{ width: '180px' }}>Item</th><th style={{ textAlign: 'center' }}>Qty</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '.8rem' }}>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="qty-stepper">
                        <button
                          type="button"
                          className="qty-stepper-btn"
                          onClick={() => changeItemQty(index, -1)}
                          disabled={item.qty <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>
                        <span className="qty-stepper-value">{item.qty}</span>
                        <button
                          type="button"
                          className="qty-stepper-btn"
                          onClick={() => changeItemQty(index, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>Rs {item.total}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="del-btn" onClick={() => removeItem(index)} title="Remove Item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 01 2-2h4a2 2 0 01 2 2v2M10 11v6M14 11v6"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No cart items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="totals-box">
            <div className="total-row"><span>Subtotal:</span><span>Rs {netSubtotal.toFixed(2)}</span></div>
            <div className="total-row"><span>CGST @{(db.settings.gst / 2).toFixed(1)}%:</span><span>Rs {(gstAmt / 2).toFixed(2)}</span></div>
            <div className="total-row"><span>SGST @{(db.settings.gst / 2).toFixed(1)}%:</span><span>Rs {(gstAmt / 2).toFixed(2)}</span></div>
            <div className="total-row grand"><span>Total:</span><span>Rs {grandTotal.toFixed(2)}</span></div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary" onClick={handleSaveBill}>Save Receipt</button>
            <button className="btn btn-secondary btn-review" onClick={reviewBill}>Review Order</button>
            <button className="btn btn-blue" onClick={printBill}>Print</button>
            <button className="btn btn-danger" onClick={() => setItems([])}>Clear</button>
          </div>
        </div>
      </div>

      <div className="card no-print" style={{ width: '100%', minWidth: 0 }}>
        <div className="section-title">Recent Bills</div>
        <div className="recent-bills-list">
          {recentBills.map((bill) => (
            <div key={bill.id} className="card bg3 border-radius mb-1" style={{ padding: '10px', cursor: 'pointer', transition: '0.2s', border: '1px solid var(--border)' }} onClick={() => { setViewBill(bill); setIsReviewMode(false); }} title="Click to view details">
              <div className="flex justify-between items-center mb-1">
                <b className="text-accent text-sm">{bill.billNo}</b>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button className="del-btn" style={{ padding: '2px', color: 'var(--red)', width: 'auto', height: 'auto' }} onClick={(event) => { event.stopPropagation(); hideRecentBill(bill.id); }} title="Remove from recent list">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 01 2-2h4a2 2 0 01 2 2v2M10 11v6M14 11v6"></path></svg>
                  </button>
                </div>
              </div>
              <div className="text-sm fw-600">{bill.customer}</div>
              <div className="flex justify-between mt-2">
                <span className="badge badge-green text-xs" style={{ padding: '1px 6px' }}>{bill.payment}</span>
                <b className="text-sm">Rs {bill.grand.toFixed(2)}</b>
              </div>
            </div>
          ))}
          {recentBills.length === 0 && <div className="text-center text-muted text-sm mt-4">No recent bills</div>}
        </div>
      </div>

      {viewBill && (
        <div className="modal-overlay open" onClick={() => { setViewBill(null); setIsReviewMode(false); }} style={{ padding: '20px' }}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: 'var(--text)' }}>{isReviewMode ? 'Review Bill' : 'Bill Details'}</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>{viewBill.billNo}</div>
              </div>
              <button className="modal-close" onClick={() => { setViewBill(null); setIsReviewMode(false); }}>x</button>
            </div>

            <div style={{ paddingBottom: '15px', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
              <div className="grid grid-2 text-sm" style={{ gap: '8px' }}>
                <div><span className="text-muted">Date:</span> <b>{new Date(viewBill.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</b></div>
                <div><span className="text-muted">Customer:</span> <b>{viewBill.customer}</b></div>
                <div><span className="text-muted">Phone:</span> <b>{viewBill.phone || 'N/A'}</b></div>
                <div><span className="text-muted">Payment:</span> <span className="badge badge-green">{viewBill.payment}</span></div>
                <div><span className="text-muted">Billed By:</span> <b>{viewBill.by || 'System'}</b></div>
              </div>
            </div>

            <div className="table-wrap mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Item</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewBill.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'right' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right' }}>Rs {item.price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>Rs {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="totals-box mb-4">
              <div className="total-row"><span>Subtotal:</span><span>Rs {viewBill.subtotal.toFixed(2)}</span></div>
              <div className="total-row"><span>CGST:</span><span>Rs {viewBill.cgst.toFixed(2)}</span></div>
              <div className="total-row"><span>SGST:</span><span>Rs {viewBill.sgst.toFixed(2)}</span></div>
              <div className="total-row grand"><span>Total:</span><span>Rs {viewBill.grand.toFixed(2)}</span></div>
            </div>

            <div className="flex justify-end items-center mt-2">
              <button className="btn btn-blue" onClick={() => { setViewBill(null); setIsReviewMode(false); }} style={{ padding: '8px 24px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showProductPopup && (
        <div className="modal-overlay open" onClick={() => setShowProductPopup(false)} style={{ padding: '20px' }}>
          <div className="modal billing-product-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Select Product</div>
                <div className="text-muted text-sm">Choose item and it will be added to cart with selected quantity.</div>
              </div>
              <button className="modal-close" onClick={() => setShowProductPopup(false)}>x</button>
            </div>

            <div className="flex gap-2 mb-3">
              <div className="form-group" style={{ flex: 1 }}>
                <input
                  autoFocus
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="form-group" style={{ width: '120px' }}>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter Quantity"
                  value={qty}
                  onChange={(event) => setQty(Math.max(1, Number.parseInt(event.target.value, 10) || 1))}
                  title="Quantity"
                />
              </div>
            </div>

            <div className="billing-product-list">
              {popupProducts.map((product) => (
                <button
                  key={product.id}
                  className="billing-product-row"
                  type="button"
                  onClick={() => addItem(product)}
                >
                  <span className="billing-product-name">{product.name}</span>
                  <span className="billing-product-price">Rs {Number(product.price || 0).toFixed(2)}</span>
                </button>
              ))}
              {popupProducts.length === 0 && (
                <div className="text-center text-muted text-sm" style={{ padding: '12px 8px' }}>
                  No matching products found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
