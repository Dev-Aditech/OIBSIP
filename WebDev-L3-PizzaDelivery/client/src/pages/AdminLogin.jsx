import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getError } from '../api';
import { useAuth } from '../AuthContext';
import AuthSplit from '../components/AuthSplit';
import PasswordInput from '../components/PasswordInput';
import { PillLabel, pillInput } from '../ui';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin-login', form);
      login(data.token, data.user);
      navigate('/admin');
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit
      heading="Admin"
      accent="login."
      subtitle="Staff only. Sign in to manage the kitchen."
      panelHeading="Kitchen"
      panelAccent="command."
      panelText="Manage inventory, follow live orders, see your customers and read the sales reports."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <PillLabel>Admin email</PillLabel>
          <input name="email" type="email" autoComplete="username" placeholder="admin@example.com" value={form.email} onChange={handleChange} className={pillInput} autoFocus required />
        </div>
        <div>
          <PillLabel>Password</PillLabel>
          <PasswordInput name="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={handleChange} required />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading || !form.email || !form.password}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 rounded-full px-10 py-3.5 font-bold uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-amber-500/20 transition"
        >
          {loading ? 'Checking...' : 'Sign in'}
        </button>
      </form>
    </AuthSplit>
  );
}