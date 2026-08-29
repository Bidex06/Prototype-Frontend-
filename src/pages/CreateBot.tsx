import { useState } from 'react';
import Sidebar from '../components/common/Sidebar';

export default function CreateBot() {
  const [market, setMarket] = useState('Crypto');
  const [pair, setPair] = useState('BTC/USDT');
  const [strategy, setStrategy] = useState('AI Scaler');
  const [lowerPrice, setLowerPrice] = useState('62000');
  const [upperPrice, setUpperPrice] = useState('71000');
  const [grids, setGrids] = useState('50');
  const [investment, setInvestment] = useState('2000');
  const [currency, setCurrency] = useState('USD');
  const [autoReinvest, setAutoReinvest] = useState(false);

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '24px',
          }}
        >
          Create New Trading Bot
        </h1>

        <div
          className="card"
          style={{
            maxWidth: '672px',
          }}
        >
          {/* Step 1 */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                color: '#ffffff',
                fontWeight: '600',
                marginBottom: '12px',
                fontSize: '16px',
              }}
            >
              1. Select Market & Pair
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="input-dark"
              >
                <option value="Crypto">Crypto</option>
                <option value="Forex">Forex</option>
              </select>

              <select
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="input-dark"
              >
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="EUR/USD">EUR/USD</option>
                <option value="ETH/USDT">ETH/USDT</option>
              </select>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label
                className="auth-label"
                style={{ marginBottom: '8px' }}
              >
                Choose Strategy
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {['AI Scaler', 'Trend Follower', 'Grid Trading'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStrategy(s)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${
                        strategy === s ? '#00d4ff' : '#2a2a3a'
                      }`,
                      background:
                        strategy === s
                          ? 'rgba(0, 212, 255, 0.1)'
                          : '#14141e',
                      color:
                        strategy === s ? '#00d4ff' : '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                color: '#ffffff',
                fontWeight: '600',
                marginBottom: '12px',
                fontSize: '16px',
              }}
            >
              2. Grid Parameters
            </h3>

            <div className="grid-2">
              <div>
                <label
                  className="auth-label"
                  style={{ color: '#9ca3af' }}
                >
                  Lower Price
                </label>

                <input
                  type="number"
                  value={lowerPrice}
                  onChange={(e) => setLowerPrice(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label
                  className="auth-label"
                  style={{ color: '#9ca3af' }}
                >
                  Upper Price
                </label>

                <input
                  type="number"
                  value={upperPrice}
                  onChange={(e) => setUpperPrice(e.target.value)}
                  className="input-dark"
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                marginTop: '16px',
              }}
            >
              <div>
                <label
                  className="auth-label"
                  style={{ color: '#9ca3af' }}
                >
                  Number of Grids
                </label>

                <input
                  type="number"
                  min="1"
                  value={grids}
                  onChange={(e) => setGrids(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label
                  className="auth-label"
                  style={{ color: '#9ca3af' }}
                >
                  Grid Step
                </label>

                <input
                  type="text"
                  value="0.5%"
                  readOnly
                  className="input-dark"
                  style={{
                    color: '#6b7280',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              <div>
                <label
                  className="auth-label"
                  style={{ color: '#9ca3af' }}
                >
                  Profit Margin
                </label>

                <input
                  type="text"
                  value="1.2%"
                  readOnly
                  className="input-dark"
                  style={{
                    color: '#6b7280',
                    cursor: 'not-allowed',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                color: '#ffffff',
                fontWeight: '600',
                marginBottom: '12px',
                fontSize: '16px',
              }}
            >
              3. Investment Amount
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '16px',
              }}
            >
              <input
                type="number"
                min="0"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                className="input-dark"
              />

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-dark"
                style={{ width: '120px' }}
              >
                <option value="USD">USD</option>
                <option value="USDT">USDT</option>
              </select>
            </div>

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="checkbox"
                id="autoReinvest"
                checked={autoReinvest}
                onChange={(e) => setAutoReinvest(e.target.checked)}
              />

              <label
                htmlFor="autoReinvest"
                style={{
                  color: '#9ca3af',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Auto-Reinvest Profits
              </label>
            </div>
          </div>

          {/* Create Bot Button */}
          <button
            type="button"
            className="btn-primary"
          >
            Create Bot
          </button>
        </div>
      </main>
    </div>
  );
}