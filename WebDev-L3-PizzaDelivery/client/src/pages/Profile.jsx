import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import api, { getError } from '../api';
import { useAuth } from '../AuthContext';
import SubNav from '../components/SubNav';
import PasswordInput from '../components/PasswordInput';
import PasswordRules from '../components/PasswordRules';
import { Alert, Label, inputCls, btnCls } from '../ui';
import { isValidPhone, passwordIsValid } from '../passwordRules';

const TABS = [
  { key: 'details', label: 'Personal details' },
  { key: 'security', label: 'Security' },
];

function Notice({ note }) {
  return note.text ? <Alert type={note.type}>{note.text}</Alert> : null;
}

export default function Profile() {
  const { updateUser } = useAuth();
  const [tab, setTab] = useState('details');
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [detailsNote, setDetailsNote] = useState({ type: 'success', text: '' });

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwNote, setPwNote] = useState({ type: 'success', text: '' });

  useEffect(() => {
    let alive = true;
    (async () => {
      const [m, o, a, w] = await Promise.allSettled([
        api.get('/auth/me'),
        api.get('/orders/my'),
        api.get('/addresses'),
        api.get('/wishlist'),
      ]);
      if (!alive) return;
      if (m.status === 'rejected') {
        setLoadError(getError(m.reason));
        return;
      }
      const profile = m.value.data;
      setMe(profile);
      setForm({ name: profile.name, phone: profile.phone || '' });

      const paid = o.status === 'fulfilled' ? o.value.data.filter((x) => x.paymentStatus === 'paid') : [];
      setStats({
        orders: paid.length,
        spent: paid.reduce((sum, x) => sum + x.totalPrice, 0),
        addresses: a.status === 'fulfilled' ? a.value.data.length : 0,
        wishlist: w.status === 'fulfilled' ? w.value.data.length : 0,
      });
    })();
    return () => { alive = false; };
  }, []);

  const changed = me && (form.name.trim() !== me.name || form.phone.trim() !== (me.phone || ''));
  const detailsValid = Boolean(form.name.trim()) && isValidPhone(form.phone);

  const saveDetails = async (e) => {
    e.preventDefault();
    setDetailsNote({ type: 'success', text: '' });
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      setMe(data);
      setForm({ name: data.name, phone: data.phone || '' });
      updateUser({ name: data.name });
      setDetailsNote({ type: 'success', text: 'Your details were saved.' });
    } catch (err) {
      setDetailsNote({ type: 'error', text: getError(err) });
    } finally {
      setSaving(false);
    }
  };

  const pwMatches = pw.next === pw.confirm;
  const pwValid = Boolean(pw.current) && passwordIsValid(pw.next) && pwMatches;

  const changePassword = async (e) => {
    e.preventDefault();
    if (!pwValid) return;
    setPwNote({ type: 'success', text: '' });
    setPwSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: '', next: '', confirm: '' });
      setPwNote({ type: 'success', text: 'Your password was changed.' });
    } catch (err) {
      setPwNote({ type: 'error', text: getError(err) });
    } finally {
      setPwSaving(false);
    }
  };

  const tiles = stats && [
    { label: 'Orders', value: stats.orders, to: '/orders' },
    { label: 'Total spent', value: `₹${stats.spent}`, to: '/orders' },
    { label: 'Addresses', value: stats.addresses, to: '/addresses' },
    { label: 'Wishlist', value: stats.wishlist, to: '/wishlist' },
  ];

  return (
    <>
      <SubNav tabs={TABS} value={tab} onChange={setTab} accent="red" width="max-w-4xl" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {loadError && <Alert>{loadError}</Alert>}
        {!me && !loadError && <p className="text-sm text-stone-500">Loading...</p>}

        {me && tab === 'details' && (
          <>
            <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-5">
              <span className="w-20 h-20 shrink-0 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center text-3xl font-bold">
                {me.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">{me.name}</h2>
                <p className="text-sm text-stone-500 break-all">{me.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {me.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Email verified
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full">
                    Member since {new Date(me.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(tiles || [1, 2, 3, 4].map((n) => ({ label: '', value: '-', to: '#', n }))).map((t, i) => (
                <Link key={t.label || i} to={t.to} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-red-300 transition">
                  <span className="block text-2xl font-bold">{t.value}</span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.label || 'Loading'}</span>
                </Link>
              ))}
            </section>

            <form onSubmit={saveDetails} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold">Edit your details</h3>
              <Notice note={detailsNote} />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full name</Label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} className={inputCls} required />
                </div>
                <div>
                  <Label>Phone number</Label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} required />
                  {form.phone && !isValidPhone(form.phone) && <p className="text-xs text-red-600 mt-1">Enter a valid phone number (7 to 15 digits).</p>}
                </div>
              </div>
              <div>
                <Label>Email address</Label>
                <input value={me.email} disabled className={`${inputCls} bg-stone-100 text-stone-500 cursor-not-allowed`} />
                <p className="text-xs text-stone-400 mt-1">Your email cannot be changed because it is your login.</p>
              </div>
              <button disabled={saving || !changed || !detailsValid} className={`${btnCls} sm:w-auto sm:px-8`}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </>
        )}

        {me && tab === 'security' && (
          <div className="grid lg:grid-cols-5 gap-6">
            <form onSubmit={changePassword} className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold">Change password</h3>
              <Notice note={pwNote} />
              <div>
                <Label>Current password</Label>
                <PasswordInput className={inputCls} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" required />
              </div>
              <div>
                <Label>New password</Label>
                <PasswordInput className={inputCls} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} maxLength={72} autoComplete="new-password" required />
                <PasswordRules password={pw.next} />
              </div>
              <div>
                <Label>Confirm new password</Label>
                <PasswordInput className={inputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} maxLength={72} autoComplete="new-password" required />
                {pw.confirm && !pwMatches && <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>}
              </div>
              <button disabled={pwSaving || !pwValid} className={`${btnCls} sm:w-auto sm:px-8`}>
                {pwSaving ? 'Updating...' : 'Update password'}
              </button>
            </form>

            <aside className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3 h-fit">
              <h3 className="font-bold">Account security</h3>
              <ul className="text-sm space-y-2">
                <li className="flex justify-between gap-3"><span className="text-stone-500">Email</span><span className={me.isVerified ? 'font-semibold text-emerald-700' : 'font-semibold text-red-600'}>{me.isVerified ? 'Verified' : 'Not verified'}</span></li>
                <li className="flex justify-between gap-3"><span className="text-stone-500">Login session</span><span className="font-semibold">7 days</span></li>
                <li className="flex justify-between gap-3"><span className="text-stone-500">Password</span><span className="font-semibold">Encrypted</span></li>
              </ul>
              <p className="text-xs text-stone-400">Passwords are stored as a one-way hash, so nobody (including the admin) can read yours.</p>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}