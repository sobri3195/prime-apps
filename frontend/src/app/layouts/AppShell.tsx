import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '@/components/bottom-navigation/BottomNavigation';

export function AppShell() {
  return (
    <div className="mx-auto min-h-[932px] w-full max-w-[430px] bg-[#fffaf0] pb-24 shadow-xl shadow-prime-gold/10">
      <main className="px-4 py-4">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
