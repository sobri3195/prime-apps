import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '@/components/bottom-navigation/BottomNavigation';

export function AppShell() {
  return (
    <div className="app-preview-shell mx-auto min-h-dvh w-full max-w-[430px] bg-prime-surface">
      <main className="page-container px-4 pt-4">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
