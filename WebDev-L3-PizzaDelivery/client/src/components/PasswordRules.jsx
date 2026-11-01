import { Check, Circle } from 'lucide-react';
import { PASSWORD_RULES } from '../passwordRules';

const BAR = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-amber-500', 'bg-emerald-500'];
const WORDS = ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

// Live checklist and strength bar for a password
export default function PasswordRules({ password }) {
  const met = PASSWORD_RULES.filter((rule) => rule.test(password)).length;

  return (
    <div className="mt-2 px-4 space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {PASSWORD_RULES.map((rule, i) => (
            <span key={rule.id} className={`h-1.5 flex-1 rounded-full ${i < met ? BAR[met - 1] : 'bg-stone-200'}`} />
          ))}
        </div>
        <span className="text-[11px] font-bold text-stone-500 w-16 text-right">{password ? WORDS[met] : ''}</span>
      </div>

      <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-0.5">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.id} className={`flex items-center gap-2 text-[11px] ${ok ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
              {ok ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}