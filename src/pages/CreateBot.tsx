import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Sidebar from '../components/common/Sidebar';
import { api } from '../services/api';

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

interface TrackedSymbol {
  id: number;
  symbol: string;
  exchange: string;
  isEnabled: boolean;
}

type RiskMode = 'Auto' | 'Manual' | 'None';

// The API's RiskManagementMode enum is numeric (Auto = 0, Manual = 1, None = 2).
// ASP.NET Core's default JSON binding rejects the strings "Auto"/"Manual"/"None".
const RISK_MODE_VALUE: Record<RiskMode, number> = { Auto: 0, Manual: 1, None: 2 };

const TIMEFRAMES = [
  '1m', '3m', '5m', '15m', '30m',
  '1h', '2h', '4h', '6h', '8h', '12h',
  '1d', '3d', '1w'
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  background: '#0a0a0f',
  border: '1px solid #2a2a3a',
  borderRadius: '8px',
  color: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#9ca3af',
  fontSize: '14px',
  marginBottom: '6px'
};

const fieldWrapStyle: React.CSSProperties = { marginBottom: '18px' };

function RiskModeField({
  title,
  mode,
  setMode,
  percent,
  setPercent
}: {
  title: string;
  mode: RiskMode;
  setMode: (m: RiskMode) => void;
  percent: string;
  setPercent: (p: string) => void;
}) {
  return (
    <div style={fieldWrapStyle}>
      <label style={labelStyle}>{title}</label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: mode === 'Manual' ? '8px' : 0 }}>
        {(['Auto', 'Manual', 'None'] as RiskMode[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: mode === option ? '1px solid #00d4ff' : '1px solid #2a2a3a',
              background: mode === option ? 'rgba(0, 212, 255, 0.1)' : '#0a0a0f',
              color: mode === option ? '#00d4ff' : '#9ca3af',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {mode === 'Manual' && (
        <input
          type="number"
          min={0.1}
          max={50}
          step={0.1}
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          placeholder="e.g. 2 for 2%"
          style={inputStyle}
        />
      )}

      <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
        {mode === 'Auto' && 'The strategy calculates this level itself.'}
        {mode === 'Manual' && 'Percent off your entry price - the bot computes the exact price when it trades.'}
        {mode === 'None' && 'No protective order will be placed for this leg. The position will be unprotected on this side.'}
      </p>
    </div>
  );
}

export default function CreateBot() {
  const navigate = useNavigate();

  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [useFutures, setUseFutures] = useState(false);

  const [symbols, setSymbols] = useState<MarketSymbol[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedSymbolLabel, setSelectedSymbolLabel] = useState('');
  const [symbolOpen, setSymbolOpen] = useState(false);
  const symbolBoxRef = useRef<HTMLDivElement>(null);
  const [loadingSymbols, setLoadingSymbols] = useState(false);

  const [name, setName] = useState('');
  const [strategyLabel, setStrategyLabel] = useState('');
  const [timeframe, setTimeframe] = useState('1h');

  const [autoTradeEnabled, setAutoTradeEnabled] = useState(true);
  const [stopLossMode, setStopLossMode] = useState<RiskMode>('Auto');
  const [stopLossPercent, setStopLossPercent] = useState('');
  const [takeProfitMode, setTakeProfitMode] = useState<RiskMode>('Auto');
  const [takeProfitPercent, setTakeProfitPercent] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [startImmediately, setStartImmediately] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await api.get<BrokerConnection[]>('/broker/connections');
        const connected = (response.data ?? []).filter((x) => x.isConnected);
        setConnections(connected);
        setConnectionId((current) => {
          if (current && connected.some((x) => x.id === current)) return current;
          return connected[0]?.id ?? null;
        });
      } catch (error) {
        console.error('Failed to fetch broker connections', error);
        toast.error('Failed to load broker connections');
      }
    };
    fetchConnections();
  }, []);

  // Changing broker or market invalidates the current pick (the symbol may not
  // exist on the other market), so clear it and start the search fresh.
  useEffect(() => {
    setSymbols([]);
    setSelectedSymbol('');
    setSelectedSymbolLabel('');
    setSearchTerm('');
    setSymbolOpen(false);
  }, [connectionId, useFutures]);

  useEffect(() => {
    if (!connectionId) {
      setLoadingSymbols(false);
      return;
    }

    let cancelled = false;

    const fetchSymbols = async () => {
      setLoadingSymbols(true);
      try {
        const response = await api.get<MarketSymbol[]>('/trading/symbols', {
          params: {
            connectionId,
            market: useFutures ? 'futures' : 'spot',
            search: searchTerm || undefined
          }
        });
        if (!cancelled) setSymbols(response.data ?? []);
      } catch (error: any) {
        if (!cancelled) {
          console.error('Failed to fetch symbols', error);
          toast.error(error.response?.data?.message || 'Failed to load trading pairs');
        }
      } finally {
        if (!cancelled) setLoadingSymbols(false);
      }
    };

    const timer = window.setTimeout(fetchSymbols, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [connectionId, useFutures, searchTerm]);

  // Close the symbol dropdown when clicking anywhere outside it.
  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (symbolBoxRef.current && !symbolBoxRef.current.contains(event.target as Node)) {
        setSymbolOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const pickSymbol = (item: MarketSymbol) => {
    setSelectedSymbol(item.symbol);
    setSelectedSymbolLabel(`${item.symbol} · ${item.baseAsset}/${item.quoteAsset}`);
    setSearchTerm('');
    setSymbolOpen(false);
  };

  const selectedConnection = useMemo(
    () => connections.find((x) => x.id === connectionId) ?? null,
    [connections, connectionId]
  );

  const resolveTrackedSymbolId = async (symbol: string, exchange: string): Promise<number> => {
    const existing = await api.get<TrackedSymbol[]>('/trading/tracked-symbols');
    const match = (existing.data ?? []).find(
      (s) => s.symbol === symbol && s.exchange.toLowerCase() === exchange.toLowerCase()
    );
    if (match) return match.id;

    try {
      const created = await api.post<TrackedSymbol>('/trading/tracked-symbols', {
        symbol,
        exchange,
        isEnabled: true
      });
      return created.data.id;
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Lost a race with another request that just created it - re-fetch and use it.
        const retry = await api.get<TrackedSymbol[]>('/trading/tracked-symbols');
        const retryMatch = (retry.data ?? []).find(
          (s) => s.symbol === symbol && s.exchange.toLowerCase() === exchange.toLowerCase()
        );
        if (retryMatch) return retryMatch.id;
      }
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      toast.error('Bot name must be at least 2 characters.');
      return;
    }
    if (!selectedConnection) {
      toast.error('Select a connected broker.');
      return;
    }
    if (!selectedSymbol) {
      toast.error('Select a trading symbol.');
      return;
    }
    if (stopLossMode === 'Manual') {
      const value = Number(stopLossPercent);
      if (!stopLossPercent || Number.isNaN(value) || value < 0.1 || value > 50) {
        toast.error('Stop-loss percent must be between 0.1 and 50.');
        return;
      }
    }
    if (takeProfitMode === 'Manual') {
      const value = Number(takeProfitPercent);
      if (!takeProfitPercent || Number.isNaN(value) || value < 0.1 || value > 50) {
        toast.error('Take-profit percent must be between 0.1 and 50.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const trackedSymbolId = await resolveTrackedSymbolId(
        selectedSymbol,
        selectedConnection.brokerName
      );

      const payload = {
        name: name.trim(),
        strategy: strategyLabel.trim() || 'Default',
        timeframe,
        brokerConnectionId: selectedConnection.id,
        useFutures,
        trackedSymbolIds: [trackedSymbolId],
        autoTradeEnabled,
        stopLossMode: RISK_MODE_VALUE[stopLossMode],
        stopLossPercent: stopLossMode === 'Manual' ? Number(stopLossPercent) : null,
        takeProfitMode: RISK_MODE_VALUE[takeProfitMode],
        takeProfitPercent: takeProfitMode === 'Manual' ? Number(takeProfitPercent) : null
      };

      const created = await api.post('/bot', payload);

      if (startImmediately) {
        try {
          await api.post(`/bot/${created.data.id}/start`);
          toast.success(`Bot "${payload.name}" created and started.`);
        } catch (startError: any) {
          // The bot itself was created successfully - only starting it
          // failed (e.g. account-level Auto Trade Mode is off in Settings).
          // Don't report this as bot creation failing.
          const startData = startError.response?.data;
          toast.error(
            `Bot "${payload.name}" was created but couldn't start: ` +
              (startData?.message || 'unknown error. Start it manually from the Dashboard.')
          );
        }
      } else {
        toast.success(`Bot "${payload.name}" created.`);
      }

      navigate('/');
    } catch (error: any) {
      // ASP.NET's automatic validation/binding errors come back as
      // { title, errors: { field: [messages] } } with no "message" key,
      // which is why this used to fall through to the generic text.
      const data = error.response?.data;
      const validationErrors: string[] = data?.errors
        ? (Object.values(data.errors) as string[][]).flat()
        : [];
      toast.error(
        data?.message || validationErrors[0] || data?.title || 'Failed to create bot.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '24px', marginLeft: '240px', maxWidth: '640px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
          Create Bot
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
          Real broker symbols. Order quantity is calculated server-side from your risk settings.
        </p>

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Bot Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. BTC Trend Bot"
            style={inputStyle}
          />
        </div>

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Strategy label</label>
          <input
            type="text"
            value={strategyLabel}
            onChange={(e) => setStrategyLabel(e.target.value)}
            placeholder="Default"
            style={inputStyle}
          />
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
            This is a display label only. Every bot currently runs the same signal engine -
            picking a name here doesn't change how the bot trades yet.
          </p>
        </div>

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Timeframe</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} style={inputStyle}>
            {TIMEFRAMES.map((tf) => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Broker</label>
          <select
            value={connectionId ?? ''}
            onChange={(e) => setConnectionId(Number(e.target.value))}
            disabled={connections.length === 0}
            style={inputStyle}
          >
            {connections.length === 0 ? (
              <option value="">No connected brokers - connect one in Settings first</option>
            ) : (
              connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brokerName} · {c.isTestnet ? 'TESTNET' : 'LIVE'}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Market</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'Spot', value: false },
              { label: 'Futures', value: true }
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setUseFutures(opt.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: useFutures === opt.value ? '1px solid #00d4ff' : '1px solid #2a2a3a',
                  background: useFutures === opt.value ? 'rgba(0, 212, 255, 0.1)' : '#0a0a0f',
                  color: useFutures === opt.value ? '#00d4ff' : '#9ca3af',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={fieldWrapStyle} ref={symbolBoxRef}>
          <label style={labelStyle}>Symbol</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={symbolOpen ? searchTerm : selectedSymbolLabel}
              onFocus={() => setSymbolOpen(true)}
              onClick={() => setSymbolOpen(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value.toUpperCase());
                setSymbolOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSymbolOpen(false);
                if (e.key === 'Enter' && symbolOpen && symbols[0]) {
                  e.preventDefault();
                  pickSymbol(symbols[0]);
                }
              }}
              placeholder={selectedSymbolLabel || 'Search BTC, ETH, SOL...'}
              disabled={!connectionId}
              autoComplete="off"
              style={{
                ...inputStyle,
                borderColor: selectedSymbol ? '#00d4ff' : '#2a2a3a',
                color: selectedSymbol && !symbolOpen ? '#00d4ff' : '#ffffff',
                cursor: 'pointer'
              }}
            />

            {symbolOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3a',
                  borderRadius: '8px',
                  zIndex: 10
                }}
              >
                {loadingSymbols ? (
                  <div style={{ padding: '10px', color: '#9ca3af' }}>Loading real exchange symbols...</div>
                ) : symbols.length === 0 ? (
                  <div style={{ padding: '10px', color: '#9ca3af' }}>No symbols found</div>
                ) : (
                  <>
                    {symbols.slice(0, 100).map((item) => (
                      <div
                        key={item.symbol}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickSymbol(item);
                        }}
                        style={{
                          padding: '10px',
                          cursor: 'pointer',
                          color: item.symbol === selectedSymbol ? '#00d4ff' : '#ffffff',
                          background: item.symbol === selectedSymbol ? 'rgba(0, 212, 255, 0.1)' : 'transparent'
                        }}
                      >
                        {item.symbol} · {item.baseAsset}/{item.quoteAsset}
                      </div>
                    ))}
                    {symbols.length > 100 && (
                      <div style={{ padding: '8px 10px', color: '#6b7280', fontSize: '12px' }}>
                        Showing the first 100 of {symbols.length} - keep typing to narrow it down.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
            {selectedSymbol
              ? 'Click the box again to change your pick.'
              : 'Click the box, search, then click a symbol to select it.'}
          </p>
        </div>

        <div style={fieldWrapStyle}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoTradeEnabled}
              onChange={(e) => setAutoTradeEnabled(e.target.checked)}
            />
            Auto Trade this bot
          </label>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
            Also requires your account-level Auto Trade Mode to be on (Settings). Either one being
            off stops this bot from executing automatically.
          </p>
        </div>

        <div style={fieldWrapStyle}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={startImmediately}
              onChange={(e) => setStartImmediately(e.target.checked)}
            />
            Start this bot immediately after creating
          </label>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
            Off by default so you can double-check a bot's config before it can trade. If left off,
            start it manually from the Dashboard whenever you're ready.
          </p>
        </div>

        <RiskModeField
          title="Stop Loss"
          mode={stopLossMode}
          setMode={setStopLossMode}
          percent={stopLossPercent}
          setPercent={setStopLossPercent}
        />

        <RiskModeField
          title="Take Profit"
          mode={takeProfitMode}
          setMode={setTakeProfitMode}
          percent={takeProfitPercent}
          setPercent={setTakeProfitPercent}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            background: '#00d4ff',
            color: '#0a0a0f',
            fontWeight: 700,
            border: 'none',
            borderRadius: '8px',
            cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            marginTop: '8px',
            marginBottom: '40px'
          }}
        >
          {submitting ? 'Creating...' : 'Create Bot'}
        </button>
      </main>
    </div>
  );
}
