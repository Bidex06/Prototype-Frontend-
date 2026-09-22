import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import BrokerConnection from '../components/trading/BrokerConnection';

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      setAutoTradeEnabled(userData.isAutoTradeEnabled || false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleToggleAutoTrade = async () => {
    const newValue = !autoTradeEnabled;
    setLoading(true);
    try {
      const response = await api.put('/user/auto-trade', {
        isAutoTradeEnabled: newValue
      });

      if (response.data.success) {
        setAutoTradeEnabled(newValue);
        toast.success(`Auto-trade ${newValue ? 'enabled' : 'disabled'}`);
        
        // Update stored user
        const stored = localStorage.getItem('user');
        if (stored) {
          const userData = JSON.parse(stored);
          userData.isAutoTradeEnabled = newValue;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        toast.error(response.data.message || 'Failed to update auto-trade setting');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update auto-trade setting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '24px', marginLeft: '240px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '24px' }}>
          Settings
        </h1>

        {/* Account Card */}
        <div style={{
          background: '#14141e',
          border: '1px solid #2a2a3a',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px' }}>Account</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af' }}>Name</span>
              <span style={{ color: '#ffffff' }}>{user?.firstName || 'N/A'} {user?.lastName || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af' }}>Email</span>
              <span style={{ color: '#ffffff' }}>{user?.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af' }}>Subscription</span>
              <span style={{ color: '#00d4aa' }}>{user?.isTrial ? 'Trial' : 'Premium'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af' }}>Subscription Ends</span>
              <span style={{ color: '#ffffff' }}>
                {user?.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {/* 👇 AUTO-TRADE TOGGLE (SWITCH STYLE) */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: '1px solid #2a2a3a',
              paddingTop: '16px',
              marginTop: '8px'
            }}>
              <div>
                <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>Auto-Trade Mode</span>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>
                  Bot automatically executes trades based on signals
                </p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoTradeEnabled}
                  onChange={handleToggleAutoTrade}
                  disabled={loading}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  inset: 0,
                  background: autoTradeEnabled ? '#00d4aa' : '#2a2a3a',
                  borderRadius: '34px',
                  transition: '0.3s',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}>
                  <span style={{
                    position: 'absolute',
                    height: '22px',
                    width: '22px',
                    left: autoTradeEnabled ? '24px' : '3px',
                    bottom: '3px',
                    background: '#ffffff',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }} />
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Broker Connections */}
        <div style={{ marginBottom: '24px' }}>
          <BrokerConnection />
        </div>

        {/* Logout Card */}
        <div style={{
          background: '#14141e',
          border: '1px solid #2a2a3a',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px' }}>Session</h2>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 24px',
              background: '#ff4757',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}