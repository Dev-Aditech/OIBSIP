import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getError } from '../api';
import AuthSplit from '../components/AuthSplit';
import PasswordInput from '../components/PasswordInput';
import PasswordRules from '../components/PasswordRules';
import { PillLabel, pillBtn } from '../ui';
import { passwordIsValid } from '../passwordRules';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const matches = password === confirm;
  const canSubmit = passwordIsValid(password) && matches;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(data.message);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit
      heading="Set a new"
      accent="password."
      subtitle="Choose a strong password you have not used before."
      panelHeading="Fresh"
      panelAccent="start."
      panelText="Pick a password that meets every rule on the checklist, then sign in again."
    >
      {message ? (
        <div className="space-y-6">
          <p role="status" className="text-sm text-emerald-700">{message}</p>
          <Link to="/login" className={`${pillBtn} block text-center`}>Go to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <PillLabel>New password</PillLabel>
            <PasswordInput placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={72} autoComplete="new-password" autoFocus required />
            <PasswordRules password={password} />
          </div>
          <div>
            <PillLabel>Confirm new password</PillLabel>
            <PasswordInput placeholder="Type the password again" value={confirm} onChange={(e) => setConfirm(e.target.value)} maxLength={72} autoComplete="new-password" required />
            {confirm && !matches && <p className="text-xs text-red-600 ml-4 mt-1.5">Passwords do not match.</p>}
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button disabled={loading || !canSubmit} className={pillBtn}>{loading ? 'Saving...' : 'Reset password'}</button>
        </form>
      )}
    </AuthSplit>
  );
}