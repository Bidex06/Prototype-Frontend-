import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

export interface BrokerConnectionStatus {
  id: number;
  brokerName: string;
  isConnected: boolean;
  isTestnet: boolean;
  isLiveTradingEnabled: boolean;
  lastConnectedAt?: string | null;
  lastDisconnectedAt?: string | null;
}

interface BrokerConnectionProps {
  onConnect?: (connection: BrokerConnectionStatus) => void;
  onConnectionsChange?: (connections: BrokerConnectionStatus[]) => void;
}

export default function BrokerConnection({
  onConnect,
  onConnectionsChange,
}: BrokerConnectionProps) {
  const [broker, setBroker] = useState<'binance' | 'bybit'>('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [connections, setConnections] = useState<BrokerConnectionStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<number | null>(null);

  const loadConnections = useCallback(async (): Promise<BrokerConnectionStatus[]> => {
    setLoadingConnections(true);
    try {
      const response = await api.get<BrokerConnectionStatus[]>('/broker/connections');
      const data = response.data ?? [];
      setConnections(data);
      onConnectionsChange?.(data);
      return data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load broker connections');
      return [];
    } finally {
      setLoadingConnections(false);
    }
  }, [onConnectionsChange]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleConnect = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error('Please fill in both API Key and Secret');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/broker/connect', {
        broker,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
      });

      if (response.data.success) {
        setApiKey('');
        setApiSecret('');
        toast.success(`${broker.toUpperCase()} connected in TESTNET mode.`);
        const refreshedConnections = await loadConnections();

        const connectionId = response.data.connectionId as number | undefined;
        const connected = refreshedConnections.find((x) => x.id === connectionId);
        if (connected) onConnect?.(connected);
      } else {
        toast.error(response.data.message || 'Connection failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to connect ${broker.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: number, brokerName: string) => {
    setDisconnectingId(connectionId);
    try {
      await api.post('/broker/disconnect', { connectionId });
      toast.success(`${brokerName} disconnected.`);
      await loadConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect broker');
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px', maxWidth: '650px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ color: '#ffffff', margin: 0 }}>Broker Connections</h3>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '5px 0 0' }}>
            New connections are verified in TESTNET mode first.
          </p>
        </div>
        <button
          onClick={loadConnections}
          disabled={loadingConnections}
          style={{ background: 'transparent', border: '1px solid #2a2a3a', color: '#00d4ff', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gap: '8px', marginBottom: '18px' }}>
        {loadingConnections ? (
          <p style={{ color: '#9ca3af', margin: 0 }}>Loading connections...</p>
        ) : connections.length === 0 ? (
          <p style={{ color: '#9ca3af', margin: 0 }}>No broker connections yet.</p>
        ) : (
          connections.map((connection) => (
            <div key={connection.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '8px', padding: '11px 12px' }}>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 600 }}>{connection.brokerName}</div>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '3px' }}>
                  {connection.isConnected ? 'Connected' : 'Disconnected'} · {connection.isTestnet ? 'TESTNET' : 'LIVE'}
                  {connection.isLiveTradingEnabled ? ' · Live trading enabled' : ''}
                </div>
              </div>
              {connection.isConnected && (
                <button
                  onClick={() => handleDisconnect(connection.id, connection.brokerName)}
                  disabled={disconnectingId === connection.id}
                  style={{ background: '#2a2a3a', color: '#ffffff', border: 'none', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', opacity: disconnectingId === connection.id ? 0.6 : 1 }}
                >
                  {disconnectingId === connection.id ? 'Disconnecting...' : 'Disconnect'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button onClick={() => setBroker('binance')} style={{ flex: 1, padding: '10px', background: broker === 'binance' ? '#f7931a' : '#2a2a3a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          Binance
        </button>
        <button onClick={() => setBroker('bybit')} style={{ flex: 1, padding: '10px', background: broker === 'bybit' ? '#00d4aa' : '#2a2a3a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          Bybit
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>API Key</label>
        <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your API key" style={{ width: '100%', padding: '10px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>API Secret</label>
        <input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="Enter your API secret" style={{ width: '100%', padding: '10px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <button onClick={handleConnect} disabled={loading} style={{ width: '100%', padding: '12px', background: broker === 'binance' ? '#f7931a' : '#00d4aa', color: '#ffffff', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
        {loading ? 'Connecting...' : `Connect ${broker.charAt(0).toUpperCase() + broker.slice(1)}`}
      </button>
    </div>
  );
}
