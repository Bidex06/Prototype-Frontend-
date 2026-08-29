import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

interface BrokerConnectionProps {
  onConnect?: () => void;
}

export default function BrokerConnection({ onConnect }: BrokerConnectionProps) {
  const [broker, setBroker] = useState<'binance' | 'bybit'>('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) {
      toast.error('Please fill in both API Key and Secret');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/broker/connect', {
        broker,
        apiKey,
        apiSecret
      });

      if (response.data.success) {
        toast.success(`${broker.toUpperCase()} connected successfully!`);
        onConnect?.();
      } else {
        toast.error(response.data.message || 'Connection failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to connect ${broker.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px', maxWidth: '500px' }}>
      <h3 style={{ color: '#ffffff', marginBottom: '16px' }}>Connect Broker</h3>

      {/* Broker Selection Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => setBroker('binance')}
          style={{
            flex: 1,
            padding: '10px',
            background: broker === 'binance' ? '#f7931a' : '#2a2a3a',
            color: broker === 'binance' ? '#ffffff' : '#9ca3af',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Binance
        </button>
        <button
          onClick={() => setBroker('bybit')}
          style={{
            flex: 1,
            padding: '10px',
            background: broker === 'bybit' ? '#00d4aa' : '#2a2a3a',
            color: broker === 'bybit' ? '#ffffff' : '#9ca3af',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Bybit
        </button>
      </div>

      {/* API Key Input */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          style={{
            width: '100%',
            padding: '10px',
            background: '#0a0a0f',
            border: '1px solid #2a2a3a',
            borderRadius: '8px',
            color: '#ffffff',
            outline: 'none'
          }}
        />
      </div>

      {/* API Secret Input */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>API Secret</label>
        <input
          type="password"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          placeholder="Enter your API secret"
          style={{
            width: '100%',
            padding: '10px',
            background: '#0a0a0f',
            border: '1px solid #2a2a3a',
            borderRadius: '8px',
            color: '#ffffff',
            outline: 'none'
          }}
        />
      </div>

      {/* Connect Button — THIS IS THE FIXED LINE */}
      <button
        onClick={handleConnect}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: broker === 'binance' ? '#f7931a' : '#00d4aa',
          color: '#ffffff',
          fontWeight: '600',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Connecting...' : `Connect ${broker.charAt(0).toUpperCase() + broker.slice(1)}`}
      </button>
    </div>
  );
}