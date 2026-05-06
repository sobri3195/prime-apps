import { Injectable } from '@nestjs/common';
import type { CekBotIntegrationName, CekBotIntegrationStatus, CekBotMessageRequest, CekBotMessageResponse } from './cekbot.types';

const integrationConfig: Array<CekBotIntegrationStatus & { envKeys: string[] }> = [
  {
    name: 'slack',
    active: false,
    envKeys: ['SLACK_BOT_TOKEN'],
    purpose: 'Notifikasi internal tim klinik saat pasien perlu dibantu petugas.',
  },
  {
    name: 'discord',
    active: false,
    envKeys: ['DISCORD_BOT_TOKEN'],
    purpose: 'Kanal komunitas atau monitoring operasional jika bot Discord digunakan.',
  },
  {
    name: 'twilio',
    active: false,
    envKeys: ['TWILIO_AUTH_TOKEN'],
    purpose: 'Pengiriman follow-up WhatsApp/SMS untuk booking dan eskalasi.',
  },
  {
    name: 'sendgrid',
    active: false,
    envKeys: ['SENDGRID_API_KEY'],
    purpose: 'Pengiriman email ringkasan percakapan atau instruksi pra-kunjungan.',
  },
  {
    name: 'mapbox',
    active: false,
    envKeys: ['MAPBOX_API_KEY'],
    purpose: 'Bantuan lokasi klinik, estimasi rute, dan tautan peta.',
  },
  {
    name: 'supabase',
    active: false,
    envKeys: ['SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    purpose: 'Penyimpanan percakapan dan konteks pasien jika Supabase diaktifkan.',
  },
];

@Injectable()
export class CekBotService {
  getStatus(): CekBotIntegrationStatus[] {
    return integrationConfig.map(({ envKeys, ...integration }) => ({
      ...integration,
      active: envKeys.every((key) => Boolean(process.env[key])),
    }));
  }

  createReply(payload: CekBotMessageRequest): CekBotMessageResponse {
    const message = this.normalizeMessage(payload.message);
    const integrations = this.getStatus();
    const activeChannels = integrations.filter((integration) => integration.active).map((integration) => integration.name);
    const urgency = this.detectUrgency(message);
    const topic = this.detectTopic(message);

    return {
      id: `cekbot-${Date.now()}`,
      reply: this.buildReply(topic, urgency, activeChannels),
      suggestedActions: this.buildSuggestedActions(topic, urgency),
      escalation: {
        needed: urgency.urgent,
        reason: urgency.reason,
        availableChannels: activeChannels,
      },
      integrations,
    };
  }

  private normalizeMessage(message: unknown): string {
    if (typeof message !== 'string') {
      return '';
    }

    return message.trim().toLowerCase();
  }

  private detectUrgency(message: string) {
    const urgentKeywords = ['nyeri hebat', 'sakit sekali', 'pandangan hilang', 'buta mendadak', 'cedera', 'trauma', 'mata berdarah'];
    const urgent = urgentKeywords.some((keyword) => message.includes(keyword));

    return {
      urgent,
      reason: urgent ? 'Keluhan berisiko tinggi dan sebaiknya segera ditangani petugas klinik atau IGD.' : undefined,
    };
  }

  private detectTopic(message: string): 'booking' | 'price' | 'schedule' | 'bpjs' | 'location' | 'symptom' | 'operationalHours' | 'general' {
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

  private buildReply(topic: ReturnType<CekBotService['detectTopic']>, urgency: { urgent: boolean }, activeChannels: CekBotIntegrationName[]): string {
    if (urgency.urgent) {
      return 'Saya mendeteksi keluhan darurat. Mohon segera hubungi petugas klinik atau menuju IGD terdekat. Saya juga menyiapkan eskalasi ke kanal yang aktif.';
    }

    const channelNote = activeChannels.length
      ? ` Integrasi aktif saat ini: ${activeChannels.join(', ')}.`
      : ' Integrasi eksternal belum aktif karena environment variable belum tersedia di server.';

    const replies = {
      booking: 'Bisa, saya bantu booking pemeriksaan. Silakan siapkan nama pasien, nomor WhatsApp aktif, tanggal kunjungan, dan pilihan dokter/jam. Setelah itu admin dapat mengonfirmasi slot yang tersedia.',
      price: 'Estimasi biaya pemeriksaan mata dasar mulai dari Rp150.000. Biaya dapat berbeda untuk pemeriksaan lanjutan seperti refraksi, retina, tekanan bola mata, atau tindakan dokter. Admin akan mengonfirmasi paket yang paling sesuai.',
      schedule: 'Jadwal dokter hari ini tersedia pada pukul 09.00-12.00 dan 15.00-18.00. Untuk memastikan slot, pilih “Booking slot terdekat” atau kirim preferensi jam kunjungan Anda.',
      bpjs: 'Klinik dapat membantu pengecekan layanan BPJS sesuai poli, rujukan, dan kuota harian. Siapkan nomor kartu BPJS, NIK, dan surat rujukan bila ada agar admin bisa verifikasi.',
      location: 'Saya bisa membantu informasi lokasi klinik dan rute. Jika Mapbox aktif, aplikasi dapat menampilkan bantuan peta.',
      symptom: 'Untuk keluhan mata, sebaiknya periksa ke dokter bila nyeri berat, penglihatan tiba-tiba buram/hilang, mata merah disertai sakit, cedera, keluar cairan kental, atau keluhan tidak membaik dalam 1-2 hari. Ceritakan gejala, sejak kapan, dan mata kanan/kiri agar saya bantu arahkan.',
      operationalHours: 'Jam operasional klinik: Senin-Sabtu pukul 08.00-20.00, Minggu pukul 09.00-14.00. Jadwal dokter bisa berbeda, jadi booking lebih dulu disarankan.',
      general: 'Halo, saya CekBot. Saya bisa bantu info layanan, booking, jadwal dokter, biaya, BPJS, jam operasional, lokasi, dan skrining awal keluhan mata.',
    } satisfies Record<typeof topic, string>;

    return `${replies[topic]}${channelNote}`;
  }

  private buildSuggestedActions(topic: ReturnType<CekBotService['detectTopic']>, urgency: { urgent: boolean }): string[] {
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
    } satisfies Record<ReturnType<CekBotService['detectTopic']>, string[]>;

    return actions[topic];
  }
}
