import { useEffect, useState } from 'react';
import api, { getError } from '../api';
import { Alert, Label, inputCls } from '../ui';

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/settings')
      .then(({ data }) => setForm({ ...data, defaultThreshold: String(data.defaultThreshold) }))
      .catch((err) => setError(getError(err)));
  }, []);

  const run = async (name, fn) => {
    setBusy(name);
    setError('');
    setNotice('');
    try {
      setNotice(await fn());
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy('');
    }
  };

  const save = (e) => {
    e.preventDefault();
    run('save', async () => {
      await api.put('/admin/settings', form);
      return 'Settings saved';
    });
  };

  const applyAll = () => {
    if (!window.confirm(`Set the alert threshold to ${form.defaultThreshold} on every ingredient?`)) return;
    run('apply', async () => {
      const { data } = await api.post('/admin/settings/apply-threshold', { threshold: Number(form.defaultThreshold) });
      return `Threshold updated on ${data.updated} ingredients`;
    });
  };

  const sendTest = () =>
    run('test', async () => {
      const { data } = await api.post('/admin/settings/test-email');
      return data.message;
    });

  const btn = 'px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-60';

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-6">
      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}
      {!form && !error && <p className="text-sm text-stone-500">Loading...</p>}

      {form && (
        <form onSubmit={save} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
          <h2 className="font-bold">Low-stock alerts</h2>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.lowStockEnabled}
              onChange={(e) => setForm({ ...form, lowStockEnabled: e.target.checked })}
              className="w-4 h-4 accent-red-600"
            />
            Send an email when an ingredient falls below its threshold
          </label>

          <div>
            <Label>Send alerts to</Label>
            <input type="email" value={form.alertEmail} onChange={(e) => setForm({ ...form, alertEmail: e.target.value })} className={inputCls} required />
          </div>

          <div>
            <Label>Default threshold (units)</Label>
            <input type="number" min="0" value={form.defaultThreshold} onChange={(e) => setForm({ ...form, defaultThreshold: e.target.value })} className={inputCls} required />
            <p className="text-xs text-stone-500 mt-1">Individual thresholds can still be changed on the Inventory page.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button disabled={busy === 'save'} className={`${btn} bg-red-600 hover:bg-red-700 text-white`}>
              {busy === 'save' ? 'Saving...' : 'Save settings'}
            </button>
            <button type="button" onClick={applyAll} disabled={busy === 'apply'} className={`${btn} bg-stone-100 hover:bg-stone-200 text-stone-800`}>
              Apply threshold to all items
            </button>
            <button type="button" onClick={sendTest} disabled={busy === 'test'} className={`${btn} bg-stone-100 hover:bg-stone-200 text-stone-800`}>
              {busy === 'test' ? 'Sending...' : 'Send test email'}
            </button>
          </div>
          <p className="text-xs text-stone-500">Click Save settings before sending a test email, so it goes to the address above.</p>
        </form>
      )}
    </div>
  );
}