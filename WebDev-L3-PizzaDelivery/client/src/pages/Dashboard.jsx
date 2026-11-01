import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { usePizza } from '../PizzaContext';
import { PRESETS } from '../presets';
import { Alert } from '../ui';
import WelcomeBanner from '../components/WelcomeBanner';

const chip = (status) =>
  status === 'Sent to Delivery' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, reload, presetSelection, setSelection, setQuantity } = usePizza();
  const [orders, setOrders] = useState(null); // null while loading

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  }, []);

  const paid = (orders || []).filter((o) => o.paymentStatus === 'paid');
  const delivered = paid.filter((o) => o.status === 'Sent to Delivery').length;
  const live = paid.find((o) => o.status !== 'Sent to Delivery'); // newest order still in progress
  const spent = paid.reduce((sum, o) => sum + o.totalPrice, 0);
  const show = (value) => (orders === null ? '-' : value);

  const stats = [
    ['Total orders', show(paid.length)],
    ['In progress', show(paid.length - delivered)],
    ['Delivered', show(delivered)],
    ['Total spent', show(`₹${spent}`)],
  ];

  const choose = (preset, to) => {
    setSelection(preset.selection);
    setQuantity(1);
    navigate(to);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <WelcomeBanner name={user.name.split(' ')[0]} live={live} loading={orders === null} />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <span className="block text-2xl font-bold text-stone-900 mb-3">{value}</span>
            <span className="text-xs font-bold text-stone-400 tracking-wider uppercase">{label}</span>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-stone-900">Recent orders</h3>
          <Link to="/orders" className="text-xs text-red-600 font-semibold hover:underline">View all →</Link>
        </div>
        {paid.length === 0 ? (
          <p className="text-sm text-stone-500 py-4">{orders === null ? 'Loading...' : 'No orders yet. Build your first pizza!'}</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {paid.slice(0, 3).map((o) => (
              <li key={o._id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <span className="font-mono font-bold">#{o._id.slice(-6).toUpperCase()}</span>
                  <span className="block text-xs text-stone-500 truncate">{o.quantity} x {o.items.map((i) => i.name).join(', ')}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="block font-bold">₹{o.totalPrice}</span>
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${chip(o.status)}`}>{o.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold font-serif mb-1">Signature pizzas</h2>
        <p className="text-stone-500 text-xs mb-6">Prices are calculated from today's ingredient prices.</p>

        {error && (
          <div className="mb-4 space-y-2">
            <Alert>{error}</Alert>
            <button onClick={reload} className="text-xs text-red-600 underline">Try again</button>
          </div>
        )}
        {loading && <p className="text-sm text-stone-500">Loading menu...</p>}

        <div className="grid md:grid-cols-3 gap-6">
          {!loading && PRESETS.map((p) => {
            const r = presetSelection(p);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
                <div className="h-44 relative">
                  <img src={`https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=480&q=75`} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  {r && <span className="absolute top-3 right-3 bg-stone-900/90 text-amber-400 font-bold px-2.5 py-1 rounded-full text-xs">₹{r.price}</span>}
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-amber-600">{p.tag}</span>
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <p className="text-stone-500 text-xs mt-1">{p.text}</p>
                  </div>
                  {r ? (
                    <div className="flex gap-2">
                      <button onClick={() => choose(r, '/summary')} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg">Order now</button>
                      <button onClick={() => choose(r, '/build')} className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs rounded-lg">Customize</button>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-red-600">Currently unavailable (an ingredient is out of stock)</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}