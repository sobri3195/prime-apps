import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '@/components/bottom-navigation/BottomNavigation';

export function AppShell() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white pb-24 shadow-sm">
      <main className="px-4 py-4">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
