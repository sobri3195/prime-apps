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

  private detectTopic(message: string): 'booking' | 'price' | 'schedule' | 'bpjs' | 'location' | 'symptom' | 'general' {
    if (['booking', 'reservasi', 'daftar', 'janji'].some((keyword) => message.includes(keyword))) {
      return 'booking';
    }

    if (['biaya', 'harga', 'tarif'].some((keyword) => message.includes(keyword))) {
      return 'price';
    }

    if (['jadwal', 'dokter', 'jam'].some((keyword) => message.includes(keyword))) {
      return 'schedule';
    }

    if (message.includes('bpjs')) {
      return 'bpjs';
    }

    if (['lokasi', 'alamat', 'rute', 'maps'].some((keyword) => message.includes(keyword))) {
      return 'location';
    }

    if (['mata', 'keluhan', 'merah', 'gatal', 'buram', 'kabur', 'nyeri'].some((keyword) => message.includes(keyword))) {
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
      booking: 'Bisa, saya bantu proses booking. Pilih tanggal kunjungan, dokter tujuan, dan nomor kontak yang dapat dihubungi.',
      price: 'Untuk biaya pemeriksaan, petugas klinik dapat mengonfirmasi paket yang sesuai setelah mengetahui jenis pemeriksaan yang Anda butuhkan.',
      schedule: 'Jadwal dokter dapat dicek melalui petugas klinik. Sebutkan hari yang diinginkan agar saya bantu arahkan ke slot yang tersedia.',
      bpjs: 'Layanan BPJS perlu diverifikasi berdasarkan poli, rujukan, dan kuota. Siapkan nomor kartu serta surat rujukan bila ada.',
      location: 'Saya bisa membantu informasi lokasi klinik dan rute. Jika Mapbox aktif, aplikasi dapat menampilkan bantuan peta.',
      symptom: 'Ceritakan keluhan mata Anda: sejak kapan, mata kanan/kiri, ada nyeri, merah, buram, atau riwayat cedera?',
      general: 'Halo, saya CekBot. Saya bisa bantu info layanan, booking, jadwal dokter, biaya, lokasi, dan keluhan mata awal.',
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
      general: ['Booking pemeriksaan', 'Tanya biaya', 'Cek jadwal dokter'],
    } satisfies Record<ReturnType<CekBotService['detectTopic']>, string[]>;

    return actions[topic];
  }
}
