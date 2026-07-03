import React from 'react';
import './PriceBoard.css';

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB').format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

export default function PriceBoard({ db }) {
  const now = new Date();

  return (
    <div className="price-board">
      <div className="price-board-shell">
        <div className="price-board-hero">
          <div className="price-board-copy">
            <div className="price-board-kicker">Sri Nikil Tradings</div>
            <h2 className="price-board-title">Today's Price Board</h2>
          </div>

          <div className="price-board-update-card">
            <div className="price-board-update-label">Last Updated</div>
            <div className="price-board-update-date">{formatDate(now)}</div>
            <div className="price-board-update-time">{formatTime(now)}</div>
          </div>
        </div>

        <div className="price-items price-board-grid">
          {db.products.map((product, index) => {
            const history = db.priceHistory.find(entry => entry.product === product.name);
            const previousPrice = history ? history.old : product.price;

            return (
              <div key={product.id} className="price-card">
                <div className="price-card-top">
                  <div className="price-card-index">{String(index + 1).padStart(2, '0')}</div>
                </div>

                <div className="price-card-name">{product.name}</div>

                <div className="price-card-price-wrap">
                  <div className="price-card-price">Rs.{product.price.toFixed(0)}</div>
                  {product.price !== previousPrice ? (
                    <div className="price-card-old-price">Rs.{previousPrice.toFixed(0)}</div>
                  ) : null}
                </div>

                <div className="price-card-bottom">
                  <div className="price-card-unit">{product.unit.toUpperCase()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
