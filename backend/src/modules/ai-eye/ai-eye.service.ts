import { Injectable } from '@nestjs/common';

@Injectable()
export class AiEyeService {
  private data: Array<Record<string, unknown>> = [];

  createScreening(payload: Record<string, unknown>) {
    const painLevel = Number(payload.painLevel ?? 0);
    const riskScore = painLevel + (payload.blurredVision ? 3 : 0) + (payload.traumaHistory ? 4 : 0);
    const riskLevel = riskScore >= 8 ? 'HIGH' : riskScore >= 4 ? 'MEDIUM' : 'LOW';

    const result = {
      id: crypto.randomUUID(),
      ...payload,
      riskScore,
      riskLevel,
      recommendation:
        riskLevel === 'HIGH'
          ? 'Darurat, segera ke fasilitas kesehatan.'
          : riskLevel === 'MEDIUM'
            ? 'Disarankan booking pemeriksaan.'
            : 'Edukasi mandiri dan monitor gejala.',
      disclaimer: 'AI Mata bukan pengganti dokter. Diagnosis final hanya oleh dokter mata.',
    };

    this.data.push(result);
    return result;
  }

  getScreenings() {
    return this.data;
  }

  getScreeningById(id: string) {
    return this.data.find((row) => row.id === id) ?? null;
  }
}
