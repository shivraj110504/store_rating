import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

interface FormData { name: string; email: string; password: string; address: string; }

function validate(f: FormData) {
  const errs: Record<string, string> = {};
  if (!f.name) errs.name = 'Name is required';
  else if (f.name.length < 2) errs.name = 'Name must be at least 2 characters';
  else if (f.name.length > 60) errs.name = 'Name must be at most 60 characters';

  if (!f.email) errs.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(f.email)) errs.email = 'Invalid email address';

  if (!f.password) errs.password = 'Password is required';
  else if (f.password.length < 8 || f.password.length > 16) errs.password = 'Must be 8–16 characters';
  else if (!/[A-Z]/.test(f.password)) errs.password = 'Must contain at least one uppercase letter';
  else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(f.password)) errs.password = 'Must contain at least one special character';

  if (!f.address) errs.address = 'Address is required';
  else if (f.address.length > 400) errs.address = 'Address must be max 400 characters';

  return errs;
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await register(form);
      authLogin(res.data.access_token, res.data.user);
      toast.success('Account created successfully!');
      navigate('/user/stores', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <h1>Rate<span>Hub</span></h1>
          <p>Create your account</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <input
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Your full name"
              autoComplete="name"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <input
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="8–16 chars, 1 uppercase, 1 special"
                autoComplete="new-password"
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
            <div className="form-hint">8–16 characters · at least 1 uppercase · at least 1 special character</div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              className={`form-input ${errors.address ? 'input-error' : ''}`}
              rows={2}
              value={form.address}
              onChange={set('address')}
              placeholder="Your full address"
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>

          <button className="btn btn-primary btn-full mt-2" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>
        <div className="auth-divider">Already have an account?</div>
        <Link to="/login">
          <button className="btn btn-ghost btn-full">Sign In</button>
        </Link>
      </div>
    </div>
  );
}
