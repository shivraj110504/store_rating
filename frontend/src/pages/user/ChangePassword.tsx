import { useState } from 'react';
import { updatePassword } from '../../api/users';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

function validate(f: any) {
  const e: Record<string, string> = {};
  if (!f.currentPassword) e.currentPassword = 'Current password is required';
  if (!f.newPassword) e.newPassword = 'New password is required';
  else if (f.newPassword.length < 8 || f.newPassword.length > 16) e.newPassword = 'Must be 8–16 characters';
  else if (!/[A-Z]/.test(f.newPassword)) e.newPassword = 'Must contain at least 1 uppercase letter';
  else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(f.newPassword)) e.newPassword = 'Must contain at least 1 special character';
  if (!f.confirmPassword) e.confirmPassword = 'Please confirm your new password';
  else if (f.confirmPassword !== f.newPassword) e.confirmPassword = 'Passwords do not match';
  return e;
}

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const toggle = (k: 'current' | 'newPw' | 'confirm') => setShow(p => ({ ...p, [k]: !p[k] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to update password');
    } finally { setLoading(false); }
  };

  const fields = [
    { k: 'currentPassword', label: 'Current Password', toggle: 'current' as const, show: show.current },
    { k: 'newPassword', label: 'New Password', toggle: 'newPw' as const, show: show.newPw, hint: '8–16 chars · 1 uppercase · 1 special character' },
    { k: 'confirmPassword', label: 'Confirm New Password', toggle: 'confirm' as const, show: show.confirm },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Change Password</h2>
        <p>Update your account password</p>
      </div>
      <div className="card" style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={20} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Security Settings</div>
            <div className="text-muted text-sm">Choose a strong password to protect your account</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {fields.map(({ k, label, toggle: t, show: s, hint }) => (
            <div className="form-group" key={k}>
              <label>{label}</label>
              <div className="input-icon-wrap">
                <input
                  className={`form-input ${errors[k] ? 'input-error' : ''}`}
                  type={s ? 'text' : 'password'}
                  value={(form as any)[k]}
                  onChange={set(k)}
                  autoComplete={k === 'currentPassword' ? 'current-password' : 'new-password'}
                />
                <button type="button" className="input-icon-btn" onClick={() => toggle(t)}>
                  {s ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors[k] && <div className="form-error">{errors[k]}</div>}
              {hint && !errors[k] && <div className="form-hint">{hint}</div>}
            </div>
          ))}
          <button className="btn btn-primary mt-1" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
