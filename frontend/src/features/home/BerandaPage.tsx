export function BerandaPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-xl font-semibold">Halo, Pasien 👋</h1>
      <div className="rounded-2xl bg-cyan-50 p-4">Ringkasan kesehatan mata & antrean hari ini.</div>
      <div className="grid grid-cols-2 gap-3">
        <button className="rounded-2xl bg-cyan-600 p-3 text-white">Booking Pemeriksaan</button>
        <button className="rounded-2xl border border-cyan-600 p-3 text-cyan-700">Cek AI Mata</button>
      </div>
    </section>
  );
}
