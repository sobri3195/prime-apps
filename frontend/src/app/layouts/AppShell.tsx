import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '@/components/bottom-navigation/BottomNavigation';

export function AppShell() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-prime-surface shadow-xl shadow-prime-gold/10 sm:my-0 sm:min-h-[932px]">
      <main className="page-container px-5 pt-5 sm:px-6 sm:pt-6">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
