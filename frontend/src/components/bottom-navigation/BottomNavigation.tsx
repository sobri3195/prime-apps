import { Brain, ChartNoAxesCombined, House, ShoppingBag, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menus = [
  { path: '/beranda', label: 'Beranda', icon: House },
  { path: '/ai', label: 'AI', icon: Brain },
  { path: '/marketplace', label: 'Belanja', icon: ShoppingBag },
  { path: '/profil', label: 'Profil', icon: UserRound },
  { path: '/laporan', label: 'Laporan', icon: ChartNoAxesCombined },
];

export function BottomNavigation() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] px-3 pb-[calc(10px+env(safe-area-inset-bottom))]"
    >
      <div className="rounded-[28px] border border-prime-line bg-white/95 p-2 shadow-[0_-18px_45px_rgba(35,31,32,0.10)] backdrop-blur-xl">
        <ul className="grid grid-cols-5 gap-1">
          {menus.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                aria-label={label}
                className={({ isActive }) =>
                  `group flex min-h-[62px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[20px] text-[11.5px] transition duration-200 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-prime-gold/20 ${
                    isActive ? 'bg-prime-gold-soft' : 'text-[#9da3b0] hover:bg-prime-surface hover:text-prime-ink'
                  }`
                }
                style={({ isActive }) => ({ color: isActive ? '#B19731' : '#9da3b0' })}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-2xl transition duration-200 ${
                        isActive
                          ? 'bg-prime-gold-dark text-white shadow-[0_8px_18px_rgba(122,98,22,0.24)]'
                          : 'bg-transparent text-prime-muted group-hover:text-prime-ink'
                      }`}
                    >
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <span className={isActive ? 'font-extrabold' : 'font-bold'}>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
