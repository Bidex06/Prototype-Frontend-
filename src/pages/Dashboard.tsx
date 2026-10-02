import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import Sidebar from '../components/common/Sidebar';
import PortfolioCard from '../components/dashboard/PortfolioCard';
import BotCard from '../components/dashboard/BotCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import RecentTrades from '../components/dashboard/RecentTrades';

import BalanceDisplay from '../components/trading/BalanceDisplay';
import SignalDisplay from '../components/trading/SignalDisplay';
import BrokerConnection from '../components/trading/BrokerConnection';
import TradeExecution from '../components/trading/TradeExecution';

import { api } from '../services/api';

interface User {
  firstName?: string;
}

interface TradingBot {
  id: number;
  name: string;
  strategy: string;
  timeframe: string;
  brokerConnectionId?: number | null;
  brokerName?: string | null;
  useFutures: boolean;
  isEnabled: boolean;
  isRunning: boolean;
  createdAt: string;
  updatedAt?: string | null;
  trackedSymbols: {
    id: number;
    symbol: string;
    exchange: string;
    isEnabled: boolean;
  }[];
  autoTradeEnabled?: boolean;
  // The API sends RiskManagementMode as a number: 0 = Auto, 1 = Manual, 2 = None.
  stopLossMode?: number | string;
  stopLossPercent?: number | null;
  takeProfitMode?: number | string;
  takeProfitPercent?: number | null;
}

interface Readiness {
  isEligible: boolean;
  reason: string;
}

function formatRisk(
  mode?: number | string,
  percent?: number | null
): string | undefined {
  if (mode === undefined || mode === null) return undefined;
  const name = typeof mode === 'string' ? mode : ['Auto', 'Manual', 'None'][mode];
  if (name === 'Manual') {
    return percent !== null && percent !== undefined ? `${percent}%` : 'Manual';
  }
  if (name === 'None') return 'Off';
  return 'Auto';
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
  reason?: string | null;
}

interface Position {
  id: number;
  symbol: string;
  direction: string;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
  status: string;
}

