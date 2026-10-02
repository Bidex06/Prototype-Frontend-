interface TradeRow {
  id: number;
  symbol: string;
  direction: string;
  status: string;
  entryTime: string;
  quantity?: number;
  entryPrice?: number;
  reason?: string | null;
}

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (['open', 'filled'].includes(s)) return '#10b981';
  if (['pending', 'new', 'partiallyfilled'].includes(s)) return '#f59e0b';
  if (['failed', 'blocked', 'rejected', 'cancelled', 'canceled', 'expired'].includes(s)) return '#ef4444';
  return '#9ca3af';
}

export default function RecentTrades({ trades, limit = 8 }: { trades: TradeRow[]; limit?: number }) {
  const rows = [...trades]
    .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
    .slice(0, limit);

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
        Order activity
      </h3>
      <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '12px' }}>
        Every order your bots and manual trades created, including open, pending and failed ones.
      </p>

      {rows.length === 0 ? (
        <div
          style={{
            background: '#14141e',
            border: '1px solid #2a2a3a',
            borderRadius: '12px',
            padding: '16px',
            color: '#9ca3af'
          }}
        >
          No orders yet. A signal only becomes an order when a running bot passes every safety check.
        </div>
      ) : (
        <div
          style={{
            background: '#14141e',
            border: '1px solid #2a2a3a',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          {rows.map((t) => {
            const when = new Date(t.entryTime);
            const showReason = t.reason && t.status.toLowerCase() !== 'closed';
            return (
              <div key={t.id} style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a3a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>
                    {t.direction} {t.symbol}
                  </span>
                  <span style={{ color: statusColor(t.status), fontWeight: 600 }}>{t.status}</span>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
                  {t.quantity ? `${t.quantity} ` : ''}
                  {t.entryPrice ? `@ $${Number(t.entryPrice).toLocaleString()} · ` : ''}
                  {Number.isNaN(when.getTime()) ? '' : when.toLocaleString()}
                </div>
                {showReason && (
                  <div style={{ color: '#f59e0b', fontSize: '13px', marginTop: '4px' }}>{t.reason}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
