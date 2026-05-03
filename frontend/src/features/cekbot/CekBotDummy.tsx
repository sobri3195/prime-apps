import { SendHorizontal } from 'lucide-react';

const suggestion = [
  'Jadwal dokter hari ini?',
  'Biaya pemeriksaan mata?',
  'Bagaimana cara booking?',
  'Apakah melayani BPJS?',
  'Jam operasional klinik?',
  'Keluhan mata saya harus ke dokter?',
];

export function CekBotDummy() {
  return (
    <section className="space-y-3 rounded-3xl border border-cyan-100 bg-white p-5 shadow-lg shadow-cyan-50">
      <h2 className="text-lg font-semibold text-slate-800">CekBot</h2>
      <p className="text-sm text-slate-500">Tanyakan layanan, jadwal, biaya, atau informasi kesehatan mata.</p>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-sky-50 p-3 text-sm text-slate-700">Halo, saya CekBot 👋 Ada yang bisa saya bantu?</div>
      <div className="flex flex-wrap gap-2">
        {suggestion.map((item) => (
          <button key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700">
            {item}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        <input className="flex-1 bg-transparent px-2 text-sm outline-none" placeholder="Ketik pertanyaan Anda..." />
        <button className="rounded-xl bg-cyan-600 p-2 text-white">
          <SendHorizontal size={16} />
        </button>
      </div>
    </section>
  );
}