interface DashboardData {
  balance: number | null;
  bots: TradingBot[];
  trades: Trade[];
  positions: Position[];
  readiness: Record<number, Readiness>;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  const [data, setData] = useState<DashboardData>({
    balance: null,
    bots: [],
    trades: [],
    positions: [],
    readiness: {}
  });

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('user');

    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);

      const results = await Promise.allSettled([
        api.get('/trading/balance', {
          params: {
            currency: 'USDT',
            useFutures: false
          }
        }),

        api.get('/bot'),

        api.get('/trading/trade-history', {
          params: {
            limit: 200
          }
        }),

        api.get('/trading/positions')
      ]);

      if (!mounted) return;

      let balance: number | null = null;
      let bots: TradingBot[] = [];
      let trades: Trade[] = [];
      let positions: Position[] = [];

      const balanceResult = results[0];

      if (balanceResult.status === 'fulfilled') {
        balance = Number(balanceResult.value.data?.balance ?? 0);
      } else {
        toast.error(
          balanceResult.reason?.response?.data?.message ??
            'Failed to load broker balance.'
        );
      }

      const botsResult = results[1];

      if (botsResult.status === 'fulfilled') {
        bots = Array.isArray(botsResult.value.data)
          ? botsResult.value.data
          : [];
      } else {
        toast.error(
          botsResult.reason?.response?.data?.message ??
            'Failed to load trading bots.'
        );
      }

      const tradesResult = results[2];

      if (tradesResult.status === 'fulfilled') {
        trades = Array.isArray(tradesResult.value.data)
          ? tradesResult.value.data
          : [];
      } else {
        toast.error(
          tradesResult.reason?.response?.data?.message ??
            'Failed to load trade history.'
        );
      }

      const positionsResult = results[3];

      if (positionsResult.status === 'fulfilled') {
        positions = Array.isArray(positionsResult.value.data)
          ? positionsResult.value.data
          : [];
      } else {
        toast.error(
          positionsResult.reason?.response?.data?.message ??
            'Failed to load open positions.'
        );
      }

      // Ask the API which running bots are actually allowed to trade.
      // Failures are ignored so an older backend still works.
      const readiness: Record<number, Readiness> = {};
      const runningBots = bots.filter((b) => b.isEnabled && b.isRunning);
      const readinessResults = await Promise.allSettled(
        runningBots.map((b) => api.get<Readiness>(`/bot/${b.id}/readiness`))
      );
      readinessResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
          readiness[runningBots[index].id] = result.value.data;
        }
      });

      if (!mounted) return;

      setData({
        balance,
        bots,
        trades,
        positions,
        readiness
      });

      setLoading(false);
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const signalBot =
    data.bots.find((b) => b.isEnabled && b.isRunning) ?? data.bots[0];
  const signalSymbol =
    signalBot?.trackedSymbols.find((s) => s.isEnabled)?.symbol ?? 'BTCUSDT';

  const now = Date.now();

  const realizedPnl24h = data.trades
    .filter((trade) => {
      if (
        trade.status.toLowerCase() !== 'closed' ||
        !trade.exitTime ||
        trade.profitLoss === null ||
        trade.profitLoss === undefined
      ) {
        return false;
      }

      const exitTime = new Date(trade.exitTime).getTime();

      return (
        !Number.isNaN(exitTime) &&
        now - exitTime <= 24 * 60 * 60 * 1000
      );
    })
    .reduce(
      (total, trade) => total + Number(trade.profitLoss ?? 0),
      0
    );

  const getBotStatus = (
    bot: TradingBot
  ): 'Running' | 'Stopped' | 'Disabled' => {
    if (!bot.isEnabled) return 'Disabled';
    if (bot.isRunning) return 'Running';
    return 'Stopped';
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0a0a0f'
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: '24px',
          marginLeft: '240px'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff'
              }}
            >
              Dashboard
            </h1>

            <p style={{ color: '#9ca3af' }}>
              Welcome back, {user?.firstName || 'Trader'}!
            </p>
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

        {/* Real Portfolio */}
        <PortfolioCard
          value={data.balance}
          change={realizedPnl24h}
        />

        {/* Real Performance */}
        <div style={{ marginTop: '24px' }}>
          <PerformanceChart trades={data.trades} />
        </div>

        {/* Real Bots */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
            marginTop: '24px'
          }}
        >
          {loading ? (
            <div
              style={{
                color: '#9ca3af',
                gridColumn: '1 / -1'
              }}
            >
              Loading trading bots...
            </div>
          ) : data.bots.length === 0 ? (
            <div
              style={{
                color: '#9ca3af',
                gridColumn: '1 / -1'
              }}
            >
              No trading bots have been created yet.
            </div>
          ) : (
            data.bots.map((bot) => {
              const primarySymbol =
                bot.trackedSymbols.find(
                  (symbol) => symbol.isEnabled
                ) ??
                bot.trackedSymbols[0];

              return (
                <BotCard
                  key={bot.id}
                  id={bot.id}
                  name={bot.name}
                  pair={primarySymbol?.symbol ?? 'No symbol'}
                  strategy={bot.strategy}
                  status={getBotStatus(bot)}
                  stopLoss={formatRisk(bot.stopLossMode, bot.stopLossPercent)}
                  takeProfit={formatRisk(bot.takeProfitMode, bot.takeProfitPercent)}
                  readiness={data.readiness[bot.id] ?? null}
                  onChanged={() => setRefreshKey((k) => k + 1)}
                />
              );
            })
          )}
        </div>

        <RecentTrades trades={data.trades} />

        {/* Existing real trading components */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '32px'
          }}
        >
          <BalanceDisplay />
          <SignalDisplay symbol={signalSymbol} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px'
          }}
        >
          <BrokerConnection />
          <TradeExecution />
        </div>

        {/* Dashboard data summary */}
        <div
          style={{
            marginTop: '20px',
            color: '#6b7280',
            fontSize: '13px'
          }}
        >
          Open positions: {data.positions.length} · Completed trades:{' '}
          {data.trades.filter(
            (trade) => trade.status.toLowerCase() === 'closed'
          ).length}
        </div>
      </main>
    </div>
  );
}