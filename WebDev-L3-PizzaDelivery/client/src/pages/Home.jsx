import { Link } from 'react-router-dom';
import {
  Pizza, Flame, Truck, ShieldCheck, Sparkles, Layers, Check,
  ArrowRight, Zap, Utensils, ShoppingBag, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const STEPS = [
  { icon: Layers, tint: 'bg-red-100 text-red-600', title: 'Choose ingredients', text: 'Pick a crust, sauce, cheese and toppings in our 4-step builder, or start from a signature pizza.' },
  { icon: ShieldCheck, tint: 'bg-amber-100 text-amber-600', title: 'Pay securely', text: 'Checkout with Razorpay using UPI, cards or net banking. Your order is confirmed instantly.' },
  { icon: Truck, tint: 'bg-emerald-100 text-emerald-600', title: 'Track live', text: 'Watch your order move from Order Received to In Kitchen to Sent to Delivery.' },
];

const PIZZAS = [
  { name: 'Classic Margherita', tag: 'Traditional', badge: 'Bestseller', price: 270, img: 'photo-1604382354936-07c5d9983bd3', text: 'Thin crust, tomato marinara, mozzarella and ripe tomato.' },
  { name: 'Smokey BBQ Veggie Feast', tag: 'Bold and savory', badge: 'Chef choice', price: 395, img: 'photo-1513104890138-7c749659a591', text: 'Hand-tossed crust with BBQ sauce, cheddar, mushroom, sweet corn and onion.' },
  { name: 'Double Cheese Burst', tag: 'Rich', badge: 'Premium', price: 455, img: 'photo-1574071318508-1cdbab80d002', text: 'Cheese burst base, white garlic sauce, gouda, black olives and jalapeno.' },
];

const INGREDIENTS = [
  { title: 'Crusts', items: ['Thin Crust', 'Classic Hand-Tossed', 'Cheese Burst', 'Whole Wheat', 'Gluten-Free'] },
  { title: 'Sauces', items: ['Tomato Marinara', 'Pesto', 'BBQ', 'White Garlic', 'Spicy Arrabbiata'] },
  { title: 'Cheeses', items: ['Mozzarella', 'Cheddar', 'Gouda', 'Parmesan'] },
  { title: 'Vegetables', items: ['Onion', 'Capsicum', 'Mushroom', 'Tomato', 'Sweet Corn', 'Black Olives', 'Jalapeno', 'Spinach'] },
];

const photo = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md">
        <Pizza className="w-6 h-6" />
      </span>
      <span className={`text-xl font-extrabold font-serif ${light ? 'text-white' : 'text-stone-900'}`}>SliceCraft</span>
    </Link>
  );
}

