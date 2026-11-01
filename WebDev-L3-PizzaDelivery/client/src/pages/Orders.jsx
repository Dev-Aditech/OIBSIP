import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Flame, Truck } from 'lucide-react';
import api, { getError } from '../api';
import SubNav from '../components/SubNav';
import { Alert } from '../ui';

const STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery'];
const ICONS = [Check, Flame, Truck];
const MESSAGES = [
  'We have your order. The kitchen will start soon.',
  'The kitchen is making your pizza right now.',
  'Your pizza is on its way to you!',
];

// An order stays in the "Live order" tab for an hour after it is sent out, so the delivery truck can be seen moving
const DISPATCH_WINDOW = 60 * 60 * 1000;

const circleBase = 'relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-500';

function Stage({ label, i, index }) {
  const Icon = ICONS[i];
  const done = i < index;
  const current = i === index;

  let circle = 'bg-stone-200 text-stone-500';
  if (done) circle = 'bg-emerald-600 text-white';
  if (current && i === 0) circle = 'bg-amber-500 text-white ring-4 ring-amber-100';
  if (current && i === 1) circle = 'bg-orange-50 text-orange-600 ring-4 ring-orange-200';
  if (current && i === 2) circle = 'bg-emerald-600 text-white ring-4 ring-emerald-100';

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative">
        {/* Order Received: a soft ping */}
        {current && i === 0 && (
          <span className="absolute inset-0 rounded-full bg-amber-400/60 animate-ping motion-reduce:animate-none" />
        )}

        {/* In Kitchen: a glowing, flickering flame with sparks rising */}
        {current && i === 1 && (
          <>
            <span className="absolute -inset-1 rounded-full bg-orange-400/40 blur-md animate-pulse motion-reduce:animate-none" />
            <span className="absolute bottom-full left-[30%] h-1.5 w-1.5 rounded-full bg-orange-400 animate-ember motion-reduce:hidden" />
            <span className="absolute bottom-full left-1/2 h-1.5 w-1.5 rounded-full bg-amber-400 animate-ember [animation-delay:0.6s] motion-reduce:hidden" />
            <span className="absolute bottom-full left-[70%] h-1.5 w-1.5 rounded-full bg-red-400 animate-ember [animation-delay:1.2s] motion-reduce:hidden" />
          </>
        )}

        {/* Sent to Delivery: speed lines behind a bouncing truck */}
        {current && i === 2 && (
          <>
            <span className="absolute right-full top-3 mr-1 h-0.5 w-4 rounded bg-emerald-400 animate-speed motion-reduce:hidden" />
            <span className="absolute right-full top-5 mr-1 h-0.5 w-5 rounded bg-emerald-400 animate-speed [animation-delay:0.3s] motion-reduce:hidden" />
            <span className="absolute right-full top-7 mr-1 h-0.5 w-3 rounded bg-emerald-400 animate-speed [animation-delay:0.6s] motion-reduce:hidden" />
          </>
        )}

        <span className={`${circleBase} ${circle}`}>
          <Icon
            className={`h-5 w-5 ${
              current && i === 1 ? 'fill-orange-400 animate-flicker motion-reduce:animate-none' : ''
            } ${current && i === 2 ? 'animate-drive motion-reduce:animate-none' : ''}`}
          />
        </span>
      </div>
      <span className={`text-center text-xs font-bold ${current ? 'text-stone-900' : 'text-stone-500'}`}>{label}</span>
    </div>
  );
}

function Tracker({ status }) {
  const index = Math.max(0, STATUSES.indexOf(status));
  const dispatched = index === STATUSES.length - 1;

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative grid grid-cols-3 py-4">
        {/* The line runs from the centre of the first circle to the centre of the last */}
        <div className="absolute left-[16.667%] right-[16.667%] top-[37px] h-1.5 overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-700"
            style={{ width: dispatched ? '50%' : `${index * 50}%` }}
          />
          {/* Once the order is out for delivery, the road ahead moves under the truck */}
          {dispatched && (
            <div className="absolute inset-y-0 left-1/2 w-1/2 animate-road motion-reduce:animate-none [background-image:repeating-linear-gradient(90deg,#10b981_0,#10b981_10px,transparent_10px,transparent_20px)]" />
          )}
        </div>

        {STATUSES.map((label, i) => (
          <Stage key={label} label={label} i={i} index={index} />
        ))}
      </div>
      <p className="mt-1 text-center text-sm text-stone-600">{MESSAGES[index]}</p>
    </div>
  );
}

