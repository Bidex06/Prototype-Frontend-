import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useSignalR } from '../../hooks/useSignalR';

interface Signal {
  id?: number;
  symbol?: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price?: number;
  pattern?: string;
  rsi?: number;
  trend?: string;
  support?: number;
  resistance?: number;
  reason?: string;
  generatedAt?: string;
  wasExecuted?: boolean;
  // Client-only: a live signal that never showed up in the database.
  unsaved?: boolean;
}

const STALE_AFTER_MS = 2 * 60 * 60 * 1000;

// The API sends UTC timestamps. Without a "Z" the browser would read them as
// local time and the age would be off by the timezone offset.
function parseUtc(value?: string): number | null {
  if (!value) return null;
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  const time = new Date(hasZone ? value : `${value}Z`).getTime();
  return Number.isNaN(time) ? null : time;
}

function formatAge(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function executionBadge(signal: Signal): { text: string; color: string } | null {
  if (signal.action === 'HOLD') return null;
  if (signal.id === 0 && !signal.unsaved) {
    return { text: 'New signal, checking for an order...', color: '#9ca3af' };
  }
  if (signal.wasExecuted) return { text: 'Order placed', color: '#10b981' };
  return { text: 'No order placed', color: '#f59e0b' };
}

export default function SignalDisplay({ symbol = 'BTCUSDT' }: { symbol?: string }) {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const { connection, isConnected } = useSignalR();
  const recheckTimer = useRef<number | null>(null);

  const fetchSignal = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/trading/signal', { params: { symbol } });
      setSignal(response.data ? (response.data as Signal) : null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch signal');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // After a live signal arrives, look it up in the database a bit later.
  // If it was saved we get the real "order placed" flag; if not, no order was placed.
  const recheck = useCallback(
    async (live: Signal) => {
      try {
        const response = await api.get('/trading/signal', { params: { symbol } });
        const saved = response.data ? (response.data as Signal) : null;
        const liveTime = parseUtc(live.generatedAt);
        const savedTime = parseUtc(saved?.generatedAt);
        if (saved && (liveTime === null || (savedTime !== null && savedTime >= liveTime))) {
          setSignal(saved);
        } else {
          setSignal({ ...live, unsaved: true });
        }
      } catch {
        // keep showing the live signal
      }
    },
    [symbol]
  );

  useEffect(() => {
    fetchSignal();
  }, [fetchSignal]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!connection) return;

    const handleNewSignal = (incoming: Signal) => {
      if (incoming.symbol && incoming.symbol.toUpperCase() !== symbol.toUpperCase()) return;
      setSignal(incoming);
      if (recheckTimer.current) window.clearTimeout(recheckTimer.current);
      recheckTimer.current = window.setTimeout(() => recheck(incoming), 12000);
    };

    connection.on('NewSignal', handleNewSignal);
    return () => {
      connection.off('NewSignal', handleNewSignal);
      if (recheckTimer.current) window.clearTimeout(recheckTimer.current);
    };
  }, [connection, symbol, recheck]);

  const cardStyle = {
    background: '#14141e',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '24px'
  } as const;

  if (loading && !signal) {
    return (
      <div style={cardStyle}>
        <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>Last signal</h3>
        <p style={{ color: '#9ca3af', marginTop: '12px' }}>Loading...</p>
      </div>
    );
  }

  if (!signal) {
    return (
      <div style={cardStyle}>
        <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>Last signal</h3>
        <p style={{ color: '#9ca3af', marginTop: '12px' }}>
          No signal saved yet for {symbol}. One appears once a running bot generates a BUY or SELL.
        </p>
      </div>
    );
  }

  const generatedMs = parseUtc(signal.generatedAt);
  const age = generatedMs === null ? null : now - generatedMs;
  const isStale = age !== null && age > STALE_AFTER_MS;
  const badge = executionBadge(signal);
  const actionColor =
    signal.action === 'BUY' ? '#10b981' : signal.action === 'SELL' ? '#ef4444' : '#f59e0b';

  const rows: Array<[string, string | undefined]> = [
    ['Price at signal', typeof signal.price === 'number' ? `$${signal.price.toLocaleString()}` : undefined],
    ['Pattern', signal.pattern],
    ['RSI', typeof signal.rsi === 'number' ? signal.rsi.toFixed(1) : undefined],
    ['Trend', signal.trend],
    ['Support', typeof signal.support === 'number' ? `$${signal.support.toLocaleString()}` : undefined],
    ['Resistance', typeof signal.resistance === 'number' ? `$${signal.resistance.toLocaleString()}` : undefined]
  ];

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>Last signal</h3>
          <span
            title={isConnected ? 'Live updates connected' : 'Live updates disconnected'}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: isConnected ? '#10b981' : '#ef4444'
            }}
          />
        </div>
        <button
          onClick={fetchSignal}
          style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer' }}
          aria-label="Refresh signal"
        >
          ⟳
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: '12px'
        }}
      >
        <span style={{ fontSize: '40px', fontWeight: 700, color: actionColor }}>{signal.action}</span>
        <span style={{ color: '#9ca3af' }}>Confidence: {Math.round(signal.confidence)}%</span>
      </div>

      <p style={{ marginTop: '8px', fontSize: '13px', color: isStale ? '#f59e0b' : '#9ca3af' }}>
        {signal.symbol ?? symbol}
        {age !== null && ` · generated ${formatAge(age)}`}
        {isStale && ' · may be outdated'}
      </p>

      {badge && (
        <p style={{ marginTop: '6px', fontSize: '13px', fontWeight: 600, color: badge.color }}>
          {badge.text}
        </p>
      )}

      <div style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
        {rows.map(
          ([label, value]) =>
            value !== undefined && (
              <div
                key={label}
                style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff' }}
              >
                <span style={{ color: '#9ca3af' }}>{label}:</span>
                <span>{value}</span>
              </div>
            )
        )}
      </div>

      {signal.reason && (
        <p
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #2a2a3a',
            color: '#9ca3af',
            fontSize: '13px'
          }}
        >
          {signal.reason}
        </p>
      )}
    </div>
  );
}
