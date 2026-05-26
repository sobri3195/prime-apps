import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppModal, DailyWinsCard, EmptyState, EyeHealthTipCard, HomeHeader, LoadingSkeleton, NextScheduleCard, QueueCard, QuickActions, QuickMenu, SummaryCard, Toast } from './components/HomeComponents';

export function BerandaPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<{title:string;content:string}|null>(null);
  const [loading] = useState(false);
  const [hasQueue] = useState(true);
  const [hasSchedule] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [points, setPoints] = useState(120);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const fallbackRoutes = useMemo(() => new Set(['/resep-kacamata', '/ai/history', '/edukasi', '/daily-wins']), []);

  const handleSafeNavigate = (path: string, title: string) => {
    if (fallbackRoutes.has(path)) {
      setModal({ title, content: 'Fitur ini sedang disiapkan.' });
      return;
    }
    navigate(path);
  };

  return (
    <section className="space-y-4 pb-6" aria-label="Beranda pasien PRIME">
      <HomeHeader onNotification={() => setModal({ title: 'Notifikasi', content: 'Belum ada notifikasi baru.' })} />
      {loading ? <LoadingSkeleton /> : <SummaryCard onSummary={() => navigate('/laporan')} onReminder={() => setModal({ title: 'Timer 20-20-20', content: 'Timer sederhana dimulai. Lihat objek jauh selama 20 detik setiap 20 menit.' })} />}
      <QuickActions onBooking={() => navigate('/booking')} onAi={() => navigate('/ai')} />
      {hasQueue ? <QueueCard onDetail={() => setModal({ title: 'Detail Antrean', content: 'Nomor: A-017\nStatus: Menunggu pemeriksaan\nEstimasi: 15 menit\nDokter: dr. Sp.M\nRuangan: Poli 2' })} /> : <EmptyState title="Anda belum memiliki antrean hari ini." description="Silakan booking untuk mendapatkan nomor antrean." />}
      {hasSchedule ? <NextScheduleCard onDetail={() => setModal({ title: 'Detail Jadwal', content: 'Dokter: dr. Sp.M\nTanggal: 4 Mei 2026\nJam: 10.30 WIB\nJenis: Pemeriksaan Mata Lengkap\nStatus: Terkonfirmasi' })} /> : <EmptyState title="Belum ada jadwal pemeriksaan." description="Booking sekarang untuk memilih jadwal." />}
      <QuickMenu onClick={handleSafeNavigate} />
      <DailyWinsCard points={points} checkedIn={checkedIn} onCheckIn={() => { if (checkedIn) return; setCheckedIn(true); setPoints((p) => p + 10); setToast('Check-in berhasil! +10 poin.'); }} onSeeAll={() => handleSafeNavigate('/daily-wins', 'Daily Wins')} />
      <EyeHealthTipCard onRead={() => handleSafeNavigate('/edukasi', 'Edukasi Mata')} />
      {toast && <Toast message={toast} />}
      <AppModal open={Boolean(modal)} title={modal?.title ?? ''} onClose={() => setModal(null)}>
        <p className="whitespace-pre-line">{modal?.content}</p>
      </AppModal>
    </section>
  );
}
