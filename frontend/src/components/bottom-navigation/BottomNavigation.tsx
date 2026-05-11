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
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-prime-gold/20 bg-white/95 px-1 pb-1 shadow-[0_-12px_32px_rgba(177,151,49,0.08)] backdrop-blur">
      <ul className="grid grid-cols-5">
        {menus.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] transition-all ${
                  isActive ? 'text-prime-gold' : 'text-prime-black/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                      isActive ? 'bg-prime-gold text-white shadow-md shadow-prime-gold/25' : 'text-prime-black/50'
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className={isActive ? 'font-bold' : 'font-medium'}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
