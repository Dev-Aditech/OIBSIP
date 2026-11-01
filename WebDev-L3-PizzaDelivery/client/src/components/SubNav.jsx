const ACCENTS = {
  red: { active: 'text-red-600', bar: 'bg-red-600' },
  amber: { active: 'text-amber-600', bar: 'bg-amber-500' },
};
const TONES = {
  red: 'bg-red-600 text-white',
  neutral: 'bg-stone-200 text-stone-700',
};

// tabs: [{ key, label, badge?, tone? }]
export default function SubNav({ tabs, value, onChange, accent = 'red', width = 'max-w-6xl' }) {
  const a = ACCENTS[accent];

  return (
    <div className="sticky top-0 z-20 bg-stone-100/95 backdrop-blur border-b border-stone-200">
      <div className={`${width} mx-auto px-4 md:px-8 flex gap-1 overflow-x-auto`}>
        {tabs.map((t) => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`relative px-4 py-3 text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition ${
                active ? a.active : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {t.label}
              {t.badge > 0 && (
                <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${TONES[t.tone || 'neutral']}`}>
                  {t.badge}
                </span>
              )}
              {active && <span className={`absolute left-3 right-3 bottom-0 h-0.5 rounded-full ${a.bar}`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}