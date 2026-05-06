import { api } from './api';

export interface CekBotIntegrationStatus {
  name: 'slack' | 'discord' | 'twilio' | 'sendgrid' | 'mapbox' | 'supabase';
  active: boolean;
  purpose: string;
}

export interface CekBotMessageResponse {
  id: string;
  reply: string;
  suggestedActions: string[];
  escalation: {
    needed: boolean;
    reason?: string;
    availableChannels: CekBotIntegrationStatus['name'][];
  };
  integrations: CekBotIntegrationStatus[];
  source?: 'api' | 'local';
}

type CekBotTopic = 'booking' | 'price' | 'schedule' | 'bpjs' | 'location' | 'symptom' | 'operationalHours' | 'general';

const localIntegrations: CekBotIntegrationStatus[] = [
  {
    name: 'slack',
    active: false,
    purpose: 'Notifikasi internal tim klinik saat pasien perlu dibantu petugas.',
  },
  {
    name: 'discord',
    active: false,
    purpose: 'Kanal komunitas atau monitoring operasional jika bot Discord digunakan.',
  },
  {
    name: 'twilio',
    active: false,
    purpose: 'Pengiriman follow-up WhatsApp/SMS untuk booking dan eskalasi.',
  },
  {
    name: 'sendgrid',
    active: false,
    purpose: 'Pengiriman email ringkasan percakapan atau instruksi pra-kunjungan.',
  },
  {
    name: 'mapbox',
    active: false,
    purpose: 'Bantuan lokasi klinik, estimasi rute, dan tautan peta.',
  },
  {
    name: 'supabase',
    active: false,
    purpose: 'Penyimpanan percakapan dan konteks pasien jika Supabase diaktifkan.',
  },
];

function normalizeMessage(message: unknown) {
  if (typeof message !== 'string') {
    return '';
  }

  return message.trim().toLowerCase();
}

function detectUrgency(message: string) {
  const urgentKeywords = ['nyeri hebat', 'sakit sekali', 'pandangan hilang', 'buta mendadak', 'cedera', 'trauma', 'mata berdarah'];
  const urgent = urgentKeywords.some((keyword) => message.includes(keyword));

  return {
    urgent,
    reason: urgent ? 'Keluhan berisiko tinggi dan sebaiknya segera ditangani petugas klinik atau IGD.' : undefined,
  };
}

function detectTopic(message: string): CekBotTopic {
  if (['keluhan', 'gejala', 'merah', 'gatal', 'buram', 'kabur', 'nyeri', 'perih', 'bengkak'].some((keyword) => message.includes(keyword))) {
    return 'symptom';
  }

  if (['booking', 'reservasi', 'daftar', 'janji', 'pesan'].some((keyword) => message.includes(keyword))) {
    return 'booking';
  }

  if (['biaya', 'harga', 'tarif', 'bayar'].some((keyword) => message.includes(keyword))) {
    return 'price';
  }

  if (message.includes('bpjs')) {
    return 'bpjs';
  }

  if (['jam operasional', 'jam buka', 'jam tutup', 'operasional', 'buka jam', 'tutup jam'].some((keyword) => message.includes(keyword))) {
    return 'operationalHours';
  }

  if (['jadwal', 'dokter', 'praktek', 'praktik', 'hari ini'].some((keyword) => message.includes(keyword))) {
    return 'schedule';
  }

  if (['lokasi', 'alamat', 'rute', 'maps'].some((keyword) => message.includes(keyword))) {
    return 'location';
  }

  if (message.includes('mata')) {
    return 'symptom';
  }

  return 'general';
}

