import React from 'react';
import './PagePlaceholder.css';

export default function PagePlaceholder({ title }) {
  return (
    <div className="card page-placeholder">
      <div className="empty-state page-placeholder-state">
        <div className="icon page-placeholder-icon">{'\u{1F6A7}'}</div>
        <div className="page-placeholder-title">{title} Page</div>
        <div className="page-placeholder-copy">This section is currently under development.</div>
        <div className="mt-4">
          <button className="btn btn-secondary btn-sm">Refresh Status</button>
        </div>
      </div>
    </div>
  );
}
