import React, { useEffect, useState } from 'react';
import ClearConfirmModal from '../ClearConfirmModal';
import './Stock.css';

export default function Stock({ db, erp, user }) {
  const [refillProduct, setRefillProduct] = useState(null);
  const [refillQty, setRefillQty] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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
        product: refillProduct,
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

  return (
    <div className="stock-page">
      <div className="card mb-4 stock-card">
        <div className="section-title">Stock Management</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Opening Stock</th>
                <th>Sold</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {db.products.map((product) => (
                <tr key={product.id}>
                  <td><b>{product.name}</b></td>
                  <td>{product.stock + (product.sold || 0)}</td>
                  <td className="text-red">{product.sold || 0}</td>
                  <td className="fw-bold">{product.stock}</td>
                  <td>
                    {product.stock <= 5
                      ? <span className="badge badge-red">Refill Due</span>
                      : <span className="badge badge-green">Healthy</span>}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => setRefillProduct(product.name)}>Refill</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card stock-card">
        <div className="flex justify-between items-center mb-3 stock-history-header">
          <div className="section-title stock-inline-title">Refill History</div>
          <button
            className="btn btn-danger btn-sm"
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={!db.refills.length || isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear All'}
          </button>
        </div>
        <div className="table-wrap">
          <table>
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
            <p className="text-sm mb-3">Add new stock inventory for <b>{refillProduct}</b></p>
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

    </div>
  );
}
