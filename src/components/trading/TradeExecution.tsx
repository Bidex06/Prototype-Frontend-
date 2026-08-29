import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

export default function TradeExecution() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [quantity, setQuantity] = useState(0.001);
  const [loading, setLoading] = useState<'buy' | 'sell' | null>(null);
  const [loadingSymbols, setLoadingSymbols] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await api.get('/trading/symbols');
        setSymbols(response.data);
        if (response.data.length > 0) {
          setSymbol(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch symbols', error);
        toast.error('Failed to load trading pairs');
      } finally {
        setLoadingSymbols(false);
      }
    };
    fetchSymbols();
  }, []);

  const handleTrade = async (side: 'buy' | 'sell') => {
    setLoading(side);
    try {
      const response = await api.post('/trading/place-order', {
        symbol,
        direction: side.toUpperCase(),
        quantity,
        orderType: 'Market',
        useFutures: false
      });

      if (response.data.success) {
        toast.success(`${side.toUpperCase()} ${quantity} ${symbol} executed!`);
      } else {
        toast.error(response.data.message || 'Order failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${side} ${symbol}`);
    } finally {
      setLoading(null);
    }
  };

  const filteredSymbols = symbols.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingSymbols) {
    return (
      <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px' }}>
        <p style={{ color: '#9ca3af' }}>Loading trading pairs...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#14141e', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ color: '#ffffff', marginBottom: '4px' }}>Trade</h3>
      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>Instant Order Execution</p>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Search Symbol</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          placeholder="Search for BTC, ETH, SOL..."
          style={{
            width: '100%',
            padding: '10px',
            background: '#0a0a0f',
            border: '1px solid #2a2a3a',
            borderRadius: '8px',
            color: '#ffffff',
            outline: 'none',
            marginBottom: '8px'
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Select Symbol</label>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#0a0a0f',
            border: '1px solid #2a2a3a',
            borderRadius: '8px',
            color: '#ffffff',
            outline: 'none',
            maxHeight: '150px'
          }}
          size={5}
        >
          {filteredSymbols.length === 0 ? (
            <option value="">No symbols found</option>
          ) : (
            filteredSymbols.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))
          )}
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
          step={0.001}
          min={0.001}
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

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => handleTrade('buy')}
          disabled={loading !== null}
          style={{
            flex: 1,
            padding: '12px',
            background: '#00d4aa',
            color: '#0a0a0f',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            opacity: loading === 'buy' ? 0.6 : 1,
          }}
        >
          {loading === 'buy' ? 'Buying...' : 'Buy'}
        </button>
        <button
          onClick={() => handleTrade('sell')}
          disabled={loading !== null}
          style={{
            flex: 1,
            padding: '12px',
            background: '#ff4757',
            color: '#ffffff',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            opacity: loading === 'sell' ? 0.6 : 1,
          }}
        >
          {loading === 'sell' ? 'Selling...' : 'Sell'}
        </button>
      </div>
    </div>
  );
}