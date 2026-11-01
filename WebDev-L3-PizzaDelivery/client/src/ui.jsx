export const inputCls =
  'w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:ring-2 focus:ring-red-500 focus:outline-none';

export const btnCls =
  'w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm shadow transition';

// Rounded "pill" style used by the login and register pages
export const pillInput =
  'w-full bg-stone-100 border border-transparent rounded-full px-6 py-3 text-sm text-stone-900 outline-none transition focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100';

export const pillBtn =
  'w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full px-10 py-3.5 font-bold uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-red-600/20 transition';

export function Label({ children }) {
  return <label className="block text-xs font-semibold mb-1 opacity-80">{children}</label>;
}

export function PillLabel({ children }) {
  return <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 ml-4 mb-1.5">{children}</label>;
}

export function Alert({ type = 'error', children }) {
  const color =
    type === 'error'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-emerald-50 border-emerald-200 text-emerald-800';
  return <div className={`p-3 border rounded-lg text-xs ${color}`}>{children}</div>;
}