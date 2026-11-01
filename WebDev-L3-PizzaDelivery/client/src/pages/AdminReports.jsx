import { useEffect, useState } from 'react';
import api, { getError } from '../api';
import { Alert } from '../ui';

const RANGES = [7, 30, 90];
const STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery'];

export default function AdminReports() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .get(`/admin/reports?days=${days}`)
      .then(({ data }) => alive && setData(data))
      .catch((err) => alive && setError(getError(err)));
    return () => { alive = false; };
  }, [days]);

  const maxRevenue = data ? Math.max(1, ...data.series.map((d) => d.revenue)) : 1;
  const maxCount = data ? Math.max(1, ...data.topIngredients.map((t) => t.count)) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-stone-500">Paid orders only.</p>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border ${days === r ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'}`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      {error && <Alert>{error}</Alert>}
      {!data && !error && <p className="text-sm text-stone-500">Loading report...</p>}

      {data && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            {[['Revenue', `₹${data.revenue}`], ['Orders', data.orders], ['Average order', `₹${data.averageOrder}`]].map(([label, value]) => (
              <div key={label} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <span className="block text-2xl font-black">{value}</span>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>

          <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            <h2 className="font-bold mb-4">Revenue per day</h2>
            <div className="flex items-end gap-px h-48">
              {data.series.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ₹${d.revenue} (${d.orders} orders)`}
                  className="flex-1 bg-red-500 hover:bg-red-600 rounded-t"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue ? 3 : 0 }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-stone-400 mt-2">
              <span>{data.series[0].date}</span>
              <span>{data.series[data.series.length - 1].date}</span>
            </div>
          </section>

          <div className="grid lg:grid-cols-5 gap-6">
            <section className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <h2 className="font-bold mb-4">Most used ingredients</h2>
              {data.topIngredients.length === 0 ? (
                <p className="text-sm text-stone-500">No paid orders in this period.</p>
              ) : (
                <ul className="space-y-3">
                  {data.topIngredients.map((t) => (
                    <li key={`${t.category}-${t.name}`}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{t.name} <span className="text-xs text-stone-400">({t.category})</span></span>
                        <span className="font-bold">{t.count}</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full">
                        <div className="h-2 bg-amber-500 rounded-full" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <h2 className="font-bold mb-4">Orders by status</h2>
              <ul className="divide-y divide-stone-100">
                {STATUSES.map((s) => (
                  <li key={s} className="py-3 flex justify-between text-sm">
                    <span>{s}</span>
                    <span className="font-bold">{data.byStatus[s] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}