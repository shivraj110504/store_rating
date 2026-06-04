import { useEffect, useState } from 'react';
import { getMyStore } from '../../api/stores';
import StarRating from '../../components/common/StarRating';
import SortableHeader from '../../components/common/SortableHeader';
import { Store, Users, Star, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const [store, setStore] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  useEffect(() => {
    getMyStore()
      .then(r => setStore(r.data))
      .catch(err => {
        if (err.response?.status !== 404) toast.error('Failed to load store data');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const sortedRaters = store?.raters ? [...store.raters].sort((a: any, b: any) => {
    const av = a[sortBy] ?? '';
    const bv = b[sortBy] ?? '';
    if (typeof av === 'number') return sortOrder === 'ASC' ? av - bv : bv - av;
    return sortOrder === 'ASC'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  }) : [];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (!store) return (
    <div>
      <div className="page-header">
        <h2>My Store</h2>
        <p>Store dashboard</p>
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 40, textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(245,197,24,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Store size={26} color="var(--warning)" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Store Assigned</div>
        <div className="text-muted text-sm" style={{ lineHeight: 1.7 }}>
          Your account hasn't been assigned a store yet.<br />
          Please contact the administrator to set up your store.
        </div>
      </div>
    </div>
  );

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: store.raters.filter((r: any) => r.rating === star).length,
    pct: store.totalRatings > 0
      ? (store.raters.filter((r: any) => r.rating === star).length / store.totalRatings) * 100
      : 0,
  }));

  return (
    <div>
      <div className="page-header">
        <h2>My Store</h2>
        <p>Performance overview and customer ratings</p>
      </div>

      {/* Store info + rating summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Store size={22} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{store.name}</div>
              <div className="text-muted text-sm" style={{ marginBottom: 4 }}>{store.email}</div>
              <div className="text-muted text-sm">{store.address}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', minWidth: 160 }}>
          <div className="text-muted text-sm" style={{ marginBottom: 6 }}>Average Rating</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>
            {(store.averageRating ?? 0).toFixed(1)}
          </div>
          <div style={{ margin: '8px 0' }}>
            <StarRating value={Math.round(store.averageRating ?? 0)} readonly />
          </div>
          <div className="text-muted text-sm">{store.totalRatings} review{store.totalRatings !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Rating distribution */}
      {store.totalRatings > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="var(--accent)" /> Rating Distribution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ratingDist.map(({ star, count, pct }) => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 50, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{star}</span>
                  <Star size={12} fill="var(--gold)" stroke="var(--gold)" />
                </div>
                <div style={{ flex: 1, height: 8, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold)', borderRadius: 99, transition: 'width 0.5s' }} />
                </div>
                <div style={{ width: 40, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Reviews</div>
          <div className="stat-value">{store.totalRatings}</div>
          <div className="stat-icon"><Users /></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Score</div>
          <div className="stat-value">{(store.averageRating ?? 0).toFixed(1)}</div>
          <div className="stat-icon"><Star /></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">5-Star Reviews</div>
          <div className="stat-value">{store.raters.filter((r: any) => r.rating === 5).length}</div>
          <div className="stat-icon"><TrendingUp /></div>
        </div>
      </div>

      {/* Raters table */}
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Customer Reviews</div>
      {sortedRaters.length === 0 ? (
        <div className="empty-state"><Star /><p>No reviews yet. Share your store to get ratings!</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortableHeader label="Customer Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Rating" field="rating" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedRaters.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.email}</td>
                  <td>
                    <div className="rating-display">
                      <StarRating value={r.rating} readonly size="sm" />
                      <span className="rating-num">{r.rating}/5</span>
                    </div>
                  </td>
                  <td className="text-muted text-sm">
                    {new Date(r.ratedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
