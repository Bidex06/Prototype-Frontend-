import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../components/common/Sidebar';
import UserTable from '../components/admin/UserTable';
import TradeTable from '../components/admin/TraderTable';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  tradesToday: number;
  successfulTrades: number;
  failedTrades: number;
  pendingTrades: number;
  monthlyGrowth: number;
}

interface Trade {
  id: number;
  userId: number;
  userEmail: string;
  symbol: string;
  direction: string;
  quantity: number;
  price: number;
  status: 'Success' | 'Failed' | 'Pending';
  profitLoss: number;
  timestamp: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  subscriptionEnd: string;
  isTrial: boolean;
  createdAt: string;
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'users'>('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Mock data for demo
      setStats({
        totalUsers: 1247,
        activeSubscriptions: 892,
        totalRevenue: 28450,
        tradesToday: 342,
        successfulTrades: 298,
        failedTrades: 34,
        pendingTrades: 10,
        monthlyGrowth: 12.4,
      });

      setTrades([
        { id: 1, userId: 101, userEmail: 'john@example.com', symbol: 'BTC/USDT', direction: 'BUY', quantity: 0.05, price: 62345, status: 'Success', profitLoss: 124.50, timestamp: '2026-08-23 14:32:21' },
        { id: 2, userId: 102, userEmail: 'sarah@example.com', symbol: 'EUR/USD', direction: 'SELL', quantity: 1000, price: 1.0875, status: 'Success', profitLoss: 87.30, timestamp: '2026-08-23 13:15:09' },
        { id: 3, userId: 103, userEmail: 'mike@example.com', symbol: 'ETH/USDT', direction: 'BUY', quantity: 0.5, price: 3450, status: 'Failed', profitLoss: -89.75, timestamp: '2026-08-23 12:45:33' },
        { id: 4, userId: 104, userEmail: 'emma@example.com', symbol: 'BTC/USDT', direction: 'SELL', quantity: 0.02, price: 62400, status: 'Pending', profitLoss: 0, timestamp: '2026-08-23 11:20:17' },
      ]);

      setUsers([
        { id: 1, email: 'john@example.com', firstName: 'John', lastName: 'Doe', isActive: true, subscriptionEnd: '2026-09-15', isTrial: false, createdAt: '2026-07-01' },
        { id: 2, email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Smith', isActive: true, subscriptionEnd: '2026-08-28', isTrial: false, createdAt: '2026-07-15' },
        { id: 3, email: 'mike@example.com', firstName: 'Mike', lastName: 'Johnson', isActive: false, subscriptionEnd: '2026-08-10', isTrial: true, createdAt: '2026-08-01' },
      ]);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'text-blue-400' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: UserGroupIcon, color: 'text-green-400' },
    { label: 'Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, icon: CurrencyDollarIcon, color: 'text-yellow-400' },
    { label: 'Trades Today', value: stats?.tradesToday || 0, icon: ChartBarIcon, color: 'text-purple-400' },
    { label: 'Successful', value: stats?.successfulTrades || 0, icon: CheckCircleIcon, color: 'text-green-400' },
    { label: 'Failed', value: stats?.failedTrades || 0, icon: XCircleIcon, color: 'text-red-400' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      Success: 'bg-green-500/20 text-green-400',
      Failed: 'bg-red-500/20 text-red-400',
      Pending: 'bg-yellow-500/20 text-yellow-400',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-dark">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-accent text-xl">Loading admin data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Full overview of your trading platform</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ClockIcon className="w-4 h-4" />
            Last updated: {new Date().toLocaleString()}
            <button onClick={fetchAdminData} className="ml-4 px-3 py-1 bg-card border border-border rounded-lg text-white hover:bg-border">
              Refresh
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-gray-400 text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border pb-2">
          {['overview', 'trades', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === tab
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'text-gray-400 hover:text-white hover:bg-border'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Chart */}
            <div className="bg-card p-4 rounded-xl border border-border">
              <h3 className="text-white font-semibold mb-4">Monthly Growth</h3>
              <div className="flex items-end gap-2 h-40">
                {[20, 35, 28, 45, 55, 70, 65, 80, 90, 75, 85, 95].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-accent/30 rounded-t"
                      style={{ height: `${(value / 100) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card p-4 rounded-xl border border-border">
              <h3 className="text-white font-semibold mb-4">Platform Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Growth</span>
                  <span className="text-green-400">+{stats?.monthlyGrowth}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-green-400">
                    {stats?.tradesToday ? Math.round((stats.successfulTrades / stats.tradesToday) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pending Trades</span>
                  <span className="text-yellow-400">{stats?.pendingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Trade Size</span>
                  <span className="text-white">$2,450</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trades' && <TradeTable trades={trades} />}
        {activeTab === 'users' && <UserTable users={users} />}
      </main>
    </div>
  );
}