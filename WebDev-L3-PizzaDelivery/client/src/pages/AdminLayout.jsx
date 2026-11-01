import { ClipboardList, LayoutDashboard, Package, Settings, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../AuthContext';
import DashboardShell from './DashboardShell';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
  { to: '/admin/orders', label: 'Order board', icon: ClipboardList },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: TrendingUp },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function HeaderRight() {
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden sm:inline text-stone-600">{user.name}</span>
      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">Admin</span>
    </div>
  );
}

export default function AdminLayout() {
  return <DashboardShell links={LINKS} accent="amber" brandSub="Admin panel" headerRight={<HeaderRight />} />;
}