import React from 'react';

export default function ClearConfirmModal({
  open,
  title = 'Confirm Clear',
  message = 'Are you sure you want to clear all records?',
  confirmLabel = 'Clear All',
  loading = false,
  onConfirm,
  onClose
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()} style={{ width: '420px', minWidth: '320px', padding: '28px 32px' }}>
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <h3 className="modal-title" style={{ fontSize: '1.25rem' }}>{title}</h3>
          <button className="modal-close" type="button" onClick={onClose}>✕</button>
        </div>
        <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>{message}</p>
        <div className="flex gap-3 justify-end mt-2">
          <button className="btn btn-secondary" type="button" onClick={onClose} disabled={loading} style={{ padding: '10px 20px' }}>Cancel</button>
          <button className="btn btn-danger" type="button" onClick={onConfirm} disabled={loading} style={{ padding: '10px 20px' }}>
            {loading ? 'Clearing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
