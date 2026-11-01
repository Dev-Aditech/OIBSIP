import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { getError } from './api';

const PizzaContext = createContext(null);

export function PizzaProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState({ baseId: '', sauceId: '', cheeseId: '', veggieIds: [] });
  const [quantity, setQuantity] = useState(1);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/inventory');
      setItems(data);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => {
    const byId = new Map(items.map((i) => [i._id, i]));
    const byCategory = (category) => items.filter((i) => i.category === category);
    const chosen = [
      byId.get(selection.baseId),
      byId.get(selection.sauceId),
      byId.get(selection.cheeseId),
      ...selection.veggieIds.map((id) => byId.get(id)),
    ].filter(Boolean);
    const unitPrice = chosen.reduce((sum, i) => sum + i.price, 0);

    // Turns a preset (ingredient names) into real ids and a live price. Null if anything is out of stock.
    const presetSelection = (p) => {
      const find = (category, name) => items.find((i) => i.category === category && i.name === name);
      const base = find('base', p.base);
      const sauce = find('sauce', p.sauce);
      const cheese = find('cheese', p.cheese);
      const veggies = p.veggies.map((n) => find('veggie', n));
      if (!base || !sauce || !cheese || veggies.some((v) => !v)) return null;
      return {
        selection: { baseId: base._id, sauceId: sauce._id, cheeseId: cheese._id, veggieIds: veggies.map((v) => v._id) },
        price: [base, sauce, cheese, ...veggies].reduce((sum, i) => sum + i.price, 0),
      };
    };

    return { loading, error, reload, selection, setSelection, quantity, setQuantity, byCategory, chosen, unitPrice, presetSelection };
  }, [items, loading, error, reload, selection, quantity]);

  return <PizzaContext.Provider value={value}>{children}</PizzaContext.Provider>;
}

export const usePizza = () => useContext(PizzaContext);
