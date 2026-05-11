import { ArrowRight, Camera, CheckCircle2, Eye, Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aiEyeSchema, type AiEyeFormValues } from '@/schemas/aiEyeSchema';
import { useCreateAiScreening } from '@/services/aiEye';
import { useGamificationStore, POINT_RULES } from '@/features/gamification/gamificationStore';

const symptomOptions = ['Mata merah', 'Buram', 'Nyeri', 'Gatal', 'Berair', 'Silau', 'Kering', 'Bengkak'];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

type CameraPermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

type CapturedEyePhoto = {
  uri: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  capturedAt: Date;
};

type SubmittedScreening = AiEyeFormValues & {
  hasEyePhoto: boolean;
  photoPreviewUri?: string;
};

function formatPhotoSize(fileSize?: number) {
  if (!fileSize) return 'Ukuran tidak tersedia';
  return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
}

function getPhotoClarityWarning(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) return 'Foto mungkin kurang jelas. Ambil ulang agar hasil screening lebih optimal.';

  const sampleWidth = Math.min(96, canvas.width);
  const sampleHeight = Math.min(96, canvas.height);
  const imageData = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
  let brightnessTotal = 0;
  let edgeTotal = 0;
  let previousBrightness = 0;

  for (let index = 0; index < imageData.length; index += 4) {
    const brightness = imageData[index] * 0.299 + imageData[index + 1] * 0.587 + imageData[index + 2] * 0.114;
    brightnessTotal += brightness;

    if (index > 0) {
      edgeTotal += Math.abs(brightness - previousBrightness);
    }

    previousBrightness = brightness;
  }

  const pixelCount = imageData.length / 4;
  const averageBrightness = brightnessTotal / pixelCount;
  const averageEdgeContrast = edgeTotal / pixelCount;

  if (averageBrightness < 55 || averageEdgeContrast < 7) {
    return 'Foto mungkin kurang jelas. Ambil ulang agar hasil screening lebih optimal.';
  }

  return '';
}

