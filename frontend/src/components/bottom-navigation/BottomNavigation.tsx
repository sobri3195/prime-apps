import { Brain, ChartNoAxesCombined, House, ShoppingBag, UserRound } from 'lucide-react';
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
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-cyan-100 bg-white/95 px-1 pb-1 backdrop-blur">
      <ul className="grid grid-cols-5">
        {menus.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] transition-all ${
                  isActive ? 'text-cyan-700' : 'text-slate-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      isActive ? 'bg-cyan-600 text-white shadow-md shadow-cyan-200' : 'text-slate-500'
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className={isActive ? 'font-semibold' : 'font-medium'}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
