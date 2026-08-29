import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', value: 10000 },
  { month: 'Feb', value: 12000 },
  { month: 'Mar', value: 9500 },
  { month: 'Apr', value: 11000 },
  { month: 'May', value: 14000 },
  { month: 'Jun', value: 12450 },
];

export default function PerformanceChart() {
  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <h3 className="text-white font-semibold mb-4">Performance Summary</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis dataKey="month" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip contentStyle={{ background: '#14141e', border: '1px solid #2a2a3a' }} />
          <Line type="monotone" dataKey="value" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}