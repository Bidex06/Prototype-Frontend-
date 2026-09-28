import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { api } from '../../services/api';

interface Props {
  id: number;
  name: string;
  pair: string;
  strategy: string;
  status: 'Running' | 'Stopped' | 'Disabled';
  profit?: number | null;
  profitAmount?: number | null;
  onChanged?: () => void;
}

function extractErrorMessage(error: any, fallback: string): string {
  const data = error?.response?.data;
  const validationErrors: string[] = data?.errors
    ? (Object.values(data.errors) as string[][]).flat()
    : [];
  return data?.message || validationErrors[0] || data?.title || fallback;
}

export default function BotCard({
  id,
  name,
  pair,
  strategy,
  status,
  profit,
  profitAmount,
  onChanged
}: Props) {
  const [busy, setBusy] = useState<'start' | 'stop' | 'delete' | null>(null);

  const statusClass =
    status === 'Running'
      ? 'text-green'
      : status === 'Stopped'
        ? 'text-yellow-400'
        : 'text-gray-400';

  const handleStart = async () => {
    setBusy('start');
    try {
      await api.post(`/bot/${id}/start`);
      toast.success(`"${name}" started.`);
      onChanged?.();
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'Failed to start bot.'));
    } finally {
      setBusy(null);
    }
  };

  const handleStop = async () => {
    setBusy('stop');
    try {
      await api.post(`/bot/${id}/stop`);
      toast.success(`"${name}" stopped.`);
      onChanged?.();
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'Failed to stop bot.'));
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;

    setBusy('delete');
    try {
      await api.delete(`/bot/${id}`);
      toast.success(`"${name}" deleted.`);
      onChanged?.();
    } catch (error: any) {
      toast.error(extractErrorMessage(error, 'Failed to delete bot.'));
      setBusy(null);
    }
  };

  const actionButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #2a2a3a',
    background: 'transparent',
    fontSize: '12px',
    fontWeight: 600,
    cursor: busy ? 'default' : 'pointer',
    opacity: busy ? 0.6 : 1
  };

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

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        {status === 'Running' ? (
          <button
            type="button"
            onClick={handleStop}
            disabled={!!busy}
            style={{ ...actionButtonStyle, color: '#f59e0b' }}
          >
            {busy === 'stop' ? 'Stopping...' : 'Stop'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleStart}
              disabled={!!busy}
              style={{ ...actionButtonStyle, color: '#10b981' }}
            >
              {busy === 'start' ? 'Starting...' : 'Start'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!!busy}
              style={{ ...actionButtonStyle, color: '#ef4444' }}
            >
              {busy === 'delete' ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}
      </div>

      <div className="mt-3">
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
