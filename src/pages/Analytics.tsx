import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

export default function Analytics() {
  const { botId } = useParams();

  const botData = {
    name: botId || 'EUR/USD Trend Bot',
    status: 'Running',
    activeDays: 12,
    netProfit: 750.21,
    winRate: 72,
    totalTrades: 58,
    trades: [
      { pair: 'EUR/USD', side: 'SELL', entry: 1.0854, exit: 1.0832, pnl: 22.00, time: '14:02' },
      { pair: 'BTC/USDT', side: 'BUY', entry: 67500, exit: null, pnl: null, time: '13:45' },
      { pair: 'ETH/USDT', side: 'BUY', entry: 3450, exit: 3480, pnl: 30.00, time: '12:30' },
    ]
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '24px', marginLeft: '240px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
            Analytics: {botData.name}
          </h1>
          <Link
            to="/"
            style={{
              padding: '8px 16px',
              background: '#00d4ff',
              color: '#0a0a0f',
              fontWeight: '600',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
        <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
          Bot Status: <span style={{ color: '#00d4aa' }}>{botData.status}</span> • Active since {botData.activeDays} Days
        </p>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>Net Profit</p>
            <p style={{ color: '#00d4aa', fontSize: '24px', fontWeight: '700' }}>+${botData.netProfit.toFixed(2)}</p>
          </div>
          <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>Win Rate</p>
            <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>{botData.winRate}%</p>
          </div>
          <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>Total Trades</p>
            <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700' }}>{botData.totalTrades}</p>
          </div>
          <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>Avg Profit</p>
            <p style={{ color: '#00d4aa', fontSize: '24px', fontWeight: '700' }}>+$12.93</p>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div style={{
          background: '#14141e',
          border: '1px solid #2a2a3a',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '16px' }}>Performance Chart</h3>
          <div style={{
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #2a2a3a',
            borderRadius: '8px',
            color: '#9ca3af'
          }}>
            📊 Chart will load here
          </div>
        </div>

        {/* Trade History */}
        <div style={{
          background: '#14141e',
          border: '1px solid #2a2a3a',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '16px' }}>Recent Trade History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ textAlign: 'left', color: '#9ca3af', fontSize: '14px' }}>
                <tr>
                  <th style={{ paddingBottom: '8px' }}>Pair</th>
                  <th style={{ paddingBottom: '8px' }}>Side</th>
                  <th style={{ paddingBottom: '8px' }}>Entry</th>
                  <th style={{ paddingBottom: '8px' }}>Exit</th>
                  <th style={{ paddingBottom: '8px' }}>P/L</th>
                  <th style={{ paddingBottom: '8px' }}>Time</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px' }}>
                {botData.trades.map((trade, index) => (
                  <tr key={index} style={{ borderTop: '1px solid #2a2a3a' }}>
                    <td style={{ padding: '12px 0', color: '#ffffff' }}>{trade.pair}</td>
                    <td style={{ padding: '12px 0', color: trade.side === 'SELL' ? '#ff4757' : '#00d4aa' }}>
                      {trade.side}
                    </td>
                    <td style={{ padding: '12px 0', color: '#ffffff' }}>{trade.entry}</td>
                    <td style={{ padding: '12px 0', color: trade.exit ? '#ffffff' : '#9ca3af' }}>
                      {trade.exit || 'Open'}
                    </td>
                    <td style={{ padding: '12px 0', color: trade.pnl ? '#00d4aa' : '#9ca3af' }}>
                      {trade.pnl ? `+$${trade.pnl.toFixed(2)}` : '---'}
                    </td>
                    <td style={{ padding: '12px 0', color: '#9ca3af' }}>{trade.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}