import { CalendarCheck2 } from 'lucide-react';
import { useState } from 'react';
import { POINT_RULES, useGamificationStore } from '@/features/gamification/gamificationStore';

export function BookingPage() {
  const [service, setService] = useState('Pemeriksaan Mata Lengkap');
  const [doctor, setDoctor] = useState('dr. Sp.M');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [feedback, setFeedback] = useState('');
  const { addPoints } = useGamificationStore();
  const userId = 'patient-001';

  const handleSubmitBooking = () => {
    if (!date || !time) {
      setFeedback('Lengkapi tanggal dan jam booking terlebih dahulu.');
      return;
    }

    const bookings = JSON.parse(localStorage.getItem('prime_bookings') || '[]');
    bookings.push({ service, doctor, date, time, createdAt: new Date().toISOString() });
    localStorage.setItem('prime_bookings', JSON.stringify(bookings));

    addPoints(userId, 'booking_created', POINT_RULES.booking_created, 'Booking pemeriksaan berhasil dibuat');
    setFeedback('Booking pemeriksaan berhasil dibuat. +25 poin Daily Wins.');
  };

  return (
    <section className="space-y-5 text-prime-ink" aria-label="Booking Pemeriksaan PRIME">
      <header className="rounded-prime-xl border border-prime-line bg-white p-5 shadow-prime-card">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-prime-gold-soft text-prime-gold-dark">
            <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-prime-gold-dark">Booking Pemeriksaan</p>
            <h1 className="mt-2 text-[22px] font-extrabold tracking-[-0.02em] text-prime-ink">Pilih jadwal kunjungan Anda</h1>
            <p className="mt-2 text-[14px] font-medium text-prime-muted">Daily Wins untuk booking hanya dicatat setelah booking berhasil dibuat.</p>
          </div>
        </div>
      </header>

      <section className="rounded-prime-xl border border-prime-line bg-white p-5 shadow-prime-card">
        <div className="space-y-3">
          <select value={service} onChange={(e) => setService(e.target.value)} className="w-full rounded-xl border border-prime-line p-3">
            <option>Pemeriksaan Mata Lengkap</option>
            <option>Konsultasi Dokter Mata</option>
            <option>Pemeriksaan Minus / Silinder</option>
            <option>Pemeriksaan Tekanan Bola Mata</option>
          </select>
          <input value={doctor} onChange={(e) => setDoctor(e.target.value)} className="w-full rounded-xl border border-prime-line p-3" placeholder="Dokter" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-prime-line p-3" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-xl border border-prime-line p-3" />

          <button type="button" onClick={handleSubmitBooking} className="prime-interactive prime-cta-gold w-full rounded-xl px-4 py-3 text-white">
            Konfirmasi Booking
          </button>
        </div>
      </section>

      {feedback && (
        <p role="status" className="rounded-[20px] border border-prime-teal/15 bg-prime-teal-soft px-4 py-3 text-[13px] font-bold leading-5 text-prime-ink">
          {feedback}
        </p>
      )}
    </section>
  );
}
