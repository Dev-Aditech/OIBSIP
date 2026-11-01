import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getError, suspensionMessage } from '../api';
import { useAuth } from '../AuthContext';
import AuthSplit from '../components/AuthSplit';
import PasswordInput from '../components/PasswordInput';
import { PillLabel, pillInput, pillBtn } from '../ui';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // A message left by the app, for example "Your account is suspended until..."
  const [notice] = useState(() => sessionStorage.getItem('authNotice') || '');
  useEffect(() => { sessionStorage.removeItem('authNotice'); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.code === 'ACCOUNT_SUSPENDED' ? suspensionMessage(data) : getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit
      heading="Sign"
      accent="in."
      subtitle="Enter your details to access your account."
      panelHeading="Welcome back"
      panelAccent="home."
      panelText="Log in to track your orders, reorder your favourite pizzas and manage your delivery addresses."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <PillLabel>Email address</PillLabel>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className={pillInput}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mr-4">
            <PillLabel>Password</PillLabel>
            <Link to="/forgot-password" className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline mb-2">
              Forgot?
            </Link>
          </div>
          <PasswordInput
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {notice && !error && <p role="status" className="text-sm text-amber-700">{notice}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button disabled={loading || !form.email || !form.password} className={pillBtn}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-stone-400 space-y-2">
        <p>
          New to SliceCraft?{' '}
          <Link to="/register" className="text-red-600 font-bold uppercase tracking-widest ml-1 hover:underline">Create an account</Link>
        </p>
        <p>
          No verification email?{' '}
          <Link to="/resend-verification" className="text-red-600 font-semibold hover:underline">Send it again</Link>
        </p>
      </div>
    </AuthSplit>
  );
}