export function AiEyeScreeningForm() {
  const mutation = useCreateAiScreening();
  const [dailyWinsMessage, setDailyWinsMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<CameraPermissionStatus>('idle');
  const [capturedEyePhoto, setCapturedEyePhoto] = useState<CapturedEyePhoto | null>(null);
  const [photoPreviewUri, setPhotoPreviewUri] = useState('');
  const [isPhotoValidating, setIsPhotoValidating] = useState(false);
  const [photoWarning, setPhotoWarning] = useState('');
  const [isPhotoConfirmed, setIsPhotoConfirmed] = useState(false);
  const [submittedScreening, setSubmittedScreening] = useState<SubmittedScreening | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { completeMission, addPoints } = useGamificationStore();
  const userId = 'patient-001';
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AiEyeFormValues>({
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

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => () => stopCamera(), []);

  const openCamera = async () => {
    setPhotoWarning('');
    setCameraPermissionStatus('requesting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraPermissionStatus('unsupported');
      setPhotoWarning('Kamera belum tersedia di browser ini. Anda tetap bisa melanjutkan screening tanpa foto.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraPermissionStatus('granted');
      setIsCameraOpen(true);

      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 0);
    } catch {
      setCameraPermissionStatus('denied');
      setIsCameraOpen(false);
      setPhotoWarning('Kamera belum diizinkan. Anda tetap bisa melanjutkan screening tanpa foto.');
    }
  };

  const closeCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
    if (cameraPermissionStatus === 'requesting') setCameraPermissionStatus('idle');
  };

  const removePhoto = () => {
    setCapturedEyePhoto(null);
    setPhotoPreviewUri('');
    setPhotoWarning('');
    setIsPhotoConfirmed(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      setPhotoWarning('Foto belum berhasil terbaca. Coba ambil ulang dengan kamera tetap stabil.');
      return;
    }

    setIsPhotoValidating(true);
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      setIsPhotoValidating(false);
      setPhotoWarning('Foto belum berhasil terbaca. Coba ambil ulang dengan kamera tetap stabil.');
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    const clarityWarning = getPhotoClarityWarning(canvas);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsPhotoValidating(false);
          setPhotoWarning('Foto belum berhasil terbaca. Coba ambil ulang dengan kamera tetap stabil.');
          return;
        }

        if (!['image/jpeg', 'image/png'].includes(blob.type)) {
          setIsPhotoValidating(false);
          setPhotoWarning('Format foto harus JPG atau PNG. Silakan ambil ulang foto mata.');
          return;
        }

        if (blob.size > MAX_PHOTO_SIZE) {
          setIsPhotoValidating(false);
          setPhotoWarning('Ukuran foto maksimal 5MB. Silakan ambil ulang dengan kualitas lebih ringan.');
          return;
        }

        const previewUri = URL.createObjectURL(blob);
        setCapturedEyePhoto({
          uri: previewUri,
          fileName: `foto-mata-${Date.now()}.jpg`,
          fileSize: blob.size,
          mimeType: blob.type,
          capturedAt: new Date(),
        });
        setPhotoPreviewUri(previewUri);
        setPhotoWarning(clarityWarning);
        setIsPhotoConfirmed(false);
        setIsPhotoValidating(false);
        closeCamera();
      },
      'image/jpeg',
      0.88,
    );
  };

  const confirmPhoto = () => {
    setIsPhotoConfirmed(true);
    if (!photoWarning) {
      setPhotoWarning('');
    }
  };

  const retakePhoto = () => {
    removePhoto();
    void openCamera();
  };

  const handleScreeningSubmit = (values: AiEyeFormValues) => {
    const hasEyePhoto = Boolean(capturedEyePhoto);
    setSubmittedScreening({ ...values, hasEyePhoto, photoPreviewUri: hasEyePhoto ? photoPreviewUri : undefined });

    const payload: AiEyeFormValues = {
      ...values,
      eyePhotoMetadata: capturedEyePhoto
        ? {
            fileName: capturedEyePhoto.fileName,
            fileSize: capturedEyePhoto.fileSize,
            mimeType: capturedEyePhoto.mimeType,
            capturedAt: capturedEyePhoto.capturedAt.toISOString(),
          }
        : undefined,
    };

    const rewardUser = () => {
      const result = completeMission(userId, 'ai-screening');

      if (!result.success && result.message === 'Misi ini sudah selesai.') {
        addPoints(userId, 'ai_screening_completed', POINT_RULES.ai_screening_completed, 'AI Screening Mata tambahan');
        setDailyWinsMessage('Screening tersimpan. +15 poin AI Screening ditambahkan.');
        return;
      }

      setDailyWinsMessage(result.message);
    };

    mutation.mutate(payload, {
      onSuccess: rewardUser,
      onError: rewardUser,
    });
  };

  return (
    <div className="space-y-5">
      <form className="space-y-4 rounded-3xl border border-prime-gold/20 bg-white p-5 shadow-lg shadow-prime-gold/10" onSubmit={handleSubmit(handleScreeningSubmit)}>
        <div>
          <h2 className="text-lg font-semibold text-prime-black">AI Screening Mata</h2>
          <p className="text-sm text-prime-black/60">Isi keluhan Anda untuk mendapatkan screening awal.</p>
        </div>

        <div className="space-y-3">
          <div>
            <input
              {...register('chiefComplaint')}
              className="w-full rounded-2xl border border-prime-gold/20 bg-[#fff8e8] px-4 py-3 text-sm outline-none ring-prime-gold/20 transition focus:ring"
              placeholder="Contoh: mata merah, buram, atau nyeri"
            />
            {errors.chiefComplaint && <p className="mt-1 text-xs text-prime-gold">Keluhan utama wajib diisi.</p>}
          </div>
          <div>
            <input
              {...register('duration')}
              className="w-full rounded-2xl border border-prime-gold/20 bg-[#fff8e8] px-4 py-3 text-sm outline-none ring-prime-gold/20 transition focus:ring"
              placeholder="Contoh: 2 hari, 1 minggu"
            />
            {errors.duration && <p className="mt-1 text-xs text-prime-gold">Durasi keluhan wajib diisi.</p>}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-prime-black/75">Gejala tambahan</p>
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
                      { shouldValidate: true },
                    )
                  }
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                    active ? 'border-prime-gold bg-prime-cream/50 text-prime-gold' : 'border-prime-gold/20 bg-white text-prime-black/70'
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
          {errors.symptoms && <p className="text-xs text-prime-gold">Pilih minimal satu gejala tambahan.</p>}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-prime-black/75">Tingkat keluhan</p>
          <input type="range" min={0} max={10} value={painLevel} onChange={(e) => setValue('painLevel', Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-prime-cream/70 accent-prime-gold" />
          <div className="flex items-center justify-between text-xs text-prime-black/60">
            <span>Ringan</span>
            <span className="rounded-full bg-prime-cream/50 px-2 py-0.5 font-semibold text-prime-gold">{painLevel}/10</span>
            <span>Sedang</span>
            <span>Berat</span>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-prime-gold/20 bg-prime-cream/40 p-4">
          <div className="flex items-start gap-2">
            <Eye className="mt-0.5 text-prime-gold" size={18} />
            <div>
              <p className="text-sm font-semibold text-prime-black">Ambil Foto Mata (Opsional)</p>
              <p className="text-xs text-prime-black/60">Tambahkan foto mata jika ingin screening lebih lengkap.</p>
            </div>
          </div>

          {!capturedEyePhoto ? (
            <button
              type="button"
              onClick={openCamera}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-prime-gold/50 bg-white px-4 py-4 text-left transition hover:bg-prime-cream/50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-prime-cream/70 text-prime-gold">
                <Camera size={22} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-prime-black">Ambil Foto Mata</span>
                <span className="block text-xs text-prime-black/60">Opsional untuk membantu screening awal</span>
              </span>
            </button>
          ) : (
            <div className="rounded-2xl border border-prime-gold/20 bg-white p-3">
              <div className="flex gap-3">
                <img src={photoPreviewUri} alt="Preview foto mata" className="h-24 w-24 rounded-2xl object-cover ring-1 ring-prime-gold/20" />
                <div className="flex-1 space-y-2">
                  <p className="flex items-center gap-1 text-sm font-semibold text-prime-gold">
                    <CheckCircle2 size={15} /> Foto mata berhasil ditambahkan.
                  </p>
                  <p className="text-xs text-prime-black/60">{capturedEyePhoto.mimeType?.toUpperCase()} • {formatPhotoSize(capturedEyePhoto.fileSize)}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={confirmPhoto} className="rounded-full bg-prime-gold px-3 py-1.5 text-xs font-semibold text-white">
                      Gunakan Foto
                    </button>
                    <button type="button" onClick={retakePhoto} className="rounded-full border border-prime-gold/25 px-3 py-1.5 text-xs font-semibold text-prime-gold">
                      Ambil Ulang
                    </button>
                    <button type="button" onClick={removePhoto} className="rounded-full border border-prime-gold/20 px-3 py-1.5 text-xs font-semibold text-prime-black/70">
                      Hapus Foto
                    </button>
                  </div>
                  {isPhotoConfirmed && <p className="text-xs font-medium text-prime-gold">Foto siap membantu screening awal.</p>}
                </div>
              </div>
            </div>
          )}

          {isPhotoValidating && <p className="text-xs font-medium text-prime-gold">Memvalidasi foto mata...</p>}
          {photoWarning && <p className="rounded-2xl bg-prime-cream/50 px-3 py-2 text-xs font-medium text-prime-gold">{photoWarning}</p>}
        </div>

        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-prime-gold p-3.5 font-semibold text-white shadow-md shadow-prime-gold/20 transition hover:bg-[#9e8629]">
          Kirim Screening <ArrowRight size={16} />
        </button>

        {dailyWinsMessage && (
          <p className="flex items-center gap-2 rounded-2xl bg-prime-cream/60 px-3 py-2 text-xs font-semibold text-prime-gold">
            <CheckCircle2 size={14} /> {dailyWinsMessage}
          </p>
        )}
      </form>

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-prime-black/80 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-prime-gold/10 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-prime-gold">Kamera pasien</p>
                <h3 className="text-lg font-semibold text-prime-black">Ambil Foto Mata</h3>
                <ul className="mt-2 space-y-1 text-xs text-prime-black/70">
                  <li>• Pastikan wajah berada di area terang</li>
                  <li>• Hindari cahaya terlalu silau</li>
                  <li>• Dekatkan kamera ke area mata</li>
                  <li>• Pastikan foto tidak blur</li>
                  <li>• Jangan gunakan flash jika membuat mata tidak nyaman</li>
                </ul>
              </div>
              <button type="button" onClick={closeCamera} className="rounded-full bg-prime-cream/50 p-2 text-prime-black/70">
                <X size={18} />
              </button>
            </div>

            <div className="relative bg-prime-black">
              <video ref={videoRef} className="h-[420px] w-full object-cover" playsInline muted />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-36 w-64 items-center justify-center rounded-[45%] border-2 border-prime-gold/40 shadow-[0_0_0_999px_rgba(35,31,32,0.38)]">
                  <span className="rounded-full bg-prime-black/60 px-3 py-1 text-xs font-medium text-white">Posisikan mata di dalam frame</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={closeCamera} className="rounded-full border border-prime-gold/20 px-4 py-2 text-sm font-semibold text-prime-black/70">
                  Lanjut tanpa foto
                </button>
                <button type="button" onClick={capturePhoto} className="flex h-16 w-16 items-center justify-center rounded-full bg-prime-gold text-white shadow-lg shadow-prime-gold/20 ring-4 ring-prime-gold/20" aria-label="Ambil foto mata">
                  <Camera size={26} />
                </button>
                <button type="button" onClick={closeCamera} className="rounded-full border border-prime-gold/20 px-4 py-2 text-sm font-semibold text-prime-black/70">
                  Batal
                </button>
              </div>
              <p className="text-center text-xs text-prime-black/60">Foto opsional dan hanya membantu screening awal, bukan diagnosis final.</p>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />

      <section className="space-y-3 rounded-3xl border border-prime-gold/20 bg-white p-5 shadow-sm shadow-prime-gold/10">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-prime-black">Hasil Screening Awal</h3>
          <span className="rounded-full bg-prime-cream/75 px-3 py-1 text-xs font-semibold text-prime-gold">{submittedScreening ? 'Perlu Konsultasi' : 'Menunggu Form'}</span>
        </div>
        <p className="text-sm leading-relaxed text-prime-black/70">
          {submittedScreening
            ? 'Gejala yang Anda masukkan mengarah pada iritasi atau infeksi ringan. Disarankan melakukan pemeriksaan lebih lanjut.'
            : 'Lengkapi form screening untuk melihat ringkasan awal keluhan mata Anda.'}
        </p>

        {submittedScreening && (
          <div className="space-y-3 rounded-2xl bg-[#fff8e8] p-4 text-sm text-prime-black/70">
            <div className="grid gap-2 sm:grid-cols-2">
              <p><span className="font-semibold text-prime-black">Keluhan utama:</span> {submittedScreening.chiefComplaint}</p>
              <p><span className="font-semibold text-prime-black">Durasi keluhan:</span> {submittedScreening.duration}</p>
              <p><span className="font-semibold text-prime-black">Gejala tambahan:</span> {submittedScreening.symptoms.join(', ')}</p>
              <p><span className="font-semibold text-prime-black">Tingkat keluhan:</span> {submittedScreening.painLevel}/10</p>
              <p><span className="font-semibold text-prime-black">Rekomendasi:</span> Konsultasikan keluhan dengan dokter mata bila gejala menetap atau memburuk.</p>
            </div>
            <div className="rounded-2xl border border-prime-gold/20 bg-white p-3">
              {submittedScreening.hasEyePhoto && submittedScreening.photoPreviewUri ? (
                <div className="flex items-center gap-3">
                  <img src={submittedScreening.photoPreviewUri} alt="Foto mata terlampir" className="h-16 w-16 rounded-2xl object-cover" />
                  <p className="text-sm font-semibold text-prime-gold">Foto mata terlampir</p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-prime-black/70">Screening dilakukan tanpa foto mata</p>
              )}
            </div>
            <p className="rounded-2xl bg-prime-cream/50 px-3 py-2 text-xs leading-relaxed text-prime-black">
              Hasil ini merupakan screening awal dan bukan diagnosis final. Konsultasikan dengan dokter mata untuk pemeriksaan lebih akurat.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              addPoints(userId, 'booking_created', POINT_RULES.booking_created, 'Booking pemeriksaan dari hasil AI Mata');
              setDailyWinsMessage('Booking dicatat. +25 poin Daily Wins ditambahkan.');
            }}
            className="flex-1 rounded-xl bg-prime-gold px-3 py-2 text-xs font-semibold text-white"
          >
            Booking Pemeriksaan
          </button>
          <button className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-prime-gold/20 px-3 py-2 text-xs font-semibold text-prime-black/70">
            <Save size={14} /> Simpan Hasil
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl bg-white p-4 shadow-sm shadow-prime-gold/10 ring-1 ring-prime-gold/10">
          <p className="text-xs font-semibold text-prime-gold">Tips Mata Sehat</p>
          <p className="mt-1 text-sm text-prime-black/70">Istirahatkan mata setiap 20 menit saat menatap layar.</p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-sm shadow-prime-gold/10 ring-1 ring-prime-gold/10">
          <p className="text-xs font-semibold text-prime-gold">Layanan Cepat</p>
          <p className="mt-1 text-sm text-prime-black/70">Booking dokter mata tanpa antre panjang.</p>
        </article>
      </div>
    </div>
  );
}
