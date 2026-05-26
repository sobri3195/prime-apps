export type HealthStatus = 'Aman' | 'Perlu Pemantauan' | 'Perlu Pemeriksaan Lanjutan' | 'Segera Periksa';
export type PeriodKey = '1bulan' | '3bulan' | '6bulan' | '1tahun';
export type DataTypeKey = 'semua' | 'dokter' | 'ai' | 'resep';

export interface PatientReport {
  patientName: string;
  medicalRecordNumber: string;
  lastVisitDate: string;
  doctorName: string;
  healthStatus: HealthStatus;
  rightVision: string;
  leftVision: string;
  intraocularPressure: number;
  dryEyeRisk: string;
}

export interface VisionTrendItem {
  month: string;
  date: string;
  rightEye: number;
  leftEye: number;
}

export interface PressureTrendItem {
  month: string;
  value: number;
}

export interface ExaminationHistoryItem {
  id: string;
  date: string;
  title: string;
  doctor: string;
  status: string;
  type: 'dokter' | 'ai' | 'resep';
  complaint: string;
  rightVision: string;
  leftVision: string;
  intraocularPressure: number;
  diagnosis: string;
  recommendation: string;
}

export interface LastAiResult {
  id: string;
  date: string;
  riskLevel: string;
  symptoms: string[];
  painLevel: number;
  duration: string;
  summary: string;
  analysisReason: string;
  recommendation: string;
}
