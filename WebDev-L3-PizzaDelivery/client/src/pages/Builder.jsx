import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { usePizza } from '../PizzaContext';
import { Alert } from '../ui';

const STEPS = [
  { title: 'Base', key: 'baseId', category: 'base', heading: 'Step 1: Choose your crust' },
  { title: 'Sauce', key: 'sauceId', category: 'sauce', heading: 'Step 2: Choose your sauce' },
  { title: 'Cheese', key: 'cheeseId', category: 'cheese', heading: 'Step 3: Choose your cheese' },
  { title: 'Vegetables', key: 'veggieIds', category: 'veggie', heading: 'Step 4: Pick your vegetables', multi: true },
];

export default function Builder() {
  const navigate = useNavigate();
  const { loading, error, reload, selection, setSelection, byCategory, unitPrice } = usePizza();
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const canGo = (i) => STEPS.slice(0, i).every((s) => s.multi || selection[s.key]);
  const isSelected = (id) =>
    current.multi ? selection.veggieIds.includes(id) : selection[current.key] === id;

  const pick = (id) => {
    if (current.multi) {
      const ids = selection.veggieIds;
      setSelection({ ...selection, veggieIds: ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id] });
    } else {
      setSelection({ ...selection, [current.key]: id });
    }
  };

  if (loading) return <p className="max-w-4xl mx-auto px-4 py-10 text-sm text-stone-500">Loading ingredients...</p>;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-2">
        <Alert>{error}</Alert>
        <button onClick={reload} className="text-xs text-red-600 underline">Try again</button>
      </div>
    );
  }

  const options = byCategory(current.category);
  const lastStep = step === STEPS.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold font-serif">Build your pizza</h1>
        <p className="text-xs text-stone-500 mt-1">Only ingredients that are in stock are shown.</p>
      </div>

      <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => canGo(i) && setStep(i)}
              className="flex flex-col items-center"
              disabled={!canGo(i)}
            >
              <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                step === i ? 'bg-red-600 text-white ring-4 ring-red-100' : step > i ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                {step > i ? <Check className="w-5 h-5" /> : i + 1}
              </span>
              <span className={`text-xs mt-1 ${step === i ? 'text-red-600 font-bold' : 'text-stone-500'}`}>{s.title}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-grow h-0.5 mx-2 ${step > i ? 'bg-emerald-600' : 'bg-stone-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold mb-1">{current.heading}</h3>
        {current.multi && <p className="text-xs text-stone-500 mb-4">Optional. Pick as many as you like.</p>}
        {options.length === 0 && <p className="text-sm text-stone-500 mt-4">Nothing available in this category right now.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {options.map((item) => {
            const selected = isSelected(item._id);
            return (
              <button
                key={item._id}
                onClick={() => pick(item._id)}
                className={`p-4 rounded-xl border-2 text-left flex justify-between items-center transition ${
                  selected ? 'border-red-600 bg-red-50/50' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <span>
                  <span className="block font-bold text-sm">{item.name}</span>
                  <span className="block text-xs text-stone-500 font-semibold">₹{item.price}</span>
                </span>
                <span className={`w-5 h-5 border flex items-center justify-center ${current.multi ? 'rounded' : 'rounded-full'} ${
                  selected ? 'bg-red-600 border-red-600 text-white' : 'border-stone-300'
                }`}>
                  {selected && <Check className="w-3 h-3" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-stone-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-stone-400 block">Price per pizza</span>
          <span className="text-2xl font-extrabold text-amber-400">₹{unitPrice}</span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-xs font-bold rounded-xl">Back</button>
          )}
          <button
            disabled={!current.multi && !selection[current.key]}
            onClick={() => (lastStep ? navigate('/summary') : setStep(step + 1))}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-xs font-bold rounded-xl"
          >
            {lastStep ? 'Review order' : 'Next step'}
          </button>
        </div>
      </div>
    </div>
  );
}
