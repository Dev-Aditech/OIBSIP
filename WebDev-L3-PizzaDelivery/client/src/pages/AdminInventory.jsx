import { useEffect, useState } from 'react';
import api, { getError } from '../api';
import SubNav from '../components/SubNav';
import { Alert } from '../ui';

const CATEGORIES = [
  ['base', 'Crusts'],
  ['sauce', 'Sauces'],
  ['cheese', 'Cheeses'],
  ['veggie', 'Vegetables'],
];
const FIELDS = ['price', 'threshold', 'quantity'];

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('base');
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .get('/inventory/admin')
      .then(({ data }) => { if (alive) { setItems(data); setError(''); } })
      .catch((err) => { if (alive) setError(getError(err)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const value = (item, field) => draft[item._id]?.[field] ?? item[field];
  const setField = (item, field, v) =>
    setDraft((d) => ({ ...d, [item._id]: { ...d[item._id], [field]: v } }));
  const valid = (item) => FIELDS.every((f) => value(item, f) !== '' && Number(value(item, f)) >= 0);
  const dirty = (item) => FIELDS.some((f) => draft[item._id]?.[f] !== undefined && Number(draft[item._id][f]) !== item[f]);

  const save = async (item) => {
    setError('');
    setNotice('');
    setSavingId(item._id);
    try {
      const body = {};
      FIELDS.forEach((f) => {
        if (draft[item._id]?.[f] !== undefined) body[f] = Number(draft[item._id][f]);
      });
      const { data } = await api.put(`/inventory/${item._id}`, body);
      setItems((prev) => prev.map((i) => (i._id === item._id ? data : i)));
      setDraft((d) => {
        const rest = { ...d };
        delete rest[item._id];
        return rest;
      });
      setNotice(`${item.name} updated`);
    } catch (err) {
      setError(getError(err));
    } finally {
      setSavingId(null);
    }
  };

  // The badge on each tab counts the items that are low on stock
  const tabs = CATEGORIES.map(([key, label]) => ({
    key,
    label,
    badge: items.filter((i) => i.category === key && i.quantity < i.threshold).length,
    tone: 'red',
  }));

  const numberInput = 'w-20 px-2 py-1 border border-stone-300 rounded text-sm';
  const rows = items.filter((i) => i.category === tab);

  return (
    <>
      <SubNav tabs={tabs} value={tab} onChange={setTab} accent="amber" width="max-w-6xl" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-4">
        <p className="text-xs text-stone-500">
          Red rows are below their threshold. An email alert is sent once per item until it is restocked.
        </p>
        {error && <Alert>{error}</Alert>}
        {notice && <Alert type="success">{notice}</Alert>}
        {loading && <p className="text-sm text-stone-500">Loading inventory...</p>}

        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase border-b border-stone-200">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Price (₹)</th>
                  <th className="p-3">Alert below</th>
                  <th className="p-3">In stock</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((item) => {
                  const isLow = item.quantity < item.threshold;
                  return (
                    <tr key={item._id} className={isLow ? 'bg-red-50' : ''}>
                      <td className="p-3 font-semibold">
                        {item.name}
                        {item.quantity === 0 ? (
                          <span className="ml-2 px-1.5 py-0.5 bg-stone-700 text-white text-[10px] font-bold rounded uppercase">Out of stock</span>
                        ) : isLow ? (
                          <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded uppercase">Low stock</span>
                        ) : null}
                      </td>
                      {FIELDS.map((f) => (
                        <td key={f} className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={value(item, f)}
                            onChange={(e) => setField(item, f, e.target.value)}
                            className={numberInput}
                          />
                        </td>
                      ))}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => setField(item, 'quantity', String(Number(value(item, 'quantity') || 0) + 10))}
                          className="mr-2 px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-xs font-bold"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => save(item)}
                          disabled={!dirty(item) || !valid(item) || savingId === item._id}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-xs font-bold"
                        >
                          {savingId === item._id ? 'Saving...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && rows.length === 0 && <p className="p-6 text-sm text-stone-500">No items in this category.</p>}
        </section>
      </div>
    </>
  );
}