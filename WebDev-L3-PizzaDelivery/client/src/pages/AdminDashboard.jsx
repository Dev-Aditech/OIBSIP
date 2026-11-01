import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShoppingBag, TrendingUp } from 'lucide-react';
import api, { getError } from '../api';
import { Alert } from '../ui';

export default function AdminDashboard() {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [inv, ord] = await Promise.all([api.get('/inventory/admin'), api.get('/orders/admin/all')]);
      setInventory(inv.data);
      setOrders(ord.data);
      setError('');
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toDateString();
  const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;
  const low = inventory.filter((i) => i.quantity < i.threshold);
  const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  const tiles = [
    { label: 'Orders today', value: ordersToday, icon: ShoppingBag, tint: 'bg-blue-100 text-blue-600' },
    { label: 'Items low on stock', value: low.length, icon: AlertTriangle, tint: 'bg-amber-100 text-amber-600' },
    { label: 'Total revenue', value: `₹${revenue}`, icon: TrendingUp, tint: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-serif">Overview</h1>
        <p className="text-xs text-stone-500 mt-1">Paid orders and stock levels at a glance.</p>
      </div>

      {error && <Alert>{error}</Alert>}
      {loading && <p className="text-sm text-stone-500">Loading...</p>}

      <div className="grid md:grid-cols-3 gap-6">
        {tiles.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
            <span className={`w-12 h-12 rounded-xl flex items-center justify-center ${tint}`}><Icon className="w-6 h-6" /></span>
            <div>
              <span className="text-xs text-stone-500 font-medium">{label}</span>
              <p className="text-2xl font-black">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Low stock</h2>
            <Link to="/admin/inventory" className="text-xs text-red-600 font-semibold hover:underline">Manage</Link>
          </div>
          {low.length === 0 ? (
            <p className="text-sm text-stone-500">Everything is above its threshold.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {low.map((i) => (
                <li key={i._id} className="py-2 flex justify-between text-sm">
                  <span>{i.name} <span className="text-xs text-stone-400">({i.category})</span></span>
                  <span className="font-bold text-red-600">{i.quantity} / {i.threshold}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Recent orders</h2>
            <Link to="/admin/orders" className="text-xs text-red-600 font-semibold hover:underline">Order board</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-stone-500">No paid orders yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {orders.slice(0, 5).map((o) => (
                <li key={o._id} className="py-2 flex justify-between gap-3 text-sm">
                  <span>
                    <span className="font-mono font-bold">#{o._id.slice(-6).toUpperCase()}</span>{' '}
                    <span className="text-stone-500">{o.user?.name}</span>
                  </span>
                  <span className="text-right">
                    <span className="font-bold">₹{o.totalPrice}</span>{' '}
                    <span className="text-xs text-stone-500">{o.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
