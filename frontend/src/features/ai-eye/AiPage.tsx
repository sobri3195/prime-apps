import { AiEyeScreeningForm } from '@/features/ai-eye/AiEyeScreeningForm';
import { CekBotDummy } from '@/features/cekbot/CekBotDummy';

export function AiPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">AI Mata & CekBot</h1>
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">AI Mata hanya untuk edukasi dan screening awal, bukan diagnosis final.</p>
      <AiEyeScreeningForm />
      <CekBotDummy />
    </section>
  );
}
