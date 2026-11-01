import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api';
import AuthSplit from '../components/AuthSplit';
import { PillLabel, pillInput, pillBtn } from '../ui';

export default function ResendVerification() {
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
      const { data } = await api.post('/auth/resend-verification', { email });
      setMessage(data.message);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit
      heading="Resend"
      accent="verification."
      subtitle="We will email you a fresh verification link."
      panelHeading="One more"
      panelAccent="try."
      panelText="Check your spam folder first. If the email is not there, request a new link here. You can ask for one email per minute."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <PillLabel>Email address</PillLabel>
          <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={pillInput} autoFocus required />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
        <button disabled={loading || !email} className={pillBtn}>{loading ? 'Sending...' : 'Send verification email'}</button>
      </form>
      <p className="mt-6 text-center text-xs text-stone-400">
        Already verified? <Link to="/login" className="text-red-600 font-bold uppercase tracking-widest ml-1 hover:underline">Sign in</Link>
      </p>
    </AuthSplit>
  );
}