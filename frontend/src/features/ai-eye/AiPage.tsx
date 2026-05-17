import { Eye, Sparkles, Zap } from "lucide-react";
import { AiEyeScreeningForm } from "@/features/ai-eye/AiEyeScreeningForm";
import { CekBotDummy } from "@/features/cekbot/CekBotDummy";

export function AiPage() {
  return (
    <section className="space-y-6 pb-4">
      <header className="rounded-3xl bg-gradient-to-br from-prime-black via-prime-gold to-[#d7bd64] p-5 text-white shadow-lg shadow-prime-gold/20">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/80">AI Screening Mata & CekBot</p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight">AI Mata</h1>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Eye size={22} />
          </span>
        </div>
        <p className="text-sm leading-relaxed text-white/90">Bantu screening awal keluhan mata Anda dengan cepat dan mudah.</p>
      </header>

      <div className="flex gap-3 rounded-3xl border border-prime-gold/25 bg-prime-cream/50 p-4 shadow-sm shadow-prime-gold/10">
        <span className="mt-0.5 rounded-2xl bg-white p-2 text-prime-gold shadow-sm">
          <Sparkles size={16} />
        </span>
        <p className="text-sm leading-relaxed text-prime-black/75">
          AI Mata hanya digunakan untuk edukasi dan screening awal, bukan diagnosis final. Untuk hasil yang lebih akurat, silakan konsultasi langsung dengan dokter mata.
        </p>
      </div>

      <AiEyeScreeningForm />
      <CekBotDummy />

      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-3xl bg-white p-4 shadow-sm shadow-prime-gold/10 ring-1 ring-prime-gold/10">
          <p className="text-xs font-semibold text-prime-gold">Tips Mata Sehat</p>
          <p className="mt-2 text-sm leading-relaxed text-prime-black/70">Istirahatkan mata setiap 20 menit saat menatap layar dan jaga kebersihan tangan.</p>
        </article>
        <article className="rounded-3xl bg-white p-4 shadow-sm shadow-prime-gold/10 ring-1 ring-prime-gold/10">
          <div className="mb-2 inline-flex rounded-2xl bg-prime-cream/60 p-2 text-prime-gold">
            <Zap size={16} />
          </div>
          <p className="text-xs font-semibold text-prime-gold">Layanan Cepat</p>
          <p className="mt-2 text-sm leading-relaxed text-prime-black/70">Booking dokter mata tanpa antre panjang melalui menu Booking Pemeriksaan.</p>
        </article>
      </div>
    </section>
  );
}
