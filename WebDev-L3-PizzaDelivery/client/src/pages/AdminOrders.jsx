import { useEffect, useState } from 'react';
import api, { getError } from '../api';
import SubNav from '../components/SubNav';
import { Alert } from '../ui';

const STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery'];

const FILTERS = [
  ['active', 'In progress'],
  ['received', 'Order Received'],
  ['kitchen', 'In Kitchen'],
  ['delivered', 'Delivered'],
  ['all', 'All'],
];

const MATCH = {
  active: (o) => o.status !== 'Sent to Delivery',
  received: (o) => o.status === 'Order Received',
  kitchen: (o) => o.status === 'In Kitchen',
  delivered: (o) => o.status === 'Sent to Delivery',
  all: () => true,
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    let busy = false;
    let timer;

    const load = async () => {
      if (busy) return;
      if (document.hidden) { // do nothing while the tab is in the background
        timer = setTimeout(load, 10000);
        return;
      }
      busy = true;
      try {
        const { data } = await api.get('/orders/admin/all');
        if (alive) setOrders(data);
      } catch (err) {
        if (alive) setError(getError(err));
      } finally {
        busy = false;
        if (alive) {
          setLoading(false);
          timer = setTimeout(load, 10000); // picks up new orders automatically
        }
      }
    };

    load();
    const onVisible = () => {
      if (!document.hidden) { clearTimeout(timer); load(); }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const changeStatus = async (order, status) => {
    const previous = order.status;
    setError('');
    setOrders((list) => list.map((o) => (o._id === order._id ? { ...o, status } : o)));
    try {
      await api.put(`/orders/${order._id}/status`, { status });
    } catch (err) {
      setOrders((list) => list.map((o) => (o._id === order._id ? { ...o, status: previous } : o)));
      setError(getError(err));
    }
  };

  const tabs = FILTERS.map(([key, label]) => ({ key, label, badge: orders.filter(MATCH[key]).length }));
  const shown = orders.filter(MATCH[filter]);

  return (
    <>
      <SubNav tabs={tabs} value={filter} onChange={setFilter} accent="amber" width="max-w-5xl" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-4">
        <p className="text-xs text-stone-500">Changing a status updates the customer's tracker within seconds.</p>
        {error && <Alert>{error}</Alert>}
        {loading && <p className="text-sm text-stone-500">Loading orders...</p>}
        {!loading && shown.length === 0 && <p className="text-sm text-stone-500">No orders in this view.</p>}

        <div className="space-y-4">
          {shown.map((o) => (
            <div key={o._id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-x-3">
                  <span className="font-mono font-bold text-base">#{o._id.slice(-6).toUpperCase()}</span>
                  <span className="text-sm font-semibold">{o.user?.name ?? 'Deleted customer'}</span>
                  <span className="text-xs text-stone-400">{o.user?.email}</span>
                </div>
                <p className="text-xs text-stone-500">{o.quantity} x {o.items.map((i) => i.name).join(', ')}</p>
                {o.deliveryAddress && <p className="text-xs text-stone-500">Deliver to: {o.deliveryAddress}</p>}
                <p className="text-xs text-stone-400">
                  {new Date(o.createdAt).toLocaleString()} · <span className="font-bold text-stone-900">₹{o.totalPrice}</span>
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-stone-700">
                Status
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o, e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}