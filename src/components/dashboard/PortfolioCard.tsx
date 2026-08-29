interface Props {
  value: number;
  change: number;
}

export default function PortfolioCard({ value, change }: Props) {
  const isPositive = change >= 0;

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <p className="text-gray-400 text-sm">Portfolio Value</p>
      <div className="flex items-end gap-4">
        <h2 className="text-3xl font-bold text-white">${value.toLocaleString()}</h2>
        <span className={`text-sm font-medium ${isPositive ? 'text-green' : 'text-red'}`}>
          {isPositive ? '+' : ''}{change}% 24h
        </span>
      </div>
    </div>
  );
}