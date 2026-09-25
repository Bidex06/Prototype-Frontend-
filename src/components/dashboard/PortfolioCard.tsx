interface Props {
  value: number | null;
  change: number;
  changeLabel?: string;
}

export default function PortfolioCard({
  value,
  change,
  changeLabel = '24h realized P&L'
}: Props) {
  const isPositive = change >= 0;

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <p className="text-gray-400 text-sm">Portfolio Balance</p>

      <div className="flex items-end gap-4 flex-wrap">
        <h2 className="text-3xl font-bold text-white">
          {value === null
            ? 'Unavailable'
            : `$${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`}
        </h2>

        <span
          className={`text-sm font-medium ${
            isPositive ? 'text-green' : 'text-red'
          }`}
        >
          {value === null
            ? 'No broker balance'
            : `${isPositive ? '+' : ''}$${Math.abs(change).toFixed(2)} ${changeLabel}`}
        </span>
      </div>
    </div>
  );
}