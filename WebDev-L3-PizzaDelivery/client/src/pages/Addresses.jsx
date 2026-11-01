import { useCallback, useEffect, useState } from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import api, { getError } from '../api';
import { Alert, Label, inputCls, btnCls } from '../ui';

const EMPTY = { label: 'Home', line: '', city: '', phone: '' };

export default function Addresses() {
  const [addresses, setAddresses] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data);
    } catch (err) {
      setError(getError(err));
      setAddresses([]);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/addresses', form);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const act = async (fn) => {
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 grid lg:grid-cols-5 gap-6">
      <section className="lg:col-span-3 space-y-4">
        {error && <Alert>{error}</Alert>}
        {addresses === null && <p className="text-sm text-stone-500">Loading...</p>}
        {addresses?.length === 0 && <p className="text-sm text-stone-500">You have no saved addresses yet. Add one to order.</p>}

        {addresses?.map((a) => (
          <div key={a._id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex justify-between gap-4">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">
                  {a.label}
                  {a.isDefault && <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">Default</span>}
                </p>
                <p className="text-stone-600">{a.line}, {a.city}</p>
                <p className="text-stone-400 text-xs">{a.phone}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {!a.isDefault && (
                <button onClick={() => act(() => api.put(`/addresses/${a._id}/default`))} className="text-xs text-red-600 font-semibold hover:underline">
                  Make default
                </button>
              )}
              <button onClick={() => act(() => api.delete(`/addresses/${a._id}`))} aria-label="Delete" className="p-1 text-stone-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      <form onSubmit={add} className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4 h-fit">
        <h2 className="font-bold">Add an address</h2>
        <div><Label>Label (Home, Work...)</Label><input name="label" value={form.label} onChange={change} maxLength={30} className={inputCls} required /></div>
        <div><Label>Street address</Label><input name="line" value={form.line} onChange={change} maxLength={200} className={inputCls} required /></div>
        <div><Label>City</Label><input name="city" value={form.city} onChange={change} maxLength={80} className={inputCls} required /></div>
        <div><Label>Phone</Label><input name="phone" value={form.phone} onChange={change} maxLength={20} className={inputCls} required /></div>
        <button disabled={saving} className={btnCls}>{saving ? 'Saving...' : 'Save address'}</button>
      </form>
    </div>
  );
}