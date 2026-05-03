import { Sparkles, Eye } from 'lucide-react';
import { AiEyeScreeningForm } from '@/features/ai-eye/AiEyeScreeningForm';
import { CekBotDummy } from '@/features/cekbot/CekBotDummy';

export function AiPage() {
  return (
    <section className="space-y-4 pb-2">
      <header className="rounded-3xl bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 p-5 text-white shadow-lg shadow-cyan-200">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-cyan-100">AI Screening Mata & CekBot</p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight">AI Mata</h1>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
            <Eye size={20} />
          </span>
        </div>
        <p className="text-sm leading-relaxed text-cyan-50">Bantu screening awal keluhan mata Anda dengan cepat dan mudah.</p>
      </header>

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm shadow-amber-100">
        <span className="mt-0.5 rounded-xl bg-amber-100 p-2 text-amber-700">
          <Sparkles size={16} />
        </span>
        <p className="text-sm leading-relaxed text-amber-900">
          AI Mata hanya digunakan untuk edukasi dan screening awal, bukan diagnosis final. Untuk hasil yang lebih akurat, silakan konsultasi langsung dengan dokter mata.
        </p>
      </div>

      <AiEyeScreeningForm />
      <CekBotDummy />
    </section>
  );
}
