import { useEffect, useState } from 'react';
import api, { getError } from '../api';
import { Alert, Label, inputCls } from '../ui';

const PRESETS = [
  { label: '15 minutes', amount: '15', unit: 'minutes' },
  { label: '1 hour', amount: '1', unit: 'hours' },
  { label: '24 hours', amount: '24', unit: 'hours' },
  { label: '7 days', amount: '7', unit: 'days' },
];

function Modal({ title, onClose, busy, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => !busy && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <h2 className="text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(null);
  const [search, setSearch] = useState('');
  const [version, setVersion] = useState(0); // bump this to reload the list
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [modal, setModal] = useState(null); // { type: 'suspend' | 'delete', customer }
  const [form, setForm] = useState({ amount: '30', unit: 'minutes', reason: '' });
  const [modalError, setModalError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get('/admin/customers')
      .then(({ data }) => { if (alive) setCustomers(data); })
      .catch((err) => { if (alive) { setError(getError(err)); setCustomers((c) => c ?? []); } });
    return () => { alive = false; };
  }, [version]);

  const q = search.trim().toLowerCase();
  const shown = (customers || []).filter((c) => c.name.toLowerCase().includes(q) || c.email.includes(q));
  const date = (d) => (d ? new Date(d).toLocaleDateString() : '-');

  const openModal = (type, customer) => {
    setForm({ amount: '30', unit: 'minutes', reason: '' });
    setModalError('');
    setModal({ type, customer });
  };
  const closeModal = () => setModal(null);

  const suspend = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isInteger(amount) || amount < 1) {
      setModalError('Enter a whole number of 1 or more');
      return;
    }
    setBusy(true);
    setModalError('');
    try {
      await api.put(`/admin/customers/${modal.customer._id}/suspend`, { amount, unit: form.unit, reason: form.reason });
      setNotice(`${modal.customer.name} is suspended for ${amount} ${form.unit}`);
      setModal(null);
      setVersion((v) => v + 1);
    } catch (err) {
      setModalError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setModalError('');
    try {
      await api.delete(`/admin/customers/${modal.customer._id}`);
      setNotice(`${modal.customer.name} was deleted`);
      setModal(null);
      setVersion((v) => v + 1);
    } catch (err) {
      setModalError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const unsuspend = async (customer) => {
    setError('');
    setNotice('');
    try {
      await api.put(`/admin/customers/${customer._id}/unsuspend`);
      setNotice(`${customer.name} can log in again`);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(getError(err));
    }
  };

  const small = 'px-2.5 py-1 rounded-lg text-xs font-bold border transition';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-stone-500">
          {customers ? `${customers.length} registered customers` : 'Loading...'} · Suspended customers are signed out at once and cannot log in until the time ends.
        </p>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className={`${inputCls} sm:max-w-xs`} />
      </div>
      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm">
        {/* The table scrolls inside this box, and its heading row stays visible */}
        <div className="max-h-[calc(100dvh-17rem)] min-h-48 overflow-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-stone-50 text-stone-500 text-xs uppercase shadow-[0_1px_0_0_#e7e5e4]">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Status</th>
                <th className="p-3">Orders</th>
                <th className="p-3">Spent</th>
                <th className="p-3">Last order</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {shown.map((c) => (
                <tr key={c._id} className={c.suspended ? 'bg-amber-50/60' : ''}>
                  <td className="p-3">
                    <span className="block font-semibold">{c.name}</span>
                    <span className="text-xs text-stone-400">{c.email}</span>
                  </td>
                  <td className="p-3 space-y-1">
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-full ${c.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                      {c.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    {c.suspended && (
                      <span className="block">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-200 text-amber-900">Suspended</span>
                        <span className="block text-[11px] text-stone-500 mt-0.5">until {new Date(c.suspendedUntil).toLocaleString()}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-bold">{c.orders}</td>
                  <td className="p-3 font-bold">₹{c.spent}</td>
                  <td className="p-3 text-stone-500">{date(c.lastOrderAt)}</td>
                  <td className="p-3 text-stone-500">{date(c.createdAt)}</td>
                  <td className="p-3 whitespace-nowrap space-x-2">
                    {c.suspended ? (
                      <button onClick={() => unsuspend(c)} className={`${small} border-emerald-300 text-emerald-700 hover:bg-emerald-50`}>Unsuspend</button>
                    ) : (
                      <button onClick={() => openModal('suspend', c)} className={`${small} border-amber-300 text-amber-700 hover:bg-amber-50`}>Suspend</button>
                    )}
                    <button onClick={() => openModal('delete', c)} className={`${small} border-red-300 text-red-600 hover:bg-red-50`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers && shown.length === 0 && <p className="p-6 text-sm text-stone-500">No customers match.</p>}
        </div>
      </div>

      {modal?.type === 'suspend' && (
        <Modal title={`Suspend ${modal.customer.name}`} onClose={closeModal} busy={busy}>
          <form onSubmit={suspend} className="space-y-4">
            {modalError && <Alert>{modalError}</Alert>}
            <div>
              <Label>Quick choices</Label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => setForm({ ...form, amount: p.amount, unit: p.unit })}
                    className={`${small} ${form.amount === p.amount && form.unit === p.unit ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-300 text-stone-700 hover:bg-stone-100'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Length</Label>
                <input type="number" min="1" step="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} required />
              </div>
              <div>
                <Label>Unit</Label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputCls}>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Reason (optional, shown to the customer)</Label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} maxLength={200} className={inputCls} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeModal} disabled={busy} className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-sm font-semibold">Cancel</button>
              <button disabled={busy} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 text-sm font-bold">
                {busy ? 'Suspending...' : 'Suspend'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title={`Delete ${modal.customer.name}?`} onClose={closeModal} busy={busy}>
          <div className="space-y-4 text-sm text-stone-600">
            {modalError && <Alert>{modalError}</Alert>}
            <p>
              This removes the account, saved addresses and wishlist for <strong>{modal.customer.email}</strong>. Their paid orders stay in your sales records.
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} disabled={busy} className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-sm font-semibold text-stone-800">Cancel</button>
              <button onClick={remove} disabled={busy} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold">
                {busy ? 'Deleting...' : 'Delete customer'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}