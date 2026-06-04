import { useEffect, useState, useCallback } from 'react';
import { getStores } from '../../api/stores';
import { createRating, updateRating } from '../../api/ratings';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';
import { Search, MapPin, Mail, Store, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [rateStore, setRateStore] = useState<any | null>(null);
  const [ratingVal, setRatingVal] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;
      const res = await getStores(params);
      setStores(res.data);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const openRating = (store: any) => {
    setRateStore(store);
    setRatingVal(store.userRating?.value || 0);
  };

  const handleSubmitRating = async () => {
    if (!ratingVal || !rateStore) { toast.error('Please select a star rating'); return; }
    setSaving(true);
    try {
      if (rateStore.userRating) {
        await updateRating(rateStore.userRating.id, ratingVal);
        toast.success('Your rating has been updated!');
      } else {
        await createRating(rateStore.id, ratingVal);
        toast.success('Rating submitted successfully!');
      }
      setRateStore(null);
      fetchStores();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to submit rating');
    } finally { setSaving(false); }
  };

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div>
      <div className="page-header">
        <h2>Browse Stores</h2>
        <p>Discover and rate stores on the platform</p>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap" style={{ maxWidth: 280 }}>
          <Search />
          <input className="form-input" placeholder="Search by store name…"
            value={search.name}
            onChange={e => setSearch(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="search-input-wrap" style={{ maxWidth: 280 }}>
          <Search />
          <input className="form-input" placeholder="Search by address…"
            value={search.address}
            onChange={e => setSearch(p => ({ ...p, address: e.target.value }))} />
        </div>
        {(search.name || search.address) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setSearch({ name: '', address: '' })}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <Store />
          <p>{search.name || search.address ? 'No stores match your search.' : 'No stores available yet.'}</p>
        </div>
      ) : (
        <div className="store-grid">
          {stores.map((s: any) => (
            <div className="store-card" key={s.id}>
              <div className="store-card-name">{s.name}</div>
              <div className="store-card-address">
                <MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                {s.address}
              </div>

              {/* Overall Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <StarRating value={Math.round(s.averageRating ?? 0)} readonly size="sm" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>{(s.averageRating ?? 0).toFixed(1)}</span>
                <span className="text-muted text-sm">({s.totalRatings} {s.totalRatings === 1 ? 'rating' : 'ratings'})</span>
              </div>

              {/* User's own rating */}
              <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                <div className="text-muted text-sm" style={{ marginBottom: 5 }}>Your Rating</div>
                {s.userRating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StarRating value={s.userRating.value} readonly size="sm" />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{LABELS[s.userRating.value]}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                    <Star size={14} />
                    Not rated yet
                  </div>
                )}
              </div>

              <div className="store-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }} className="text-muted text-sm">
                  <Mail size={13} />{s.email}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => openRating(s)}>
                  {s.userRating ? 'Edit Rating' : 'Rate Store'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rateStore && (
        <Modal title={`Rate: ${rateStore.name}`} onClose={() => !saving && setRateStore(null)}>
          <p className="text-muted text-sm" style={{ marginBottom: 20 }}>
            Click a star to select your rating from 1 (lowest) to 5 (highest).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <StarRating value={ratingVal} onChange={setRatingVal} />
            <div style={{ height: 22, fontSize: 14, fontWeight: 600, color: ratingVal ? 'var(--gold)' : 'var(--text-muted)' }}>
              {ratingVal ? `${LABELS[ratingVal]} (${ratingVal}/5)` : 'Select a rating'}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handleSubmitRating} disabled={!ratingVal || saving}>
              {saving ? <><span className="spinner" /> Submitting...</> : (rateStore.userRating ? 'Update Rating' : 'Submit Rating')}
            </button>
            <button className="btn btn-ghost" onClick={() => setRateStore(null)} disabled={saving}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
