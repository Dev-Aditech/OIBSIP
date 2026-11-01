import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Pizza, Sparkles } from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// name: first name, live: the newest order still in progress (or undefined), loading: orders not loaded yet
export default function WelcomeBanner({ name, live, loading }) {
  const [greeting] = useState(getGreeting);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-red-950 text-white shadow-lg min-h-[200px]">
      {/* Background: pattern, glowing blobs, a slowly turning pizza and floating icons */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute -top-24 right-24 h-64 w-64 rounded-full bg-red-600/30 blur-3xl animate-pulse motion-reduce:animate-none" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl animate-pulse [animation-delay:1.5s] motion-reduce:animate-none" />

        <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 overflow-hidden rounded-full border-4 border-amber-400/25 bg-amber-900/40 opacity-30 shadow-2xl md:-right-10 md:h-80 md:w-80 md:opacity-100">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=560&q=75"
            alt=""
            decoding="async"
            className="h-full w-full object-cover animate-slow-spin motion-reduce:animate-none"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/35 to-transparent" />

        <Pizza className="absolute right-[40%] top-5 hidden h-8 w-8 text-amber-300/40 animate-float motion-reduce:animate-none md:block" />
        <Flame className="absolute bottom-5 right-[34%] hidden h-7 w-7 text-red-400/40 animate-float [animation-delay:2s] motion-reduce:animate-none md:block" />
        <Sparkles className="absolute right-[48%] top-1/2 hidden h-6 w-6 text-white/20 animate-float [animation-delay:4s] motion-reduce:animate-none lg:block" />
      </div>

      <div className="relative z-10 max-w-2xl space-y-3 p-5 md:p-7">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 animate-rise">
          <Sparkles className="h-3.5 w-3.5" /> {greeting}
        </span>

        <h2 className="font-serif text-3xl italic leading-tight md:text-4xl animate-rise [animation-delay:100ms]">
          Hello,{' '}
          <span className="bg-gradient-to-r from-amber-300 to-red-400 bg-clip-text not-italic text-transparent">{name}</span>!
        </h2>

        <p className="text-sm text-stone-300 animate-rise [animation-delay:200ms]">
          Build a pizza your way, then follow it live from the kitchen to your door.
        </p>

        {/* Buttons and the live order chip share one row to keep the card short */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/build"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold shadow-lg shadow-red-900/40 transition hover:bg-red-500 animate-rise [animation-delay:300ms]"
          >
            <span aria-hidden="true" className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent motion-reduce:hidden" />
            <Pizza className="relative h-4 w-4" />
            <span className="relative">Build your pizza</span>
            <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/orders"
            className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/15 animate-rise [animation-delay:350ms]"
          >
            My orders
          </Link>

          {!loading &&
            (live ? (
              <Link
                to="/orders"
                className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs backdrop-blur transition hover:bg-white/15 animate-rise [animation-delay:400ms]"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                </span>
                <span>
                  Order <strong>#{live._id.slice(-6).toUpperCase()}</strong> is <strong className="text-amber-300">{live.status}</strong>
                </span>
                <span className="font-semibold text-amber-300">Track →</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-stone-300 backdrop-blur animate-rise [animation-delay:400ms]">
                <Flame className="h-3.5 w-3.5 text-amber-400" /> No orders in progress. The oven is ready.
              </span>
            ))}
        </div>
      </div>
    </section>
  );
}