function SectionTitle({ title, text }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">{title}</h2>
      <p className="text-stone-500 text-sm mt-2">{text}</p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const appLink = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/register';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#how-it-works" className="hover:text-red-600">How it works</a>
            <a href="#signature" className="hover:text-red-600">Signature pizzas</a>
            <a href="#ingredients" className="hover:text-red-600">Ingredients</a>
            <a href="#tracking" className="hover:text-red-600">Live tracking</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to={appLink} className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl">Go to my account</Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl">Log in</Link>
                <Link to="/register" className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative bg-stone-900 text-white py-20 lg:py-28 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="max-w-7xl mx-auto relative grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-600/30 text-red-300 border border-red-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Wood-fired and handcrafted
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif leading-tight">
                Craft your perfect slice, delivered hot.
              </h1>
              <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Choose from 5 crusts, 5 sauces, 4 cheeses and 8 fresh vegetables, then follow your order from kitchen to doorstep.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to={appLink} className="w-full sm:w-auto px-7 py-3.5 bg-red-600 hover:bg-red-700 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm">
                  <Pizza className="w-5 h-5" /> Build your own pizza
                </Link>
                <a href="#signature" className="w-full sm:w-auto px-7 py-3.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 font-bold rounded-xl flex items-center justify-center gap-2 text-sm">
                  <Utensils className="w-4 h-4 text-amber-400" /> See signature pizzas
                </a>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full border-4 border-amber-500/20 p-3 bg-stone-800/50 shadow-2xl">
                <img src={photo('photo-1513104890138-7c749659a591', 800)} alt="Freshly baked pizza" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle title="How SliceCraft works" text="From your first topping to your doorstep in three steps." />
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ icon: Icon, tint, title, text }, i) => (
              <div key={title} className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${tint}`}><Icon className="w-7 h-7" /></div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{i + 1}. {title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Signature pizzas */}
        <section id="signature" className="py-20 bg-stone-100/70 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionTitle title="Signature pizzas" text="Ingredient pairings we love. Order as they are or customize them." />
            <div className="grid md:grid-cols-3 gap-8">
              {PIZZAS.map((p) => (
                <div key={p.name} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="h-52 relative">
                    <img src={photo(p.img, 700)} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-stone-900/90 text-amber-400 font-extrabold px-3 py-1 rounded-full text-xs">₹{p.price}</span>
                    <span className="absolute top-3 left-3 bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[11px]">{p.badge}</span>
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-amber-600">{p.tag}</span>
                      <h3 className="text-lg font-bold text-stone-900">{p.name}</h3>
                      <p className="text-stone-500 text-sm mt-2">{p.text}</p>
                    </div>
                    <Link to={appLink} className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" /> Order now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section id="ingredients" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle title="Everything you can put on it" text="Every ingredient is tracked in stock, so what you see is what we have." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INGREDIENTS.map((c) => (
              <div key={c.title} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100">{c.title}</h3>
                <ul className="space-y-2.5">
                  {c.items.map((item) => (
                    <li key={item} className="flex items-center text-sm text-stone-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Live tracking */}
        <section id="tracking" className="py-20 bg-stone-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Zap className="w-3.5 h-3.5" /> Live order status
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">Know exactly where your pizza is</h2>
              <p className="text-stone-300 text-sm leading-relaxed">
                When the kitchen updates your order, your tracker changes on its own. No refreshing and no guessing.
              </p>
            </div>
            <div className="bg-stone-800 rounded-2xl border border-stone-700 p-6 sm:p-8 shadow-2xl">
              <p className="text-xs font-bold text-amber-400 mb-6">Example order</p>
              <div className="relative flex justify-between items-center">
                <div className="absolute top-5 left-0 right-0 h-1 bg-stone-700" />
                <div className="absolute top-5 left-0 w-1/2 h-1 bg-amber-500" />
                {[
                  { icon: Check, label: 'Order Received', cls: 'bg-emerald-600 text-white' },
                  { icon: Flame, label: 'In Kitchen', cls: 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/30' },
                  { icon: Truck, label: 'Sent to Delivery', cls: 'bg-stone-700 text-stone-400' },
                ].map(({ icon: Icon, label, cls }) => (
                  <div key={label} className="relative flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cls}`}><Icon className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-stone-300 text-center">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-stone-900">Ready to build your pizza?</h2>
          <p className="text-stone-500 text-sm sm:text-base mt-3 mb-8">Create a free account and place your first order in minutes.</p>
          <Link to={appLink} className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg text-sm">
            {user ? 'Go to my account' : 'Create your account'} <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <footer className="bg-stone-900 text-stone-400 text-xs py-10 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo light />
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#how-it-works" className="hover:text-amber-500">How it works</a>
            <a href="#signature" className="hover:text-amber-500">Signature pizzas</a>
            <a href="#ingredients" className="hover:text-amber-500">Ingredients</a>
            <Link to="/admin/login" className="hover:text-amber-500">Admin portal</Link>
          </div>
          <p>© 2026 SliceCraft. Payments by Razorpay (test mode).</p>
        </div>
      </footer>
    </div>
  );
}
