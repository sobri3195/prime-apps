import { Sparkles, Eye } from 'lucide-react';
import { AiEyeScreeningForm } from '@/features/ai-eye/AiEyeScreeningForm';
import { CekBotDummy } from '@/features/cekbot/CekBotDummy';

export function AiPage() {
  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-prime-black via-prime-gold to-[#d7bd64] p-5 text-white shadow-lg shadow-prime-gold/20">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/80">AI Screening Mata & CekBot</p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight">AI Mata</h1>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
            <Eye size={20} />
          </span>
        </div>
        <p className="text-sm leading-relaxed text-white/90">Bantu screening awal keluhan mata Anda dengan cepat dan mudah.</p>
      </header>

      <div className="flex gap-3 rounded-2xl border border-prime-gold/25 bg-prime-cream/50 p-4 shadow-sm shadow-prime-gold/10">
        <span className="mt-0.5 rounded-xl bg-prime-cream/75 p-2 text-prime-gold">
          <Sparkles size={16} />
        </span>
        <p className="text-sm leading-relaxed text-prime-black">
          AI Mata hanya digunakan untuk edukasi dan screening awal, bukan diagnosis final. Untuk hasil yang lebih akurat, silakan konsultasi langsung dengan dokter mata.
        </p>
      </div>

      <AiEyeScreeningForm />
      <CekBotDummy />
    </section>
  );
}
