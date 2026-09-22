import { useEffect, useState } from 'react'; 
import { 
  UsersIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  ClockIcon, 
} from '@heroicons/react/24/outline'; 
 
import Sidebar from '../components/common/Sidebar'; 
import UserTable from '../components/admin/UserTable'; 
import { api } from '../services/api'; 
import './Admin.css'; 
 
interface AdminStats { 
  totalUsers: number; 
  activeUsers: number; 
  activeSubscriptions: number; 
  activeTrials: number; 
} 
 
interface User { 
  id: number; 
  email: string; 
  firstName: string; 
  lastName: string; 
  role: string; 
  isActive: boolean; 
  isEmailVerified: boolean; 
  isAutoTradeEnabled: boolean; 
  subscriptionEnd: string | null; 
  isTrial: boolean; 
  isSubscriptionActive: boolean; 
  createdAt: string; 
} 
 
export default function Admin() { 
  const [stats, setStats] = useState<AdminStats | null>(null); 
  const [users, setUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(''); 
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>( 
    'overview' 
  ); 
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null); 
 
  useEffect(() => { 
    fetchAdminData(); 
  }, []); 
 
  const fetchAdminData = async () => { 
    setLoading(true); 
    setError(''); 
 
    try { 
      const [statsResponse, usersResponse] = await Promise.all([ 
        api.get<AdminStats>('/admin/stats'), 
        api.get<User[]>('/admin/users'), 
      ]); 
 
      setStats(statsResponse.data); 
      setUsers(usersResponse.data); 
      setLastUpdated(new Date()); 
    } catch (error: any) { 
      console.error('Failed to fetch admin data:', error); 
 
      if (error.response?.status === 401) { 
        setError( 
          'Your session is unauthorized. Please log in again.' 
        ); 
      } else if (error.response?.status === 403) { 
        setError( 
          'You do not have permission to access the Admin dashboard.' 
        ); 
      } else { 
        setError('Failed to load Admin data.'); 
      } 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  const statCards = [ 
    { 
      label: 'Total Users', 
      value: stats?.totalUsers ?? 0, 
      icon: UsersIcon, 
      type: 'blue', 
    }, 
    { 
      label: 'Active Users', 
      value: stats?.activeUsers ?? 0, 
      icon: UserGroupIcon, 
      type: 'green', 
    }, 
    { 
      label: 'Active Subscriptions', 
      value: stats?.activeSubscriptions ?? 0, 
      icon: CheckCircleIcon, 
      type: 'green', 
    }, 
    { 
      label: 'Active Trials', 
      value: stats?.activeTrials ?? 0, 
      icon: ClockIcon, 
      type: 'yellow', 
    }, 
  ]; 
 
  if (loading) { 
    return ( 
      <div className="admin-layout"> 
        <Sidebar /> 
 
        <main className="admin-content"> 
          <div className="admin-loading"> 
            <div className="admin-spinner"></div> 
            <p>Loading admin data...</p> 
          </div> 
        </main> 
      </div> 
    ); 
  } 
 
  if (error) { 
    return ( 
      <div className="admin-layout"> 
        <Sidebar /> 
 
        <main className="admin-content"> 
          <div className="admin-error-card"> 
            <h1>Admin Dashboard</h1> 
 
            <p>{error}</p> 
 
            <button 
              onClick={fetchAdminData} 
              className="admin-primary-button" 
            > 
              Retry 
            </button> 
          </div> 
        </main> 
      </div> 
    ); 
  } 
 
  return ( 
    <div className="admin-layout"> 
      <Sidebar /> 
 
      <main className="admin-content"> 
 
        {/* Header */} 
        <header className="admin-header"> 
          <div> 
            <h1>Admin Dashboard</h1> 
 
            <p> 
              Full overview of your trading platform 
            </p> 
          </div> 
 
          <div className="admin-header-actions"> 
            <div className="admin-last-updated"> 
              <ClockIcon /> 
 
              <span> 
                {lastUpdated 
                  ? `Updated ${lastUpdated.toLocaleTimeString()}` 
                  : 'Not updated'} 
              </span> 
            </div> 
 
            <button 
              onClick={fetchAdminData} 
              className="admin-refresh-button" 
            > 
              Refresh 
            </button> 
          </div> 
        </header> 
 
        {/* Statistics */} 
        <section className="admin-stats-grid"> 
          {statCards.map((stat) => { 
            const Icon = stat.icon; 
 
            return ( 
              <div 
                key={stat.label} 
                className="admin-stat-card" 
              > 
                <div className="admin-stat-top"> 
                  <div 
                    className={`admin-stat-icon admin-stat-icon-${stat.type}`} 
                  > 
                    <Icon /> 
                  </div> 
 
                  <span className="admin-stat-label"> 
                    {stat.label} 
                  </span> 
                </div> 
 
                <div className="admin-stat-value"> 
                  {stat.value} 
                </div> 
              </div> 
            ); 
          })} 
        </section> 
 
        {/* Tabs */} 
        <nav className="admin-tabs"> 
          <button 
            onClick={() => setActiveTab('overview')} 
            className={ 
              activeTab === 'overview' 
                ? 'admin-tab admin-tab-active' 
                : 'admin-tab' 
            } 
          > 
            Overview 
          </button> 
 
          <button 
            onClick={() => setActiveTab('users')} 
            className={ 
              activeTab === 'users' 
                ? 'admin-tab admin-tab-active' 
                : 'admin-tab' 
            } 
          > 
            Users 
          </button> 
        </nav> 
 
        {/* Overview */} 
        {activeTab === 'overview' && ( 
          <section className="admin-overview-grid"> 
 
            <div className="admin-panel"> 
              <div className="admin-panel-header"> 
                <div> 
                  <h2>Platform Overview</h2> 
                  <p>Current platform statistics</p> 
                </div> 
              </div> 
 
              <div className="admin-overview-list"> 
 
                <div className="admin-overview-row"> 
                  <span>Total Users</span> 
                  <strong> 
                    {stats?.totalUsers ?? 0} 
                  </strong> 
                </div> 
 
                <div className="admin-overview-row"> 
                  <span>Active Users</span> 
                  <strong className="admin-green"> 
                    {stats?.activeUsers ?? 0} 
                  </strong> 
                </div> 
 
                <div className="admin-overview-row"> 
                  <span>Active Subscriptions</span> 
                  <strong className="admin-green"> 
                    {stats?.activeSubscriptions ?? 0} 
                  </strong> 
                </div> 
 
                <div className="admin-overview-row"> 
                  <span>Active Trials</span> 
                  <strong className="admin-yellow"> 
                    {stats?.activeTrials ?? 0} 
                  </strong> 
                </div> 
 
              </div> 
            </div> 
 
            <div className="admin-panel"> 
              <div className="admin-panel-header"> 
                <div> 
                  <h2>Admin Access</h2> 
                  <p>Authorization status</p> 
                </div> 
              </div> 
 
              <div className="admin-access-status"> 
                <div className="admin-access-icon"> 
                  <CheckCircleIcon /> 
                </div> 
 
                <div> 
                  <h3>Admin authorization active</h3> 
 
                  <p> 
                    This dashboard is protected by the 
                    AdminOnly authorization policy. 
                  </p> 
                </div> 
              </div> 
            </div> 
 
          </section> 
        )} 
 
        {/* Users */} 
        {activeTab === 'users' && ( 
          <section className="admin-users-section"> 
            <UserTable
              users={users}
              onStatusChanged={fetchAdminData}
            />
          </section> 
        )} 
 
      </main> 
    </div> 
  ); 
}