import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Trade {
  id: number;
  entryTime: string;
  exitTime?: string | null;
  profitLoss?: number | null;
  status: string;
}

interface Props {
  trades: Trade[];
}

export default function PerformanceChart({ trades }: Props) {
  const closedTrades = trades
    .filter(
      (trade) =>
        trade.status.toLowerCase() === 'closed' &&
        trade.exitTime &&
        trade.profitLoss !== null &&
        trade.profitLoss !== undefined
    )
    .sort(
      (a, b) =>
        new Date(a.exitTime!).getTime() -
        new Date(b.exitTime!).getTime()
    );

  let cumulativeProfit = 0;

  const data = closedTrades.map((trade) => {
    cumulativeProfit += Number(trade.profitLoss ?? 0);

    return {
      date: new Date(trade.exitTime!).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      }),
      value: Number(cumulativeProfit.toFixed(2))
    };
  });

  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <h3 className="text-white font-semibold mb-1">
        Realized P&L
      </h3>

      <p className="text-gray-500 text-xs mb-4">
        Cumulative profit and loss from completed trades
      </p>

      {data.length === 0 ? (
        <div
          style={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}
        >
          No completed trade data available yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2a2a3a"
            />

            <XAxis
              dataKey="date"
              stroke="#666"
            />

            <YAxis
              stroke="#666"
            />

            <Tooltip
              formatter={(value) => [
                `$${Number(value).toFixed(2)}`,
                'Cumulative P&L'
              ]}
              contentStyle={{
                background: '#14141e',
                border: '1px solid #2a2a3a'
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#00d4ff"
              strokeWidth={2}
              dot={{ fill: '#00d4ff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}