function buildReply(topic: CekBotTopic, urgency: { urgent: boolean }, channelNote: string) {
  if (urgency.urgent) {
    return 'Saya mendeteksi keluhan darurat. Mohon segera hubungi petugas klinik atau menuju IGD terdekat. Jika memungkinkan, jangan mengucek mata dan minta pendamping untuk perjalanan.';
  }

  const replies = {
    booking:
      'Bisa, saya bantu booking pemeriksaan. Silakan siapkan nama pasien, nomor WhatsApp aktif, tanggal kunjungan, dan pilihan dokter/jam. Setelah itu admin dapat mengonfirmasi slot yang tersedia.',
    price:
      'Estimasi biaya pemeriksaan mata dasar mulai dari Rp150.000. Biaya dapat berbeda untuk pemeriksaan lanjutan seperti refraksi, retina, tekanan bola mata, atau tindakan dokter. Admin akan mengonfirmasi paket yang paling sesuai.',
    schedule:
      'Jadwal dokter hari ini tersedia pada pukul 09.00-12.00 dan 15.00-18.00. Untuk memastikan slot, pilih “Booking slot terdekat” atau kirim preferensi jam kunjungan Anda.',
    bpjs:
      'Klinik dapat membantu pengecekan layanan BPJS sesuai poli, rujukan, dan kuota harian. Siapkan nomor kartu BPJS, NIK, dan surat rujukan bila ada agar admin bisa verifikasi.',
    location:
      'Saya bisa membantu informasi lokasi klinik dan rute. Kirim lokasi Anda atau pilih “Buka peta klinik” agar admin dapat memberi arahan yang paling mudah.',
    symptom:
      'Untuk keluhan mata, sebaiknya periksa ke dokter bila nyeri berat, penglihatan tiba-tiba buram/hilang, mata merah disertai sakit, cedera, keluar cairan kental, atau keluhan tidak membaik dalam 1-2 hari. Ceritakan gejala, sejak kapan, dan mata kanan/kiri agar saya bantu arahkan.',
    operationalHours: 'Jam operasional klinik: Senin-Sabtu pukul 08.00-20.00, Minggu pukul 09.00-14.00. Jadwal dokter bisa berbeda, jadi booking lebih dulu disarankan.',
    general: 'Halo, saya CekBot Prime Apps. Saya bisa bantu info layanan, booking, jadwal dokter, biaya, BPJS, jam operasional, lokasi, dan skrining awal keluhan mata.',
  } satisfies Record<CekBotTopic, string>;

  return `${replies[topic]}${channelNote}`;
}

function buildSuggestedActions(topic: CekBotTopic, urgency: { urgent: boolean }) {
  if (urgency.urgent) {
    return ['Hubungi petugas sekarang', 'Cari IGD terdekat', 'Bagikan nomor kontak pasien'];
  }

  const actions = {
    booking: ['Pilih tanggal kunjungan', 'Pilih dokter', 'Kirim nomor kontak'],
    price: ['Tanya paket pemeriksaan', 'Konsultasi admin', 'Lihat promo marketplace'],
    schedule: ['Lihat jadwal hari ini', 'Booking slot terdekat', 'Hubungi admin'],
    bpjs: ['Cek syarat BPJS', 'Upload rujukan', 'Hubungi admin'],
    location: ['Buka peta klinik', 'Minta rute', 'Bagikan lokasi saya'],
    symptom: ['Mulai skrining AI Mata', 'Booking pemeriksaan', 'Konsultasi admin'],
    operationalHours: ['Lihat jadwal dokter', 'Booking slot terdekat', 'Hubungi admin'],
    general: ['Booking pemeriksaan', 'Tanya biaya', 'Cek jadwal dokter'],
  } satisfies Record<CekBotTopic, string[]>;

  return actions[topic];
}

function createLocalCekBotReply(message: string): CekBotMessageResponse {
  const normalizedMessage = normalizeMessage(message);
  const urgency = detectUrgency(normalizedMessage);
  const topic = detectTopic(normalizedMessage);
  const channelNote = ' Jawaban ini dari mode lokal CekBot; konfirmasi akhir tetap melalui petugas klinik.';

  return {
    id: `cekbot-local-${Date.now()}`,
    reply: buildReply(topic, urgency, channelNote),
    suggestedActions: buildSuggestedActions(topic, urgency),
    escalation: {
      needed: urgency.urgent,
      reason: urgency.reason,
      availableChannels: [],
    },
    integrations: localIntegrations,
    source: 'local',
  };
}

export async function sendCekBotMessage(message: string) {
  try {
    const response = await api<CekBotMessageResponse>('/cekbot/messages', {
      method: 'POST',
      body: JSON.stringify({ message, channel: 'web' }),
    });

    return { ...response, source: 'api' as const };
  } catch {
    return createLocalCekBotReply(message);
  }
}
