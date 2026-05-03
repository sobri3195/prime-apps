import { ArrowRight, Camera, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aiEyeSchema, type AiEyeFormValues } from '@/schemas/aiEyeSchema';
import { useCreateAiScreening } from '@/services/aiEye';

const symptomOptions = ['Mata merah', 'Buram', 'Nyeri', 'Gatal', 'Berair', 'Silau', 'Kering', 'Bengkak'];

export function AiEyeScreeningForm() {
  const mutation = useCreateAiScreening();
  const { register, handleSubmit, setValue, watch } = useForm<AiEyeFormValues>({
    resolver: zodResolver(aiEyeSchema),
    defaultValues: {
      symptoms: [],
      painLevel: 4,
      blurredVision: false,
      traumaHistory: false,
      duration: '',
      chiefComplaint: '',
    },
  });

  const selectedSymptoms = watch('symptoms');
  const painLevel = watch('painLevel');

  return (
    <div className="space-y-4">
      <form className="space-y-4 rounded-3xl border border-cyan-100 bg-white p-5 shadow-lg shadow-sky-100" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">AI Screening Mata</h2>
          <p className="text-sm text-slate-500">Isi keluhan Anda untuk mendapatkan screening awal.</p>
        </div>

        <div className="space-y-3">
          <input
            {...register('chiefComplaint')}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-cyan-200 transition focus:ring"
            placeholder="Contoh: mata merah, buram, atau nyeri"
          />
          <input
            {...register('duration')}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-cyan-200 transition focus:ring"
            placeholder="Contoh: 2 hari, 1 minggu"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Gejala tambahan</p>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((symptom) => {
              const normalizedSymptom = symptom.toLowerCase();
              const active = selectedSymptoms.includes(normalizedSymptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() =>
                    setValue(
                      'symptoms',
                      active ? selectedSymptoms.filter((item) => item !== normalizedSymptom) : [...selectedSymptoms, normalizedSymptom],
                    )
                  }
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                    active ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Tingkat keluhan</p>
          <input type="range" min={0} max={10} value={painLevel} onChange={(e) => setValue('painLevel', Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-cyan-100 accent-cyan-600" />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Ringan</span>
            <span className="rounded-full bg-cyan-50 px-2 py-0.5 font-semibold text-cyan-700">{painLevel}/10</span>
            <span>Sedang</span>
            <span>Berat</span>
          </div>
        </div>

        <button type="button" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-700">
          <Camera size={16} /> Upload Foto Mata (Opsional)
        </button>

        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 p-3.5 font-semibold text-white shadow-md shadow-cyan-200 transition hover:bg-cyan-700">
          Kirim Screening <ArrowRight size={16} />
        </button>
      </form>

      <section className="space-y-3 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Hasil Screening Awal</h3>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Perlu Konsultasi</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">Gejala yang Anda masukkan mengarah pada iritasi atau infeksi ringan. Disarankan melakukan pemeriksaan lebih lanjut.</p>
        <div className="flex gap-2">
          <button className="flex-1 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white">Booking Pemeriksaan</button>
          <button className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
            <Save size={14} /> Simpan Hasil
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-100 ring-1 ring-slate-100">
          <p className="text-xs font-semibold text-cyan-700">Tips Mata Sehat</p>
          <p className="mt-1 text-sm text-slate-600">Istirahatkan mata setiap 20 menit saat menatap layar.</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-100 ring-1 ring-slate-100">
          <p className="text-xs font-semibold text-cyan-700">Layanan Cepat</p>
          <p className="mt-1 text-sm text-slate-600">Booking dokter mata tanpa antre panjang.</p>
        </article>
      </div>
    </div>
  );
}
