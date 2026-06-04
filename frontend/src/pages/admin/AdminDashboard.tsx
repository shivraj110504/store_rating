import { useEffect, useState } from 'react';
import { getDashboard } from '../../api/admin';
import type { DashboardStats } from '../../types';
import { Users, Store, Star, ShieldCheck, UserCheck, KeySquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboard().then(r => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <div className="page-loading"><div className="spinner" /></div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#6c63ff', sub: 'Across all roles' },
    { label: 'Admins', value: stats.totalAdmins, icon: ShieldCheck, color: '#a78bfa', sub: 'Admin accounts' },
    { label: 'Normal Users', value: stats.totalNormal, icon: UserCheck, color: '#22c55e', sub: 'Registered users' },
    { label: 'Store Owners', value: stats.totalStoreOwners, icon: KeySquare, color: '#f5c518', sub: 'Owner accounts' },
    { label: 'Total Stores', value: stats.totalStores, icon: Store, color: '#38bdf8', sub: 'Registered stores' },
    { label: 'Total Ratings', value: stats.totalRatings, icon: Star, color: '#fb923c', sub: 'Submitted ratings' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Platform overview</p>
      </div>

      <div className="stat-grid">
        {cards.map(({ label, value, icon: Icon, color, sub }) => (
          <div className="stat-card" key={label} style={{ borderTop: `2px solid ${color}` }}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="text-muted text-sm" style={{ marginTop: 4 }}>{sub}</div>
            <div className="stat-icon"><Icon /></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/admin/users">
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Users size={16} /> Manage Users
              </button>
            </Link>
            <Link to="/admin/stores">
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Store size={16} /> Manage Stores
              </button>
            </Link>
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Platform Health</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Avg ratings per store', value: stats.totalStores > 0 ? (stats.totalRatings / stats.totalStores).toFixed(1) : '0' },
              { label: 'Store coverage', value: `${stats.totalStoreOwners} owner${stats.totalStoreOwners !== 1 ? 's' : ''}` },
              { label: 'User-to-store ratio', value: stats.totalStores > 0 ? `${(stats.totalNormal / stats.totalStores).toFixed(1)}x` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-muted text-sm">{label}</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
