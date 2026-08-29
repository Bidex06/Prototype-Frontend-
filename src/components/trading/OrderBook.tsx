interface OrderBookProps {
  symbol?: string;
}

export default function OrderBook({ symbol = 'BTC/USDT' }: OrderBookProps) {
  const asks = [
    { price: 62450, quantity: 0.15 },
    { price: 62455, quantity: 0.32 },
    { price: 62460, quantity: 0.08 },
    { price: 62470, quantity: 0.45 },
    { price: 62480, quantity: 0.12 },
  ];

  const bids = [
    { price: 62440, quantity: 0.22 },
    { price: 62435, quantity: 0.18 },
    { price: 62430, quantity: 0.35 },
    { price: 62420, quantity: 0.09 },
    { price: 62410, quantity: 0.27 },
  ];

  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <h3 className="text-white font-semibold mb-4">Order Book — {symbol}</h3>
      
      <div className="space-y-1 mb-2">
        {asks.map((ask, i) => (
          <div key={`ask-${i}`} className="flex justify-between text-sm">
            <span className="text-red-400">${ask.price.toFixed(2)}</span>
            <span className="text-gray-400">{ask.quantity.toFixed(4)}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-gray-500 py-2 border-y border-border">
        Spread: $10.00 (0.016%)
      </div>

      <div className="space-y-1 mt-2">
        {bids.map((bid, i) => (
          <div key={`bid-${i}`} className="flex justify-between text-sm">
            <span className="text-green-400">${bid.price.toFixed(2)}</span>
            <span className="text-gray-400">{bid.quantity.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}