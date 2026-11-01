import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

export default function AuthSplit({ heading, accent, subtitle, panelHeading, panelAccent, panelText, children }) {
  return (
    <div className="relative min-h-dvh lg:h-dvh bg-stone-100 flex items-center justify-center p-3 sm:p-4 overflow-x-hidden lg:overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-red-500/10 blur-[120px]" />

      {/* On laptops the card never grows taller than the screen */}
      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 lg:h-full lg:max-h-[720px] bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        <aside className="lg:col-span-5 bg-stone-950 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-8 lg:mb-12">
              <img src="/logo.png" alt="SliceCraft" className="w-10 h-10 rounded-full" />
              <span className="text-xl font-extrabold tracking-tight font-serif">SliceCraft</span>
            </Link>
            <h2 className="text-3xl lg:text-4xl font-serif italic mb-4">
              {panelHeading} <span className="text-amber-400">{panelAccent}</span>
            </h2>
            <p className="text-sm text-stone-400 leading-relaxed">{panelText}</p>
          </div>

          <div className="relative z-10 mt-8 p-4 rounded-3xl border border-white/10 bg-white/5 hidden lg:flex items-center gap-4">
            <span className="w-11 h-11 rounded-full bg-red-600/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-red-400" />
            </span>
            <div>
              <p className="font-bold text-sm">Live order tracking</p>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest">Kitchen to doorstep</p>
            </div>
          </div>

          <div className="hidden lg:block absolute -bottom-14 -left-8 text-[12rem] leading-none font-serif text-white/5 pointer-events-none select-none">
            Pizza
          </div>
        </aside>

        <section className="lg:col-span-7 p-6 md:p-10 lg:px-14 lg:py-8 flex flex-col lg:overflow-y-auto">
          {/* my-auto centres the form, and still lets it scroll from the top on very short screens */}
          <div className="my-auto">
            <div className="mb-5">
              <h1 className="text-2xl font-bold uppercase tracking-tighter mb-1">
                {heading} <span className="italic font-serif normal-case text-red-600">{accent}</span>
              </h1>
              {subtitle && <p className="text-stone-400 text-sm">{subtitle}</p>}
            </div>
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}