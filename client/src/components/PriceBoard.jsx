import React, { useEffect } from 'react';
const priceBoardStyles = ".price-board {\n  background: linear-gradient(135deg, #9a4d1f 0%, #7f3b14 56%, #c26b31 100%);\n  border-radius: 34px;\n  padding: 18px;\n  color: #fff6ea;\n  \n  /* Force Light Theme CSS Variables exclusively within this component tree */\n  --bg: #f0f2f5; \n  --bg2: #ffffff; \n  --bg3: #f8f9fb; \n  --bg4: #eef0f3;\n  --border: #e2e5ea; \n  --border2: #ced2d9;\n  --accent: #f97316; \n  --accent2: #ea6a00; \n  --accent3: #fff3e0;\n  --green: #16a34a; \n  --red: #dc2626; \n  --blue: #2563eb; \n  --purple: #7c3aed;\n  --text: #1a1f2e; \n  --text2: #5a6278; \n  --text3: #9ca3af;\n  --card: #ffffff;\n  --surface: #f8f9fb;\n  --surface-strong: #ffffff;\n  --input-bg: #fff;\n  --danger-soft: #fee2e2;\n  --success-soft: #dcfce7;\n}\n\n.price-board-shell {\n  border-radius: 30px;\n  border: 1px solid rgba(255, 222, 191, 0.14);\n  background: linear-gradient(180deg, rgba(98, 42, 12, 0.22), rgba(92, 39, 12, 0.08));\n  padding: 24px;\n  cursor: pointer;\n}\n\n.price-board-pills {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n  margin-bottom: 22px;\n}\n\n.price-board-pill {\n  display: inline-flex;\n  align-items: center;\n  border-radius: 999px;\n  padding: 12px 20px;\n  background: rgba(255, 212, 176, 0.12);\n  border: 1px solid rgba(255, 214, 182, 0.12);\n  color: #ffe7ce;\n  font-size: 0.88rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n}\n\n.price-board-hero {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) 430px;\n  gap: 24px;\n  align-items: end;\n  margin-bottom: 24px;\n}\n\n.price-board-copy {\n  padding-top: 6px;\n}\n\n.price-board-kicker {\n  color: #f9d9b2;\n  font-size: 0.88rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.18em;\n  margin-bottom: 10px;\n}\n\n.price-board-title {\n  font-size: 4rem;\n  margin: 0;\n  color: #fff3de;\n  line-height: 0.98;\n  letter-spacing: -0.04em;\n}\n\n.price-board-subtitle {\n  color: rgba(255, 243, 222, 0.72);\n  font-size: 1rem;\n  margin-top: 18px;\n  max-width: 760px;\n}\n\n.price-board-update-card {\n  background: linear-gradient(180deg, #fffaf3 0%, #fff5e9 100%);\n  color: #8f4317;\n  border-radius: 26px;\n  height: 163px;\n  padding: 28px 30px;\n  box-shadow: inset 0 0 0 1px rgba(188, 106, 47, 0.08);\n}\n\n.price-board-update-label {\n  color: #c08a56;\n  font-size: 0.92rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.16em;\n}\n\n.price-board-update-date {\n  margin-top: 14px;\n  font-size: 3rem;\n  line-height: 1;\n  font-weight: 800;\n  letter-spacing: -0.05em;\n}\n\n.price-board-update-time {\n  margin-top: 12px;\n  font-size: 1.2rem;\n  color: #9f6a39;\n}\n\n.price-items {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 12px;\n  margin-top: 16px;\n}\n\n.price-board-grid {\n  grid-template-columns: repeat(5, minmax(0, 1fr));\n  gap: 12px;\n}\n\n.price-card {\n  background: linear-gradient(180deg, #fffaf2 0%, #fff1dc 100%);\n  border-radius: 28px;\n  min-height: 185px;\n  padding: 14px 16px;\n  color: #7f380d;\n  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.35), 0 14px 32px rgba(69, 28, 5, 0.2);\n  position: relative;\n  overflow: hidden;\n}\n\n.price-card::before {\n  content: '';\n  position: absolute;\n  inset: 0;\n  background: radial-gradient(circle at top left, rgba(255,255,255,0.7), transparent 34%);\n  pointer-events: none;\n}\n\n.price-card-top {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 12px;\n}\n\n.price-card-index,\n.price-card-status {\n  position: relative;\n  z-index: 1;\n  padding: 7px 11px;\n  border-radius: 14px;\n  background: rgba(255, 216, 168, 0.36);\n  font-size: 0.75rem;\n  font-weight: 800;\n  letter-spacing: 0.06em;\n}\n\n.price-card-status {\n  background: rgba(255, 236, 209, 0.72);\n  color: #b0642f;\n}\n\n.price-card-status.up { color: #b45309; }\n.price-card-status.down { color: #b91c1c; }\n.price-card-status.steady { color: #b0642f; }\n\n.price-card-name {\n  position: relative;\n  z-index: 1;\n  font-size: 0.95rem;\n  line-height: 1.25;\n  font-weight: 700;\n  max-width: 92%;\n  margin-bottom: 14px;\n}\n\n.price-card-price-wrap {\n  position: relative;\n  z-index: 1;\n  margin-bottom: 10px;\n}\n\n.price-card-price {\n  font-size: 1.9rem;\n  line-height: 1;\n  font-weight: 800;\n  color: #b1440c;\n  letter-spacing: -0.05em;\n}\n\n.price-card-old-price {\n  margin-top: 4px;\n  font-size: 0.72rem;\n  color: rgba(127, 56, 13, 0.48);\n  text-decoration: line-through;\n}\n\n.price-card-bottom {\n  position: relative;\n  z-index: 1;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-top: auto;\n}\n\n.price-card-unit {\n  font-size: 0.8rem;\n  font-weight: 700;\n  letter-spacing: 0.16em;\n  color: rgba(127, 56, 13, 0.7);\n}\n\n.price-card-dot {\n  font-size: 1.2rem;\n  line-height: 1;\n  color: #8b3d12;\n}\n\n@media (max-width: 1400px) {\n  .price-board-grid {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n}\n\n@media (max-width: 1100px) {\n  .price-board-grid {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n}\n\n@media (max-width: 768px) {\n  .price-board {\n    padding: 12px;\n    border-radius: 22px;\n  }\n\n  .price-board-shell {\n    padding: 18px;\n  }\n\n  .price-board-hero {\n    grid-template-columns: 1fr;\n  }\n\n  .price-board-title {\n    font-size: 2.7rem;\n  }\n\n  .price-board-grid {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  .price-card {\n    min-height: 200px;\n    padding: 18px;\n  }\n\n  .price-card-name {\n    font-size: 1.2rem;\n  }\n\n  .price-card-price {\n    font-size: 2.4rem;\n  }\n}\n\n@media (max-width: 560px) {\n  .price-board,\n  .price-board-shell,\n  .price-board-hero,\n  .price-board-copy,\n  .price-board-update-card,\n  .price-card {\n    width: 100%;\n    min-width: 0;\n    max-width: 100%;\n  }\n\n  .price-board {\n    padding: 10px;\n    border-radius: 18px;\n    overflow: hidden;\n  }\n\n  .price-board-shell {\n    padding: 16px;\n    border-radius: 22px;\n    overflow: hidden;\n  }\n\n  .price-board-kicker {\n    font-size: 0.72rem;\n    letter-spacing: 0.16em;\n  }\n\n  .price-board-title {\n    font-size: 2.25rem;\n    letter-spacing: 0;\n  }\n\n  .price-board-update-card {\n    height: auto;\n    min-height: 132px;\n    padding: 22px;\n    border-radius: 22px;\n  }\n\n  .price-board-update-label {\n    font-size: 0.78rem;\n    letter-spacing: 0.14em;\n  }\n\n  .price-board-update-date {\n    font-size: 2.12rem;\n    letter-spacing: 0;\n  }\n\n  .price-board-update-time {\n    font-size: 1rem;\n  }\n\n  .price-board-grid {\n    grid-template-columns: 1fr;\n  }\n}\n\n@media (max-width: 340px) {\n  .price-board {\n    padding: 8px;\n    border-radius: 16px;\n  }\n\n  .price-board-shell {\n    padding: 14px;\n    border-radius: 20px;\n  }\n\n  .price-board-title {\n    font-size: 2rem;\n  }\n\n  .price-board-update-card {\n    padding: 18px;\n  }\n\n  .price-board-update-date {\n    font-size: 1.88rem;\n  }\n\n  .price-card {\n    min-height: 170px;\n    padding: 16px;\n    border-radius: 22px;\n  }\n\n  .price-card-name {\n    font-size: 1rem;\n  }\n\n  .price-card-price {\n    font-size: 2rem;\n    letter-spacing: 0;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-priceboard-styles")) {
  const style = document.createElement("style");
  style.id = "combined-priceboard-styles";
  style.textContent = priceBoardStyles;
  document.head.appendChild(style);
}

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

function PriceBoard({ db, fetchPriceHistory }) {
  const now = new Date();

  useEffect(() => {
    if (fetchPriceHistory) {
      fetchPriceHistory().catch(() => {});
    }
  }, [fetchPriceHistory]);

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

export default PriceBoard;
