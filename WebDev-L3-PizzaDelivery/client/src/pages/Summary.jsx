import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Shield } from 'lucide-react';
import api, { getError } from '../api';
import { useAuth } from '../AuthContext';
import { usePizza } from '../PizzaContext';
import { loadRazorpay } from '../razorpay';
import { Alert } from '../ui';

const LABELS = { base: 'Crust', sauce: 'Sauce', cheese: 'Cheese', veggie: 'Vegetable' };

export default function Summary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selection, quantity, setQuantity, chosen, unitPrice } = usePizza();
  const [orderId, setOrderId] = useState(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [addresses, setAddresses] = useState(null);
  const [addressId, setAddressId] = useState('');
  const [wishName, setWishName] = useState('My custom pizza');

  useEffect(() => {
    api
      .get('/addresses')
      .then(({ data }) => {
        setAddresses(data);
        if (data[0]) setAddressId(data[0]._id); // the default address comes first
      })
      .catch(() => setAddresses([]));
  }, []);

  if (!selection.baseId || !selection.sauceId || !selection.cheeseId || chosen.length < 3) {
    return <Navigate to="/build" replace />;
  }

  const total = unitPrice * quantity;
  const changeQty = (q) => {
    setQuantity(Math.min(10, Math.max(1, q)));
    setOrderId(null); // a different quantity needs a new order
  };
  const finish = (state) => navigate('/payment/result', { state });

  const saveToWishlist = async () => {
    setError('');
    setNotice('');
    try {
      await api.post('/wishlist', { ...selection, name: wishName });
      setNotice('Saved to your wishlist');
    } catch (err) {
      setError(getError(err));
    }
  };

  const pay = async () => {
    setError('');
    setNotice('');
    setPaying(true);
    try {
      let id = orderId;
      if (!id) {
        const { data } = await api.post('/orders', { ...selection, quantity, addressId });
        id = data._id;
        setOrderId(id);
      }
      const { data: p } = await api.post('/payments/create', { orderId: id });

      if (p.mode === 'mock') {
        const { data } = await api.post('/payments/mock-confirm', { orderId: id, success: true });
        return finish({ status: 'success', order: data.order });
      }

      await loadRazorpay();
      const rzp = new window.Razorpay({
        key: p.keyId,
        amount: p.amount,
        currency: p.currency,
        order_id: p.razorpayOrderId,
        name: 'SliceCraft',
        description: 'Custom pizza order',
        prefill: { name: user.name, email: user.email },
        theme: { color: '#dc2626' },
        handler: async (response) => {
          try {
            const { data } = await api.post('/payments/verify', { orderId: id, ...response });
            finish({ status: 'success', order: data.order });
          } catch (err) {
            finish({ status: 'failure', message: getError(err) });
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.on('payment.failed', (r) => finish({ status: 'failure', message: r.error?.description }));
      rzp.open();
    } catch (err) {
      if (err.response?.status === 409) setOrderId(null);
      setError(getError(err));
      setPaying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-stone-900 text-white p-5">
          <h2 className="text-xl font-bold font-serif">Order summary</h2>
          <p className="text-xs text-stone-400">Check your pizza before paying</p>
        </div>
        <div className="p-6 space-y-4">
          <ul className="divide-y divide-stone-100">
            {chosen.map((item) => (
              <li key={item._id} className="py-2.5 flex justify-between text-sm">
                <span><span className="font-semibold">{LABELS[item.category]}:</span> {item.name}</span>
                <span className="font-mono text-stone-600">₹{item.price}</span>
              </li>
            ))}
          </ul>
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold mb-1">Quantity (1 to 10)</span>
              <div className="flex items-center gap-2">
                <button onClick={() => changeQty(quantity - 1)} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold">-</button>
                <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                <button onClick={() => changeQty(quantity + 1)} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold">+</button>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xs text-stone-500">Price per pizza: ₹{unitPrice}</span>
              <span className="block text-2xl font-extrabold">₹{total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600" /> Delivery address</h3>
        {addresses === null ? (
          <p className="text-sm text-stone-500">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-stone-600">
            You have no saved address. <Link to="/addresses" className="text-red-600 font-semibold underline">Add one</Link> to continue.
          </p>
        ) : (
          <select
            value={addressId}
            onChange={(e) => { setAddressId(e.target.value); setOrderId(null); }}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
          >
            {addresses.map((a) => (
              <option key={a._id} value={a._id}>{a.label}: {a.line}, {a.city}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <input
          value={wishName}
          onChange={(e) => setWishName(e.target.value)}
          maxLength={60}
          className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm"
        />
        <button onClick={saveToWishlist} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-red-600" /> Save to wishlist
        </button>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/build" className="sm:w-1/3 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs text-center">
          Edit pizza
        </Link>
        <button
          onClick={pay}
          disabled={paying || !addressId}
          className="sm:w-2/3 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" /> {paying ? 'Opening payment...' : `Pay now (₹${total})`}
        </button>
      </div>
    </div>
  );
}