import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import PortfolioCard from '../components/dashboard/PortfolioCard';
import BotCard from '../components/dashboard/BotCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';

// 👇 IMPORT THE NEW COMPONENTS
import BalanceDisplay from '../components/trading/BalanceDisplay';
import SignalDisplay from '../components/trading/SignalDisplay';
import BrokerConnection from '../components/trading/BrokerConnection';
import TradeExecution from '../components/trading/TradeExecution';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '24px', marginLeft: '240px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Dashboard</h1>
            <p style={{ color: '#9ca3af' }}>Welcome back, {user?.firstName || 'Trader'}!</p>
          </div>
          <Link
            to="/create-bot"
            style={{
              padding: '10px 20px',
              background: '#00d4ff',
              color: '#0a0a0f',
              fontWeight: '600',
              borderRadius: '8px',
              textDecoration: 'none'
            }}
          >
            + New Bot
          </Link>
        </div>

        {/* Portfolio Card */}
        <PortfolioCard value={12450.75} change={3.2} />

        {/* Performance Chart */}
        <div style={{ marginTop: '24px' }}>
          <PerformanceChart />
        </div>

        {/* Bot Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
          marginTop: '24px'
        }}>
          <BotCard name="Bot #1" pair="BTC/USDT" strategy="AI Scaler" status="Running" profit={8.4} profitAmount={4200} />
          <BotCard name="Bot #2" pair="EUR/USD" strategy="Trend Follower" status="Paused" profit={2.1} profitAmount={750} />
          <BotCard name="Bot #3" pair="ETH/USDT" strategy="Grid Bot" status="Running" profit={5.1} profitAmount={1900} />
        </div>

        {/* ===== NEW TRADING COMPONENTS ===== */}
        {/* Row 1: Balance + Signal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginTop: '32px'
        }}>
          <BalanceDisplay />
          <SignalDisplay />
        </div>

        {/* Row 2: Broker Connection + Trade Execution */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginTop: '20px'
        }}>
          <BrokerConnection />
          <TradeExecution />
        </div>
      </main>
    </div>
  );
}