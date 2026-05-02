import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aiEyeSchema, type AiEyeFormValues } from '@/schemas/aiEyeSchema';
import { useCreateAiScreening } from '@/services/aiEye';

const symptomOptions = ['mata merah', 'buram', 'nyeri', 'gatal', 'berair'];

export function AiEyeScreeningForm() {
  const mutation = useCreateAiScreening();
  const { register, handleSubmit, setValue, watch } = useForm<AiEyeFormValues>({
    resolver: zodResolver(aiEyeSchema),
    defaultValues: {
      symptoms: [],
      painLevel: 0,
      blurredVision: false,
      traumaHistory: false,
      duration: '',
      chiefComplaint: '',
    },
  });

  const selectedSymptoms = watch('symptoms');

  return (
    <form className="space-y-3 rounded-2xl border p-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <input {...register('chiefComplaint')} className="w-full rounded-xl border p-3" placeholder="Keluhan utama" />
      <input {...register('duration')} className="w-full rounded-xl border p-3" placeholder="Durasi keluhan" />
      <div className="space-y-2">
        {symptomOptions.map((symptom) => (
          <label key={symptom} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedSymptoms.includes(symptom)}
              onChange={(event) => {
                if (event.target.checked) setValue('symptoms', [...selectedSymptoms, symptom]);
                else setValue('symptoms', selectedSymptoms.filter((s) => s !== symptom));
              }}
            />
            {symptom}
          </label>
        ))}
      </div>
      <input type="range" min={0} max={10} onChange={(e) => setValue('painLevel', Number(e.target.value))} />
      <button type="submit" className="w-full rounded-xl bg-cyan-600 p-3 font-medium text-white">Kirim Screening</button>
    </form>
  );
}
