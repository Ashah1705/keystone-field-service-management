import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE: Record<string, { to: string; label: string }[]> = {
  DISPATCHER: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/board', label: 'Work Order Board' },
    { to: '/customers', label: 'Customers & Sites' },
  ],
  MANAGER: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/board', label: 'Work Order Board' },
    { to: '/customers', label: 'Customers & Sites' },
    { to: '/parts', label: 'Parts Inventory' },
  ],
  TECHNICIAN: [
    { to: '/my-jobs', label: 'My Jobs' },
  ],
  CUSTOMER: [
    { to: '/portal', label: 'My Requests' },
  ],
};

export default function Layout() {
  const { isAuthenticated, role, name, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const links = NAV_BY_ROLE[role ?? ''] ?? [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="mark" />KEYSTONE</div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-role-chip">{role}</div>
          <div style={{ color: '#eef1f4', fontSize: 13, marginBottom: 10 }}>{name}</div>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
