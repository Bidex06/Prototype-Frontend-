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

interface Props {
  trades: Trade[];
}

export default function TradeTable({ trades }: Props) {
  const getStatusBadge = (status: string) => {
    const styles = {
      Success: 'bg-green-500/20 text-green-400',
      Failed: 'bg-red-500/20 text-red-400',
      Pending: 'bg-yellow-500/20 text-yellow-400',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-border/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Symbol</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Direction</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Qty</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">P/L</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-t border-border hover:bg-border/30">
                <td className="px-4 py-3 text-white text-sm">{trade.userEmail}</td>
                <td className="px-4 py-3 text-white text-sm">{trade.symbol}</td>
                <td className={`px-4 py-3 text-sm font-medium ${
                  trade.direction === 'BUY' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trade.direction}
                </td>
                <td className="px-4 py-3 text-white text-sm">{trade.quantity}</td>
                <td className="px-4 py-3 text-white text-sm">${trade.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(trade.status)}`}>
                    {trade.status}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm font-medium ${
                  trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{trade.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}