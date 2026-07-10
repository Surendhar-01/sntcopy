import React, { useEffect, useState } from 'react';
import ClearConfirmModal from '../ClearConfirmModal';
import './Pricing.css';

export default function Pricing({ db, erp, user }) {
  const [priceModal, setPriceModal] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    erp.fetchProducts().catch(() => {});
    erp.fetchPriceHistory().catch(() => {});
  }, [erp]);

  useEffect(() => {
    if (!priceModal) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPriceModal(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [priceModal]);

  const openPriceModal = (product) => {
    setPriceModal({
      id: product.id,
      name: product.name,
      currentPrice: product.price.toFixed(2),
      newPrice: product.price.toFixed(2)
    });
  };

  const handleSavePrice = async () => {
    if (!priceModal || Number.isNaN(Number(priceModal.newPrice))) {
      return;
    }

    try {
      await erp.updateProductPrice(priceModal.id, parseFloat(priceModal.newPrice), user.user);
      setPriceModal(null);
    } catch (error) {
      alert(error.message || 'Failed to update price');
    }
  };

  const handleClearLog = async () => {
    if (!db.priceHistory.length || isClearing) {
      return;
    }

    setIsClearing(true);
    try {
      await erp.clearPriceHistory();
      setShowClearConfirm(false);
    } catch (error) {
      alert(error.message || 'Failed to clear price history');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Pricing Control</h1>
        <p className="page-description">Manage product rates and track historical price variations.</p>
      </div>
    <div className="pricing-page">
      <div className="card mb-4 pricing-card">
        <div className="pricing-header mb-3">
          <div className="section-title pricing-title">Price Control</div>
        </div>
        <div className="table-wrap" style={{ maxHeight: '560px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>ID</th>
                <th style={{ width: '30%' }}>Product</th>
                <th>Previous</th>
                <th>Current</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {db.products.map((product) => {
                const history = db.priceHistory.find((entry) => entry.product === product.name);
                const previous = history ? history.old : product.price;

                return (
                  <tr key={product.id}>
                    <td className="text-muted text-xs">{product.code || product.id}</td>
                    <td><b>{product.name}</b></td>
                    <td className="text-muted">Rs {previous.toFixed(2)}</td>
                    <td className="fw-bold text-accent">Rs {product.price.toFixed(2)}</td>
                    <td>
                      <button className="btn btn-sm btn-action" onClick={() => openPriceModal(product)}>Update</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card pricing-card">
        <div className="flex justify-between items-center mb-3 pricing-header">
          <div className="section-title pricing-title">Price Change Log</div>
          <button
            className="btn btn-clear-outline btn-sm"
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={!db.priceHistory.length || isClearing}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginTop: '-1px' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            {isClearing ? 'Clearing...' : 'Clear'}
          </button>
        </div>

        <div className="table-wrap" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Date</th>
                <th style={{ width: '25%' }}>Product</th>
                <th style={{ width: '15%' }}>Old</th>
                <th>New</th>
                <th>By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {db.priceHistory.map((history) => (
                <tr key={history.id}>
                  <td className="text-xs">{new Date(history.date).toLocaleDateString('en-GB')}</td>
                  <td>{history.product}</td>
                  <td className="text-muted">Rs {history.old.toFixed(2)}</td>
                  <td className="text-accent fw-bold">Rs {history.new.toFixed(2)}</td>
                  <td className="text-xs">{history.by}</td>
                  <td>
                    <button
                      className="del-btn"
                      type="button"
                      title="Delete log"
                      onClick={async () => {
                        try {
                          await erp.deletePriceHistory(history.id);
                        } catch (error) {
                          alert(error.message || 'Failed to delete log');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {db.priceHistory.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No price changes recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {priceModal && (
        <div className="modal-overlay open" onClick={() => setPriceModal(null)}>
          <div className="modal pricing-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update Price</h3>
              <button className="modal-close" type="button" onClick={() => setPriceModal(null)}>x</button>
            </div>

            <div className="form-group mb-3">
              <label>Product Name</label>
              <input value={priceModal.name} readOnly />
            </div>

            <div className="form-row mb-4">
              <div className="form-group">
                <label>Current Price</label>
                <input value={priceModal.currentPrice} readOnly />
              </div>
              <div className="form-group">
                <label>New Price</label>
                <input
                  type="number"
                  value={priceModal.newPrice}
                  onChange={(event) => setPriceModal({ ...priceModal, newPrice: event.target.value })}
                />
              </div>
            </div>

            <button className="btn btn-primary btn-full" type="button" onClick={handleSavePrice}>Save Price</button>
          </div>
        </div>
      )}

      <ClearConfirmModal
        open={showClearConfirm}
        loading={isClearing}
        title="Clear Price History"
        message="Clear all price history records permanently?"
        confirmLabel="Clear All"
        onConfirm={handleClearLog}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
    </>
  );
}
