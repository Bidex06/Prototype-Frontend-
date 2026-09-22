import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useSignalR } from '../../hooks/useSignalR';

export default function BalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const { connection, isConnected } = useSignalR();

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trading/balance', {
        params: { currency: 'USDT', useFutures: false, ...(connectionId ? { connectionId } : {}) },
      });
      setBalance(response.data.balance);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  // 👇 Listen for real‑time balance updates
  useEffect(() => {
    if (connection && isConnected) {
      connection.on('BalanceUpdated', (newBalance: number) => {
        setBalance(newBalance);
        console.log('💰 Balance updated via SignalR:', newBalance);
      });
    }
  }, [connection, isConnected]);

  // Load the connected broker so balance requests can target a specific connection.
  useEffect(() => {
    const loadConnection = async () => {
      try {
        const response = await api.get('/broker/connections');
        const connected = (response.data ?? []).filter((x: any) => x.isConnected);
        setConnectionId(connected[0]?.id ?? null);
      } catch {
        setConnectionId(null);
      }
    };
    loadConnection();
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [connectionId]);

  return (
    <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px', maxWidth: '300px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
          Balance {isConnected ? '🟢' : '🔴'}
        </p>
        <button
          onClick={fetchBalance}
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

      <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: 0 }}>
        {loading ? '...' : `$${balance?.toFixed(2) || '0.00'}`}
      </h2>
    </div>
  );
}