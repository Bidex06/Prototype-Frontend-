import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useSignalR } from '../../hooks/useSignalR';

interface Signal {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  pattern?: string;
  rsi?: number;
  trend?: string;
  support?: number;
  resistance?: number;
  reason?: string;
}

export default function SignalDisplay({ symbol = 'BTCUSDT' }: { symbol?: string }) {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const { connection, isConnected } = useSignalR();

  const fetchSignal = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trading/signal', {
        params: { symbol }
      });
      setSignal(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch signal');
    } finally {
      setLoading(false);
    }
  };

  // Listen for real-time signals
  useEffect(() => {
    if (!connection) return;

    const handleNewSignal = (newSignal: Signal) => {
      setSignal(newSignal);
      console.log('📈 New signal received via SignalR:', newSignal);
    };

    connection.on('NewSignal', handleNewSignal);

    return () => {
      connection.off('NewSignal', handleNewSignal);
    };
  }, [connection]);

  // Initial fetch
  useEffect(() => {
    fetchSignal();
  }, [symbol]);

  if (loading) {
    return <div style={{ color: '#9ca3af' }}>Loading signal...</div>;
  }

  if (!signal) {
    return <div style={{ color: '#9ca3af' }}>No signal available</div>;
  }

  const actionColor =
    signal.action === 'BUY'
      ? '#00d4aa'
      : signal.action === 'SELL'
        ? '#ff4757'
        : '#fbbf24';

  return (
    <div
      style={{
        background: '#14141e',
        border: '1px solid #2a2a3a',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '350px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}
      >
        <h3 style={{ color: '#ffffff', margin: 0 }}>
          Signal {isConnected ? '🟢' : '🔴'}
        </h3>

        <button
          onClick={fetchSignal}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#00d4ff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ⟳
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}
      >
        <span
          style={{
            color: actionColor,
            fontSize: '28px',
            fontWeight: '700'
          }}
        >
          {signal.action}
        </span>

        <span style={{ color: '#9ca3af', fontSize: '14px' }}>
          Confidence: {signal.confidence}%
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '14px'
        }}
      >
        {signal.pattern && (
          <>
            <span style={{ color: '#9ca3af' }}>Pattern:</span>
            <span style={{ color: '#ffffff' }}>{signal.pattern}</span>
          </>
        )}

        {signal.rsi && (
          <>
            <span style={{ color: '#9ca3af' }}>RSI:</span>
            <span style={{ color: '#ffffff' }}>{signal.rsi}</span>
          </>
        )}

        {signal.trend && (
          <>
            <span style={{ color: '#9ca3af' }}>Trend:</span>
            <span style={{ color: '#ffffff' }}>{signal.trend}</span>
          </>
        )}

        {signal.support && (
          <>
            <span style={{ color: '#9ca3af' }}>Support:</span>
            <span style={{ color: '#ffffff' }}>
              ${signal.support.toLocaleString()}
            </span>
          </>
        )}

        {signal.resistance && (
          <>
            <span style={{ color: '#9ca3af' }}>Resistance:</span>
            <span style={{ color: '#ffffff' }}>
              ${signal.resistance.toLocaleString()}
            </span>
          </>
        )}
      </div>

      {signal.reason && (
        <p
          style={{
            color: '#9ca3af',
            fontSize: '13px',
            marginTop: '12px',
            borderTop: '1px solid #2a2a3a',
            paddingTop: '12px'
          }}
        >
          {signal.reason}
        </p>
      )}
    </div>
  );
}