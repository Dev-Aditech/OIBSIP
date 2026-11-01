import { Link, Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function PaymentResult() {
  const { state } = useLocation();
  if (!state) return <Navigate to="/orders" replace />;

  const ok = state.status === 'success';
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-stone-100 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {ok ? <CheckCircle className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
        </div>
        {ok ? (
          <>
            <h2 className="text-2xl font-bold font-serif mb-1">Order placed!</h2>
            <p className="text-xs text-stone-500 mb-6">Payment received. The kitchen is on it.</p>
            {state.order && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left mb-6 space-y-1 text-xs">
                <div className="flex justify-between"><span>Order number</span><span className="font-mono font-bold">#{state.order._id.slice(-6).toUpperCase()}</span></div>
                <div className="flex justify-between"><span>Total paid</span><span className="font-bold text-emerald-600">₹{state.order.totalPrice}</span></div>
              </div>
            )}
            <Link to="/orders" className="block w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs">Track my order</Link>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold font-serif mb-1">Payment failed</h2>
            <p className="text-xs text-stone-500 mb-6">{state.message || 'The payment was not completed.'}</p>
            <Link to="/summary" className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs">Try again</Link>
          </>
        )}
      </div>
    </div>
  );
}
