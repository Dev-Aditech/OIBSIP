import { Link } from 'react-router-dom';
import { Pizza, Shield } from 'lucide-react';

export default function AuthLayout({ title, subtitle, admin = false, children }) {
  const Icon = admin ? Shield : Pizza;
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${admin ? 'bg-stone-900' : 'bg-stone-50'}`}>
      <div
        className={`p-8 rounded-2xl shadow-xl max-w-md w-full border ${
          admin ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-white border-stone-100 text-stone-800'
        }`}
      >
        <div className="text-center mb-6">
          <Link
            to="/"
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              admin ? 'bg-amber-500/20 text-amber-500' : 'bg-red-100 text-red-600'
            }`}
          >
            <Icon className="w-7 h-7" />
          </Link>
          <h2 className="text-2xl font-bold font-serif">{title}</h2>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
