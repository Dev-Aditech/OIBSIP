import { Link } from 'react-router-dom';
import { Heart, LayoutDashboard, MapPin, Pizza, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { PizzaProvider, usePizza } from '../PizzaContext';
import DashboardShell from './DashboardShell';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/build', label: 'Build pizza', icon: Pizza, also: ['/summary'] },
  { to: '/orders', label: 'My orders', icon: ShoppingBag },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/addresses', label: 'Addresses', icon: MapPin },
  { to: '/profile', label: 'Profile', icon: User },
];

function HeaderRight() {
  const { user } = useAuth();
  const { chosen, quantity } = usePizza();
  const count = chosen.length >= 3 ? quantity : 0; // a pizza needs at least a base, sauce and cheese

  return (
    <div className="flex items-center gap-4">
      <Link
        to={count > 0 ? '/summary' : '/build'}
        title={count > 0 ? 'Go to your order summary' : 'Build a pizza'}
        aria-label={count > 0 ? `Order summary, ${count} ${count === 1 ? 'pizza' : 'pizzas'}` : 'Build a pizza'}
        className="relative p-2 text-stone-700 hover:text-red-600"
      >
        <ShoppingCart className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[11px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
      <span className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-sm">
        {user.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export default function CustomerLayout() {
  return (
    <PizzaProvider>
      <DashboardShell
        links={LINKS}
        accent="red"
        brandSub="Artisanal Pizzeria"
        titles={{ '/summary': 'Order summary', '/payment/result': 'Payment' }}
        headerRight={<HeaderRight />}
      />
    </PizzaProvider>
  );
}