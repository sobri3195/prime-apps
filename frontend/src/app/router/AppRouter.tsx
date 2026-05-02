import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layouts/AppShell';
import { BerandaPage } from '@/features/home/BerandaPage';
import { AiPage } from '@/features/ai-eye/AiPage';
import { MarketplacePage } from '@/features/marketplace/MarketplacePage';
import { ProfilPage } from '@/features/profile/ProfilPage';
import { LaporanPage } from '@/features/reports/LaporanPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/beranda" replace />} />
        <Route path="beranda" element={<BerandaPage />} />
        <Route path="ai" element={<AiPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="profil" element={<ProfilPage />} />
        <Route path="laporan" element={<LaporanPage />} />
      </Route>
    </Routes>
  );
}
