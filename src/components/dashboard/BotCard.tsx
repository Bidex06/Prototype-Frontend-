import { Link } from 'react-router-dom';

interface Props {
  id: number;
  name: string;
  pair: string;
  strategy: string;
  status: 'Running' | 'Stopped' | 'Disabled';
  profit?: number | null;
  profitAmount?: number | null;
}

export default function BotCard({
  id,
  name,
  pair,
  strategy,
  status,
  profit,
  profitAmount
}: Props) {
  const statusClass =
    status === 'Running'
      ? 'text-green'
      : status === 'Stopped'
        ? 'text-yellow-400'
        : 'text-gray-400';

  return (
    <div className="bg-card p-5 rounded-xl border border-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold">{name}</h3>
          <p className="text-gray-400 text-sm mt-1">{pair}</p>
        </div>

        <span className={`text-sm font-medium ${statusClass}`}>
          {status}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-gray-400 text-sm">Strategy</p>
        <p className="text-white mt-1">{strategy}</p>
      </div>

      <div className="mt-4">
        <p className="text-gray-400 text-sm">Profit / Loss</p>

        {profitAmount !== null && profitAmount !== undefined ? (
          <div className="mt-1">
            <p className="text-white font-semibold">
              {profitAmount >= 0 ? '+' : '-'}$
              {Math.abs(profitAmount).toFixed(2)}
            </p>

            {profit !== null && profit !== undefined && (
              <p
                className={`text-sm ${
                  profit >= 0 ? 'text-green' : 'text-red'
                }`}
              >
                {profit >= 0 ? '+' : ''}
                {profit.toFixed(2)}%
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 mt-1">No bot P&amp;L</p>
        )}
      </div>

      <div className="mt-5">
        <Link
          to={`/analytics/${id}`}
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
        >
          View Analytics →
        </Link>
      </div>
    </div>
  );
}