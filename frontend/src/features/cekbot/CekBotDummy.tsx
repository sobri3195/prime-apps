const suggestion = ['Jadwal dokter hari ini?', 'Biaya pemeriksaan mata?', 'Bagaimana cara booking?'];

export function CekBotDummy() {
  return (
    <section className="space-y-3 rounded-2xl border p-4">
      <h2 className="font-semibold">CekBot</h2>
      <div className="rounded-xl bg-slate-100 p-2 text-sm">Halo, saya CekBot. Ada yang bisa saya bantu?</div>
      <div className="flex flex-wrap gap-2">
        {suggestion.map((item) => (
          <button key={item} className="rounded-full border px-3 py-1 text-xs">{item}</button>
        ))}
      </div>
    </section>
  );
}
