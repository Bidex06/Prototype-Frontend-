import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

export default function KillSwitch() {
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .get('/user/emergency-kill-switch')
      .then((response) => {
        if (mounted) setEnabled(Boolean(response.data?.enabled));
      })
      .catch(() => {
        // backend not updated yet: the control stays usable
      })
      .finally(() => {
        if (mounted) setLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setSwitch = async (next: boolean) => {
    if (
      next &&
      !window.confirm('Activate the emergency kill switch? All new trading orders will be blocked until you turn it off.')
    ) {
      return;
    }

    setBusy(true);
    try {
      await api.put('/user/emergency-kill-switch', { enabled: next });
      setEnabled(next);
      toast.success(next ? 'Kill switch ON: new orders are blocked' : 'Kill switch OFF: trading can resume');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update the kill switch');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        background: '#14141e',
        border: `1px solid ${enabled ? '#ef4444' : '#2a2a3a'}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}
    >
      <h2 style={{ color: '#ffffff', marginBottom: '8px', fontSize: '18px' }}>Emergency kill switch</h2>
      <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px' }}>
        Blocks every new order from your bots and manual trades. Orders already on the exchange, including
        stop-loss and take-profit, are not cancelled.
      </p>
      <button
        onClick={() => setSwitch(!enabled)}
        disabled={busy || !loaded}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '10px',
          border: 'none',
          fontWeight: 700,
          fontSize: '15px',
          cursor: busy || !loaded ? 'not-allowed' : 'pointer',
          background: enabled ? '#10b981' : '#ef4444',
          color: '#ffffff',
          opacity: busy || !loaded ? 0.6 : 1
        }}
      >
        {enabled ? 'Kill switch is ON. Click to resume trading' : 'STOP ALL TRADING'}
      </button>
    </div>
  );
}
