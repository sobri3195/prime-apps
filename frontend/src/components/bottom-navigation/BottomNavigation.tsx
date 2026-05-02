import { Brain, House, ShoppingBag, UserRound, ChartNoAxesCombined } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menus = [
  { path: '/beranda', label: 'Beranda', icon: House },
  { path: '/ai', label: 'AI', icon: Brain },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { path: '/profil', label: 'Profil', icon: UserRound },
  { path: '/laporan', label: 'Laporan', icon: ChartNoAxesCombined },
];

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t bg-white/95 backdrop-blur supports-[padding:max(0px)]:pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <ul className="grid grid-cols-5">
        {menus.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] transition-all ${
                  isActive ? 'text-cyan-600' : 'text-slate-500'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
