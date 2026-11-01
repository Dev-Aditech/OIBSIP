import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../AuthContext';

// Full class names (not built strings) so Tailwind can find them
const ACCENTS = {
  red: 'bg-red-950/70 text-red-400',
  amber: 'bg-amber-950/60 text-amber-400',
};
const CONFIRM_BUTTON = {
  red: 'bg-red-600 hover:bg-red-700 text-white',
  amber: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
};
const ICON_TINT = {
  red: 'bg-red-100 text-red-600',
  amber: 'bg-amber-100 text-amber-700',
};

export default function DashboardShell({ links, accent = 'red', brandSub, titles = {}, headerRight }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  // Start every page at the top, because the content area (not the window) is what scrolls
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // Escape closes the logout box
  useEffect(() => {
    if (!confirmOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setConfirmOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmOpen]);

  const title =
    titles[pathname] ??
    links.find((l) => (l.end ? pathname === l.to : pathname.startsWith(l.to)))?.label ??
    'SliceCraft';

  return (
    <div className="flex h-dvh overflow-hidden bg-stone-100">
      {open && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-stone-950 text-stone-300 flex flex-col shrink-0 transform transition-transform duration-200 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.png" alt="SliceCraft" className="w-9 h-9 rounded-full" />
          <div>
            <span className="block text-lg font-extrabold text-white font-serif leading-5">SliceCraft</span>
            <span className="block text-[10px] uppercase tracking-widest text-amber-500">{brandSub}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 text-[15px] font-medium overflow-y-auto">
          {links.map(({ to, label, icon: Icon, end, also }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition ${
                  isActive || also?.includes(pathname) ? `${ACCENTS[accent]} font-semibold` : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900'
                }`
              }
            >
              <Icon className="w-[22px] h-[22px]" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button
            onClick={() => { setOpen(false); setConfirmOpen(true); }}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-stone-400 hover:text-white text-[15px] font-medium"
          >
            <LogOut className="w-[22px] h-[22px]" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-16 shrink-0 bg-white border-b border-stone-200 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-stone-700" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-stone-900">{title}</h1>
          </div>
          {headerRight}
        </header>

        {/* Only this area scrolls. A page's sub-navbar sticks to its top edge. */}
        <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto"><Outlet /></main>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 text-center shadow-2xl animate-rise"
          >
            <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${ICON_TINT[accent]}`}>
              <LogOut className="h-6 w-6" />
            </span>
            <div>
              <h2 id="logout-title" className="text-lg font-bold text-stone-900">Log out?</h2>
              <p className="mt-1 text-sm text-stone-500">
                You are signed in as <span className="font-semibold text-stone-700">{user?.name}</span>. You will need to sign in again to come back.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                autoFocus
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl bg-stone-100 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-200"
              >
                Stay signed in
              </button>
              <button onClick={logout} className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${CONFIRM_BUTTON[accent]}`}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}