const summary = (o) => o.items.map((i) => i.name).join(', ');

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [now, setNow] = useState(0);
  const [tab, setTab] = useState(null); // null until the person picks one
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    let busy = false;
    let timer;

    const load = async () => {
      if (busy) return;
      if (document.hidden) { // do nothing while the tab is in the background
        timer = setTimeout(load, 5000);
        return;
      }
      busy = true;
      let delay = 30000; // quiet when nothing is cooking
      try {
        const { data } = await api.get('/orders/my');
        if (!alive) return;
        setOrders(data);
        setNow(Date.now());
        setError('');
        // check often only while an order is still being made
        if (data.some((o) => o.paymentStatus === 'paid' && o.status !== 'Sent to Delivery')) delay = 5000;
      } catch (err) {
        if (alive) setError(getError(err));
      } finally {
        busy = false;
        if (alive) {
          setLoading(false);
          timer = setTimeout(load, delay);
        }
      }
    };

    load();
    const onVisible = () => {
      if (!document.hidden) { clearTimeout(timer); load(); } // refresh the moment the tab is opened again
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const live = orders.filter(
    (o) =>
      o.paymentStatus === 'paid' &&
      (o.status !== 'Sent to Delivery' || now - new Date(o.updatedAt).getTime() < DISPATCH_WINDOW)
  );
  const current = tab ?? (live.length ? 'live' : 'history');
  const tabs = [
    { key: 'live', label: 'Live order', badge: live.length },
    { key: 'history', label: 'Order history' },
  ];

  return (
    <>
      <SubNav tabs={tabs} value={current} onChange={setTab} accent="red" width="max-w-4xl" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <p className="text-xs text-stone-500">Status updates appear here automatically.</p>
        {error && <Alert>{error}</Alert>}
        {loading && <p className="text-sm text-stone-500">Loading your orders...</p>}

        {current === 'live' && !loading && (
          <>
            {live.length === 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-2">
                <p className="text-sm text-stone-600">You have no live orders right now.</p>
                <Link to="/build" className="text-sm text-red-600 font-semibold hover:underline">Build a pizza</Link>
              </div>
            )}
            {live.map((o) => (
              <div key={o._id} className="bg-white rounded-2xl border-2 border-amber-400 p-6 shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase">Live order</span>
                    <h3 className="text-lg font-bold">Order #{o._id.slice(-6).toUpperCase()}</h3>
                  </div>
                  <span className="text-xs text-stone-400">{new Date(o.createdAt).toLocaleString()}</span>
                </div>
                <Tracker status={o.status} />
                <div className="mt-3 p-3 bg-amber-50 rounded-xl text-amber-900 text-xs flex justify-between gap-3">
                  <span>{o.quantity} x {summary(o)}</span>
                  <span className="font-bold whitespace-nowrap">₹{o.totalPrice}</span>
                </div>
                {o.deliveryAddress && <p className="mt-2 text-xs text-stone-500">Delivering to: {o.deliveryAddress}</p>}
              </div>
            ))}
          </>
        )}

        {current === 'history' && !loading && (
          orders.length === 0 ? (
            <p className="text-sm text-stone-500">You have not placed an order yet.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <ul className="divide-y divide-stone-100">
                {orders.map((o) => {
                  const paid = o.paymentStatus === 'paid';
                  return (
                    <li key={o._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">#{o._id.slice(-6).toUpperCase()}</span>
                          <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                            !paid ? 'bg-stone-100 text-stone-600'
                            : o.status === 'Sent to Delivery' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {paid ? o.status : o.paymentStatus === 'failed' ? 'Payment failed' : 'Awaiting payment'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">{o.quantity} x {summary(o)}</p>
                        <span className="text-[11px] text-stone-400">{new Date(o.createdAt).toLocaleString()}</span>
                      </div>
                      <span className="text-base font-extrabold">₹{o.totalPrice}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )
        )}
      </div>
    </>
  );
}