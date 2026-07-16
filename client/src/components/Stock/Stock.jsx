import React, { useEffect, useState } from 'react';
import ClearConfirmModal from '../ClearConfirmModal';
import './Stock.css';

export default function Stock({ db, erp, user }) {
  const [refillProduct, setRefillProduct] = useState(null);
  const [refillQty, setRefillQty] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetStockConfirm, setShowResetStockConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isResettingStock, setIsResettingStock] = useState(false);

  const getOpeningStock = (product) => {
    return Number(product.opening_stock || 0);
  };

  useEffect(() => {
    erp.fetchProducts().catch(() => {});
    erp.fetchRefills().catch(() => {});
  }, [erp]);

  useEffect(() => {
    if (!refillProduct) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setRefillProduct(null);
        setRefillQty('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refillProduct]);

  const submitRefill = async () => {
    if (!refillQty || Number.isNaN(Number(refillQty)) || parseInt(refillQty, 10) <= 0) {
      alert('Enter a valid positive quantity');
      return;
    }

    try {
      await erp.addRefill({
        product_id: refillProduct.id,
        product: refillProduct.name,
        qty: parseInt(refillQty, 10),
        by: user ? user.user : 'Admin'
      });

      setRefillProduct(null);
      setRefillQty('');
    } catch (error) {
      alert(error.message || 'Failed to save refill');
    }
  };

  const handleClearRefills = async () => {
    if (!db.refills.length || isClearing) {
      return;
    }

    setIsClearing(true);
    try {
      await erp.clearRefills();
      setShowClearConfirm(false);
    } catch (error) {
      alert(error.message || 'Failed to clear refill history');
    } finally {
      setIsClearing(false);
    }
  };

  const handleResetStock = async () => {
    if (isResettingStock) {
      return;
    }

    setIsResettingStock(true);
    try {
      await erp.resetProductStock();
      setShowResetStockConfirm(false);
    } catch (error) {
      alert(error.message || 'Failed to reset stock');
    } finally {
      setIsResettingStock(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Stock & Inventory</h1>
        <p className="page-description">Monitor product availability, sold units, and manage refills.</p>
      </div>
    <div className="stock-page">
      <div className="card mb-4 stock-card">
        <div className="stock-header mb-3">
          <div className="section-title stock-title">Stock Management</div>
          <button
            className="btn btn-danger btn-sm"
            type="button"
            onClick={() => setShowResetStockConfirm(true)}
            disabled={isResettingStock}
          >
            {isResettingStock ? 'Resetting...' : 'Reset Stock'}
          </button>
        </div>
        <div className="table-wrap stock-table-wrap">
          <table className="data-table stock-data-table">
            <thead>
              <tr>
                <th style={{width: '10%'}}>ID</th>
                <th style={{width: '20%'}}>Product</th>
                <th>Opening Stock</th>
                <th>Sold</th>
                <th>Current Stock</th>
                <th>Stock Value</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {db.products.map((product) => (
                <tr key={product.id}>
                  <td className="text-muted text-xs">{product.code || product.id}</td>
                  <td><b>{product.name}</b></td>
                  <td>{getOpeningStock(product)}</td>
                  <td className="text-red">{product.sold || 0}</td>
                  <td className="fw-bold">{product.stock}</td>
                  <td className="text-accent fw-bold">Rs {(product.price * product.stock).toFixed(2)}</td>
                  <td>
                    {product.stock <= 5
                      ? <span className="badge badge-red">Refill Due</span>
                      : <span className="badge badge-green">Healthy</span>}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-action" onClick={() => setRefillProduct(product)}>Refill</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card stock-card">
        <div className="flex justify-between items-center mb-3 stock-header">
          <div className="section-title stock-title">Refill History</div>
          <button
            className="btn btn-clear-outline btn-sm"
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={!db.refills.length || isClearing}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginTop: '-1px' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            {isClearing ? 'Clearing...' : 'Clear'}
          </button>
        </div>
        <div className="table-wrap stock-table-wrap">
          <table className="data-table stock-data-table refill-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Qty</th>
                <th>By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {db.refills.map((refill) => (
                <tr key={refill.id}>
                  <td>{new Date(refill.date).toLocaleDateString('en-GB')}</td>
                  <td>{refill.product}</td>
                  <td className="text-green fw-bold">+{refill.qty}</td>
                  <td>{refill.by}</td>
                  <td>
                    <button
                      className="del-btn"
                      type="button"
                      title="Delete refill"
                      onClick={async () => {
                        try {
                          await erp.deleteRefill(refill.id);
                        } catch (error) {
                          alert(error.message || 'Failed to delete refill');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {db.refills.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted">No refill history</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {refillProduct && (
        <div className="modal-overlay open" onClick={() => { setRefillProduct(null); setRefillQty(''); }}>
          <div className="modal stock-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Refill Stock</h3>
              <button className="modal-close" type="button" onClick={() => { setRefillProduct(null); setRefillQty(''); }}>x</button>
            </div>
            <p className="text-sm mb-3">Add new stock inventory for <b>{refillProduct.name}</b></p>
            <div className="form-group mb-4">
              <label>Refill Quantity</label>
              <input
                type="number"
                value={refillQty}
                onChange={(event) => setRefillQty(event.target.value)}
                min="1"
                placeholder="Enter quantity"
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitRefill();
                }}
              />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={submitRefill}>Save Refill</button>
              <button className="btn btn-secondary" onClick={() => { setRefillProduct(null); setRefillQty(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ClearConfirmModal
        open={showClearConfirm}
        loading={isClearing}
        title="Clear Refill History"
        message="Clear all refill history records permanently?"
        confirmLabel="Clear All"
        onConfirm={handleClearRefills}
        onClose={() => setShowClearConfirm(false)}
      />

      <ClearConfirmModal
        open={showResetStockConfirm}
        loading={isResettingStock}
        title="Reset Stock"
        message="Set Opening Stock, Sold, and Current Stock to 0 for all products?"
        confirmLabel={isResettingStock ? 'Resetting...' : 'Reset Stock'}
        onConfirm={handleResetStock}
        onClose={() => setShowResetStockConfirm(false)}
      />

    </div>
    </>
  );
}
