import { useEffect, useState, useCallback } from 'react';
import { getStores } from '../../api/stores';

import Modal from '../../components/common/Modal';
import SortableHeader from '../../components/common/SortableHeader';
import StarRating from '../../components/common/StarRating';
import { Search, Plus, Store as StoreIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

function validateStore(f: any) {
  const e: Record<string, string> = {};
  if (!f.name) e.name = 'Name is required';
  else if (f.name.length < 2) e.name = 'Minimum 2 characters';
  else if (f.name.length > 60) e.name = 'Maximum 60 characters';
  if (!f.email || !/\S+@\S+\.\S+/.test(f.email)) e.email = 'Valid email required';
  if (!f.address) e.address = 'Address is required';
  else if (f.address.length > 400) e.address = 'Max 400 characters';
  return e;
}

export default function AdminStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [showCreate, setShowCreate] = useState(false);
  const [availableOwners, setAvailableOwners] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sortBy, sortOrder };
      if (filter.name) params.name = filter.name;
      if (filter.address) params.address = filter.address;
      const res = await getStores(params);
      setStores(res.data);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  }, [filter, sortBy, sortOrder]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const openCreate = async () => {
    try {
      const res = await api.get('/stores/owners');
      setAvailableOwners(res.data);
    } catch { setAvailableOwners([]); }
    setShowCreate(true);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setFormErrors(p => ({ ...p, [k]: '' }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStore(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email, address: form.address };
      if (form.ownerId) payload.ownerId = form.ownerId;
      await api.post('/stores', payload);
      toast.success('Store created successfully');
      setShowCreate(false);
      setForm({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create store');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h2>Stores</h2>
          <p>Manage all registered stores</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Store
        </button>
      </div>

      <div className="toolbar">
        {['name', 'address'].map(k => (
          <div className="search-input-wrap" key={k} style={{ maxWidth: 240 }}>
            <Search />
            <input className="form-input" placeholder={`Search by ${k}`}
              value={(filter as any)[k]}
              onChange={e => setFilter(p => ({ ...p, [k]: e.target.value }))} />
          </div>
        ))}
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        stores.length === 0 ? (
          <div className="empty-state">
            <StoreIcon />
            <p>No stores found. Add your first store.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Address" field="address" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <th>Rating</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s: any) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.email}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</td>
                    <td>
                      <div className="rating-display">
                        <StarRating value={Math.round(s.averageRating ?? 0)} readonly size="sm" />
                        <span className="rating-num">{(s.averageRating ?? 0).toFixed(1)}</span>
                        <span className="rating-count">({s.totalRatings})</span>
                      </div>
                    </td>
                    <td>
                      {s.owner
                        ? <span style={{ color: 'var(--text)' }}>{s.owner.name}</span>
                        : <span className="badge" style={{ background: 'rgba(245,197,24,0.1)', color: 'var(--warning)' }}>Unassigned</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {showCreate && (
        <Modal title="Add New Store" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Store Name</label>
              <input className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                type="text" placeholder="Store name" value={form.name} onChange={setField('name')} />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>
            <div className="form-group">
              <label>Store Email</label>
              <input className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                type="email" placeholder="store@example.com" value={form.email} onChange={setField('email')} />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className={`form-input ${formErrors.address ? 'input-error' : ''}`}
                rows={2} placeholder="Store address" value={form.address}
                onChange={setField('address')} />
              {formErrors.address && <div className="form-error">{formErrors.address}</div>}
            </div>
            <div className="form-group">
              <label>Assign Store Owner <span className="text-muted" style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              {availableOwners.length === 0 ? (
                <div className="form-hint" style={{ marginTop: 4 }}>
                  No unassigned store owners available. Create a store owner user first, then assign here.
                </div>
              ) : (
                <select className="form-select" value={form.ownerId} onChange={setField('ownerId')}>
                  <option value="">— No owner —</option>
                  {availableOwners.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" /> Creating...</> : 'Create Store'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
