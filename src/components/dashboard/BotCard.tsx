import { Link } from 'react-router-dom';

interface Props {
  name: string;
  pair: string;
  strategy: string;
  status: 'Running' | 'Paused' | 'Stopped';
  profit: number;
  profitAmount: number;
}

export default function BotCard({ name, pair, strategy, status, profit, profitAmount }: Props) {
  const statusColor = status === 'Running' ? 'text-green' : status === 'Paused' ? 'text-yellow-400' : 'text-red';

  return (
    <div className="bg-card p-4 rounded-xl border border-border hover:border-accent transition cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold">{name}</h3>
        <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
      </div>
      <p className="text-gray-400 text-sm">{pair}</p>
      <p className="text-gray-400 text-sm">{strategy}</p>
      <div className="mt-3 flex justify-between items-center">
        <div>
          <span className="text-gray-400 text-sm">Profit</span>
          <p className={`font-bold ${profit >= 0 ? 'text-green' : 'text-red'}`}>
            {profit >= 0 ? '+' : ''}{profit}%
          </p>
        </div>
        <span className="text-sm text-gray-400">+${profitAmount.toLocaleString()}</span>
      </div>
      <Link to={`/analytics/${name}`} className="mt-3 block text-center text-accent text-sm hover:underline">
        View Analytics →
      </Link>
    </div>
  );
}