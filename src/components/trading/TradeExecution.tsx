import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

interface BrokerConnection {
  id: number;
  brokerName: string;
  isConnected: boolean;
  isTestnet: boolean;
  isLiveTradingEnabled: boolean;
}

interface MarketSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  exchange: string;
  market: string;
  status: string;
}

export default function TradeExecution() {
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [symbols, setSymbols] = useState<MarketSymbol[]>([]);
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [loading, setLoading] = useState<'buy' | 'sell' | null>(null);
  const [loadingSymbols, setLoadingSymbols] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await api.get<BrokerConnection[]>('/broker/connections');
        const connected = (response.data ?? []).filter((x) => x.isConnected);
        setConnections(connected);
        if (connected.length > 0) setConnectionId(connected[0].id);
      } catch (error) {
        console.error('Failed to fetch broker connections', error);
        toast.error('Failed to load broker connections');
      }
    };
    fetchConnections();
  }, []);

  useEffect(() => {
    if (!connectionId) {
      setSymbols([]);
      setLoadingSymbols(false);
      return;
    }

    const fetchSymbols = async () => {
      setLoadingSymbols(true);
      try {
        const response = await api.get<MarketSymbol[]>('/trading/symbols', {
          params: { connectionId, market: 'spot', search: searchTerm || undefined },
        });
        const data = response.data ?? [];
        setSymbols(data);
        if (data.length > 0 && !data.some((x) => x.symbol === symbol)) setSymbol(data[0].symbol);
      } catch (error: any) {
        console.error('Failed to fetch symbols', error);
        toast.error(error.response?.data?.message || 'Failed to load trading pairs');
      } finally {
        setLoadingSymbols(false);
      }
    };

    const timer = window.setTimeout(fetchSymbols, 250);
    return () => window.clearTimeout(timer);
  }, [connectionId, searchTerm]);

  const selectedConnection = useMemo(
    () => connections.find((x) => x.id === connectionId) ?? null,
    [connections, connectionId]
  );

  const handleTrade = async (side: 'buy' | 'sell') => {
    if (!selectedConnection) {
      toast.error('Select a connected broker first');
      return;
    }

    if (!symbol) {
      toast.error('Select a trading symbol');
      return;
    }

    setLoading(side);
    try {
      const response = await api.post('/trading/place-order', {
        connectionId: selectedConnection.id,
        symbol,
        direction: side.toUpperCase(),
        orderType: 'Market',
        useFutures: false,
      }, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      });

      if (response.data.success) {
        toast.success(`${side.toUpperCase()} ${symbol} submitted successfully.`);
      } else {
        toast.error(response.data.message || 'Order failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${side} ${symbol}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ color: '#ffffff', marginBottom: '4px' }}>Trade</h3>
      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>
        Real exchange symbols. Order quantity is calculated server-side from your risk settings.
      </p>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Broker</label>
        <select value={connectionId ?? ''} onChange={(e) => setConnectionId(Number(e.target.value))} disabled={connections.length === 0} style={{ width: '100%', padding: '10px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#ffffff', outline: 'none' }}>
          {connections.length === 0 ? <option value="">No connected brokers</option> : connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.brokerName} · {connection.isTestnet ? 'TESTNET' : 'LIVE'}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Search Symbol</label>
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value.toUpperCase())} placeholder="Search BTC, ETH, SOL..." style={{ width: '100%', padding: '10px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Select Symbol {symbols.length > 0 ? `(${symbols.length})` : ''}</label>
        {loadingSymbols ? <p style={{ color: '#9ca3af' }}>Loading real exchange symbols...</p> : (
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} disabled={symbols.length === 0} style={{ width: '100%', padding: '10px', background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#ffffff', outline: 'none' }} size={Math.min(8, Math.max(3, symbols.length))}>
            {symbols.length === 0 ? <option value="">No symbols found</option> : symbols.map((item) => <option key={item.symbol} value={item.symbol}>{item.symbol} · {item.baseAsset}/{item.quoteAsset}</option>)}
          </select>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => handleTrade('buy')} disabled={loading !== null || !selectedConnection || !symbol} style={{ flex: 1, padding: '12px', background: '#00d4aa', color: '#0a0a0f', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: loading === 'buy' ? 0.6 : 1 }}>{loading === 'buy' ? 'Buying...' : 'Buy'}</button>
        <button onClick={() => handleTrade('sell')} disabled={loading !== null || !selectedConnection || !symbol} style={{ flex: 1, padding: '12px', background: '#ff4757', color: '#ffffff', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: loading === 'sell' ? 0.6 : 1 }}>{loading === 'sell' ? 'Selling...' : 'Sell'}</button>
      </div>
    </div>
  );
}
