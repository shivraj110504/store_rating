import { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser } from '../../api/users';
import { UserRole } from '../../types';

import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SortableHeader from '../../components/common/SortableHeader';
import { Search, Plus, Eye, EyeOff, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.USER, label: 'Normal User' },
  { value: UserRole.STORE_OWNER, label: 'Store Owner' },
];

function validateUser(f: any) {
  const e: Record<string, string> = {};
  if (!f.name) e.name = 'Name is required';
  else if (f.name.length < 2) e.name = 'Minimum 2 characters';
  else if (f.name.length > 60) e.name = 'Maximum 60 characters';
  if (!f.email || !/\S+@\S+\.\S+/.test(f.email)) e.email = 'Valid email required';
  if (!f.password) e.password = 'Password is required';
  else if (f.password.length < 8 || f.password.length > 16) e.password = 'Must be 8–16 characters';
  else if (!/[A-Z]/.test(f.password)) e.password = 'Must have at least 1 uppercase letter';
  else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(f.password)) e.password = 'Must have at least 1 special character';
  if (!f.address) e.address = 'Address is required';
  else if (f.address.length > 400) e.address = 'Max 400 characters';
  if (!f.role) e.role = 'Role is required';
  return e;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [showCreate, setShowCreate] = useState(false);
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: UserRole.USER });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sortBy, sortOrder };
      if (filter.name) params.name = filter.name;
      if (filter.email) params.email = filter.email;
      if (filter.address) params.address = filter.address;
      if (filter.role) params.role = filter.role;
      const res = await getUsers(params);
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [filter, sortBy, sortOrder]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setFormErrors(p => ({ ...p, [k]: '' }));
  };

  const resetCreate = () => {
    setForm({ name: '', email: '', password: '', address: '', role: UserRole.USER });
    setFormErrors({});
    setShowPw(false);
    setShowCreate(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateUser(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      await createUser(form);
      toast.success('User created successfully');
      resetCreate();
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create user');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h2>Users</h2>
          <p>Manage all platform users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="toolbar">
        {[
          { k: 'name', pl: 'Search by name' },
          { k: 'email', pl: 'Search by email' },
          { k: 'address', pl: 'Search by address' },
        ].map(({ k, pl }) => (
          <div className="search-input-wrap" key={k} style={{ maxWidth: 200 }}>
            <Search />
            <input className="form-input" placeholder={pl}
              value={(filter as any)[k]}
              onChange={e => setFilter(p => ({ ...p, [k]: e.target.value }))} />
          </div>
        ))}
        <select className="form-select" style={{ width: 160 }}
          value={filter.role}
          onChange={e => setFilter(p => ({ ...p, role: e.target.value }))}>
          {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        users.length === 0 ? (
          <div className="empty-state"><Users /><p>No users found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Address" field="address" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Role" field="role" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address}</td>
                    <td><Badge role={u.role} /></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewUser(u)}>
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Create User Modal */}
      {showCreate && (
        <Modal title="Add New User" onClose={resetCreate}>
          <form onSubmit={handleCreate} noValidate>
            <div className="form-group">
              <label>Full Name</label>
              <input className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                type="text" placeholder="User's full name" value={form.name} onChange={setField('name')} />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                type="email" placeholder="user@example.com" value={form.email} onChange={setField('email')} />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <input className={`form-input ${formErrors.password ? 'input-error' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="8–16 chars, 1 uppercase, 1 special"
                  value={form.password} onChange={setField('password')} />
                <button type="button" className="input-icon-btn" onClick={() => setShowPw(p => !p)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.password && <div className="form-error">{formErrors.password}</div>}
              <div className="form-hint">8–16 chars · 1 uppercase · 1 special character (!@#$%...)</div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className={`form-input ${formErrors.address ? 'input-error' : ''}`}
                rows={2} placeholder="User's address" value={form.address}
                onChange={setField('address')} />
              {formErrors.address && <div className="form-error">{formErrors.address}</div>}
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="form-select" value={form.role} onChange={setField('role')}>
                <option value={UserRole.USER}>Normal User</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.STORE_OWNER}>Store Owner</option>
              </select>
              {(form.role as string) === 'store_owner' && (
                <div className="form-hint">After creating, go to Stores → Add Store to assign this owner a store.</div>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" /> Creating...</> : 'Create User'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetCreate}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* View User Modal */}
      {viewUser && (
        <Modal title="User Details" onClose={() => setViewUser(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {([
              ['Full Name', viewUser.name],
              ['Email', viewUser.email],
              ['Address', viewUser.address],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <div className="text-muted text-sm" style={{ marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 500 }}>{value}</div>
              </div>
            ))}
            <div>
              <div className="text-muted text-sm" style={{ marginBottom: 4 }}>Role</div>
              <Badge role={viewUser.role} />
            </div>
            {(viewUser as any).role === UserRole.STORE_OWNER && (
              <div>
                <div className="text-muted text-sm" style={{ marginBottom: 4 }}>Assigned Store</div>
                {viewUser.store
                  ? <div style={{ fontWeight: 500 }}>{viewUser.store.name}</div>
                  : <span className="text-muted text-sm">No store assigned yet</span>
                }
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
