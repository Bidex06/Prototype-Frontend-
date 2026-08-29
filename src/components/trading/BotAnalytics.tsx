interface BotAnalyticsProps {
  botId: string;
}

export default function BotAnalytics({ botId }: BotAnalyticsProps) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <h3 className="text-white font-semibold mb-4">Analytics for {botId}</h3>
      <p className="text-gray-400">Bot performance data coming soon...</p>
    </div>
  );
}