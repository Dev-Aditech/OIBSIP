import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import api, { getError } from '../api';
import { usePizza } from '../PizzaContext';
import { Alert } from '../ui';

export default function Wishlist() {
  const navigate = useNavigate();
  const { setSelection, setQuantity } = usePizza();
  const [pizzas, setPizzas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    api.get('/wishlist')
      .then(({ data }) => {
        if (!isMounted) return;
        setPizzas(data ?? []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(getError(err));
        setPizzas([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const use = (p, to) => {
    setSelection({ baseId: p.baseId, sauceId: p.sauceId, cheeseId: p.cheeseId, veggieIds: p.veggieIds });
    setQuantity(1);
    navigate(to);
  };

  const remove = async (p) => {
    setError('');
    try {
      await api.delete(`/wishlist/${p._id}`);
      setPizzas((list) => list.filter((x) => x._id !== p._id));
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <p className="text-xs text-stone-500">Pizzas you saved from the order summary. Prices follow today's ingredient prices.</p>
      {error && <Alert>{error}</Alert>}
      {loading && <p className="text-sm text-stone-500">Loading...</p>}

      {!loading && pizzas?.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <Heart className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-600">Your wishlist is empty.</p>
          <Link to="/build" className="inline-block mt-3 text-sm text-red-600 font-semibold hover:underline">Build a pizza and save it</Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {pizzas?.map((p) => (
          <div key={p._id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-bold">{p.name}</h3>
                <span className="text-sm font-bold text-amber-600">₹{p.unitPrice}</span>
              </div>
              <button onClick={() => remove(p)} aria-label="Remove" className="p-2 text-stone-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.items.map((i) => (
                <span key={i._id} className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs rounded-full">{i.name}</span>
              ))}
            </div>
            {p.available ? (
              <div className="flex gap-2">
                <button onClick={() => use(p, '/summary')} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg">Order now</button>
                <button onClick={() => use(p, '/build')} className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs rounded-lg">Customize</button>
              </div>
            ) : (
              <p className="text-xs font-semibold text-red-600">Unavailable right now (an ingredient is out of stock)</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}