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
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" type="button" onClick={onClose}>x</button>
        </div>
        <p className="text-sm mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button className="btn btn-danger" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Clearing...' : confirmLabel}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
