import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api';
import AuthSplit from '../components/AuthSplit';
import { PillLabel, pillInput, pillBtn } from '../ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit
      heading="Forgot"
      accent="password?"
      subtitle="Enter your email and we will send you a reset link."
      panelHeading="No worries,"
      panelAccent="it happens."
      panelText="We will email you a secure link to choose a new password. The link stays valid for one hour."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <PillLabel>Email address</PillLabel>
          <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={pillInput} autoFocus required />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
        <button disabled={loading || !email} className={pillBtn}>{loading ? 'Sending...' : 'Send reset link'}</button>
      </form>
      <p className="mt-6 text-center text-xs text-stone-400">
        Remembered it? <Link to="/login" className="text-red-600 font-bold uppercase tracking-widest ml-1 hover:underline">Back to login</Link>
      </p>
    </AuthSplit>
  );
}