import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import Sidebar from '../components/common/Sidebar';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import { api } from '../services/api';

interface BotDetail {
  id: number;
  name: string;
  strategy: string;
  timeframe: string;
  brokerName?: string | null;
  useFutures: boolean;
  isEnabled: boolean;
  isRunning: boolean;
  trackedSymbols: { symbol: string; exchange: string }[];
}

interface Trade {
  id: number;
  symbol: string;
  direction: string;
  entryPrice: number;
  exitPrice?: number | null;
  quantity: number;
  entryTime: string;
  exitTime?: string | null;
  profitLoss?: number | null;
  profitLossPercentage?: number | null;
  status: string;
  brokerName?: string | null;
}

interface Position {
  id: number;
  symbol: string;
  direction: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
  status: string;
}

export default function Analytics() {
  const { botId } = useParams<{ botId: string }>();

  const [bot, setBot] = useState<BotDetail | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setNotFound(false);

      const results = await Promise.allSettled([
        api.get<BotDetail>(`/bot/${botId}`),
        api.get<Trade[]>('/trading/trade-history', { params: { limit: 200 } }),
        api.get<Position[]>('/trading/positions')
      ]);

      if (!mounted) return;

      const botResult = results[0];
      if (botResult.status === 'fulfilled') {
        setBot(botResult.value.data);
      } else if (botResult.reason?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(botResult.reason?.response?.data?.message || 'Failed to load bot.');
      }

      const tradesResult = results[1];
      if (tradesResult.status === 'fulfilled') {
        setTrades(Array.isArray(tradesResult.value.data) ? tradesResult.value.data : []);
      } else {
        toast.error(tradesResult.reason?.response?.data?.message || 'Failed to load trade history.');
      }

      const positionsResult = results[2];
      if (positionsResult.status === 'fulfilled') {
        setPositions(Array.isArray(positionsResult.value.data) ? positionsResult.value.data : []);
      } else {
        toast.error(positionsResult.reason?.response?.data?.message || 'Failed to load open positions.');
      }

      setLoading(false);
    };

    if (botId) load();

    return () => {
      mounted = false;
    };
  }, [botId]);

  // Trades/positions carry no botId at all on the backend (checked the
  // Trade and Position entities directly - neither has one). This is an
  // approximation: symbol + broker match for trades, symbol-only match
  // for positions (the position response doesn't include a broker field).
  // If you ever run two bots on the same symbol/broker, trades from both
  // will show up here for each bot's page. The real fix is a BotId
  // column on Trade/Position, set at execution time - flagging that as
  // a backend follow-up rather than pretending this is exact.
  const trackedSymbols = useMemo(
    () => new Set((bot?.trackedSymbols ?? []).map((s) => s.symbol)),
    [bot]
  );

  const botTrades = useMemo(() => {
    if (!bot) return [];
    return trades.filter(
      (t) =>
        trackedSymbols.has(t.symbol) &&
        (!t.brokerName || !bot.brokerName || t.brokerName.toLowerCase() === bot.brokerName.toLowerCase())
    );
  }, [trades, trackedSymbols, bot]);

  const botPositions = useMemo(
    () => positions.filter((p) => trackedSymbols.has(p.symbol)),
    [positions, trackedSymbols]
  );

  const closedTrades = botTrades.filter(
    (t) => t.status.toLowerCase() === 'closed' && t.profitLoss !== null && t.profitLoss !== undefined
  );
  const winningTrades = closedTrades.filter((t) => Number(t.profitLoss) > 0);
  const losingTrades = closedTrades.filter((t) => Number(t.profitLoss) < 0);
  const netPnl = closedTrades.reduce((sum, t) => sum + Number(t.profitLoss ?? 0), 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  const avgPnl = closedTrades.length > 0 ? netPnl / closedTrades.length : 0;

  const recentTrades = [...botTrades]
    .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
    .slice(0, 20);

  const statCardStyle: React.CSSProperties = {
    background: '#14141e',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '16px'
  };

  if (notFound) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '24px', marginLeft: '240px', color: '#9ca3af' }}>
          <p>Bot not found, or it doesn't belong to your account.</p>
          <Link to="/" style={{ color: '#00d4ff' }}>Back to Dashboard</Link>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '24px', marginLeft: '240px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            {loading ? 'Loading...' : bot?.name ?? 'Analytics'}
          </h1>
          {bot && (
            <p style={{ color: '#9ca3af' }}>
              {bot.strategy} · {bot.timeframe} · {bot.brokerName ?? 'No broker'}
              {' · '}{bot.useFutures ? 'Futures' : 'Spot'}
              {' · '}{!bot.isEnabled ? 'Disabled' : bot.isRunning ? 'Running' : 'Stopped'}
            </p>
          )}
        </div>

        <div
          style={{
            background: 'rgba(0, 212, 255, 0.08)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#9ca3af',
            fontSize: '13px',
            marginBottom: '20px'
          }}
        >
          These numbers are matched to this bot by symbol + broker, since trades aren't directly
          linked to a specific bot on the backend yet. If you run more than one bot on the same
          symbol and broker, their trades will overlap here.
        </div>

        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading analytics...</p>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '14px',
                marginBottom: '20px'
              }}
            >
              <div style={statCardStyle}>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>Net P&L</p>
                <p style={{ color: netPnl >= 0 ? '#10b981' : '#ef4444', fontSize: '22px', fontWeight: 700 }}>
                  {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
                </p>
              </div>
              <div style={statCardStyle}>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>Win Rate</p>
                <p style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700 }}>
                  {closedTrades.length > 0 ? `${winRate.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div style={statCardStyle}>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>Total Trades</p>
                <p style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700 }}>{botTrades.length}</p>
                <p style={{ color: '#6b7280', fontSize: '12px' }}>
                  {winningTrades.length}W / {losingTrades.length}L
                </p>
              </div>
              <div style={statCardStyle}>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>Avg P&L / Trade</p>
                <p style={{ color: avgPnl >= 0 ? '#10b981' : '#ef4444', fontSize: '22px', fontWeight: 700 }}>
                  {closedTrades.length > 0 ? `${avgPnl >= 0 ? '+' : ''}$${avgPnl.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div style={statCardStyle}>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>Open Positions</p>
                <p style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700 }}>{botPositions.length}</p>
              </div>
            </div>

            <PerformanceChart trades={botTrades} />

            {botPositions.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ color: '#ffffff', fontWeight: 600, marginBottom: '10px' }}>Open Positions</h3>
                <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', overflow: 'hidden' }}>
                  {botPositions.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: '1px solid #2a2a3a'
                      }}
                    >
                      <span style={{ color: '#ffffff' }}>{p.symbol} · {p.direction}</span>
                      <span style={{ color: p.unrealizedPnL >= 0 ? '#10b981' : '#ef4444' }}>
                        {p.unrealizedPnL >= 0 ? '+' : ''}${p.unrealizedPnL.toFixed(2)}
                        {' '}({p.unrealizedPnLPercentage.toFixed(2)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#ffffff', fontWeight: 600, marginBottom: '10px' }}>Recent Trade History</h3>
              {recentTrades.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No trades recorded for this bot yet.</p>
              ) : (
                <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', overflow: 'hidden' }}>
                  {recentTrades.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: '1px solid #2a2a3a',
                        fontSize: '14px'
                      }}
                    >
                      <span style={{ color: '#9ca3af' }}>
                        {new Date(t.entryTime).toLocaleDateString()} · {t.symbol} · {t.direction} · {t.status}
                      </span>
                      <span style={{ color: (t.profitLoss ?? 0) >= 0 ? '#10b981' : '#ef4444' }}>
                        {t.profitLoss !== null && t.profitLoss !== undefined
                          ? `${t.profitLoss >= 0 ? '+' : ''}$${Number(t.profitLoss).toFixed(2)}`
                          : 'Open'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
