import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard, Users, Store, KeyRound, LogOut, ShieldCheck, UserCircle
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/stores', label: 'Stores', icon: Store },
];

const userLinks = [
  { to: '/user/stores', label: 'Stores', icon: Store },
  { to: '/user/password', label: 'Change Password', icon: KeyRound },
];

const ownerLinks = [
  { to: '/owner/dashboard', label: 'My Store', icon: LayoutDashboard },
  { to: '/owner/password', label: 'Change Password', icon: KeyRound },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  user: 'Normal User',
  store_owner: 'Store Owner',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === UserRole.ADMIN ? adminLinks
    : user?.role === UserRole.STORE_OWNER ? ownerLinks
    : userLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>Rate<span>Hub</span></h1>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/owner/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {user?.role === UserRole.ADMIN ? <ShieldCheck size={16} color="var(--accent)" />
              : <UserCircle size={16} color="var(--accent)" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {ROLE_LABELS[user?.role ?? 'user']}
            </div>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)', width: '100%' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
