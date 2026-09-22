import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/create-bot', label: 'Create Bot' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/admin', label: 'Admin' },
  { path: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Fast X</div>
      <nav>
        {menuItems.map((item) => {
          if (item.label === 'Admin' && !isAdmin) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}