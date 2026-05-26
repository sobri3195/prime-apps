export type PatientProfile = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: string;
  address: string;
  insurance?: string;
  medicalRecordNumber: string;
  role: string;
  status: 'Aktif' | 'Kontrol Berkala';
};

export type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  birthDate: string;
  gender: string;
  address?: string;
  medicalRecordNumber: string;
  status: 'Aktif' | 'Kontrol Berkala';
  history: string;
};

export type MedicalRecord = {
  id: string;
  visitDate: string;
  doctor: string;
  complaint: string;
  diagnosis: string;
  prescription: string;
  result: string;
};

const key = 'prime.profile.state.v1';

const seed = {
  patientProfile: {
    id: 'patient-001', fullName: 'Muhammad Sobri Maulana', phone: '+6281234567890', email: 'sobri.maulana@email.com', birthDate: '1992-03-21', gender: 'Laki-laki', address: 'Jl. Melati Indah No. 23, Makassar', medicalRecordNumber: 'RM-2026-00128', role: 'Pasien Klinik Utama Prime', status: 'Aktif', insurance: 'BPJS Kesehatan',
  } as PatientProfile,
  familyMembers: [
    { id: 'f1', name: 'Siti Aminah', relationship: 'Ibu', phone: '+628119000111', birthDate: '1968-02-11', gender: 'Perempuan', medicalRecordNumber: 'RM-2026-00110', status: 'Aktif', history: 'Kontrol mata kering', address: 'Makassar' },
    { id: 'f2', name: 'Ahmad Maulana', relationship: 'Ayah', phone: '+628119000222', birthDate: '1963-05-04', gender: 'Laki-laki', medicalRecordNumber: 'RM-2025-00095', status: 'Aktif', history: 'Katarak awal', address: 'Makassar' },
    { id: 'f3', name: 'Rafi Maulana', relationship: 'Anak', phone: '+628119000333', birthDate: '2016-07-09', gender: 'Laki-laki', medicalRecordNumber: 'RM-2026-00142', status: 'Kontrol Berkala', history: 'Miopia ringan', address: 'Makassar' },
  ] as FamilyMember[],
  medicalRecords: [
    { id: 'm1', visitDate: '2026-05-12', doctor: 'dr. Sp.M', complaint: 'Mata buram', diagnosis: 'Miopia progresif', prescription: 'Kacamata -1.50', result: 'Visus 6/9' },
  ] as MedicalRecord[],
};

const read = () => JSON.parse(localStorage.getItem(key) ?? JSON.stringify(seed));
const write = (value: unknown) => localStorage.setItem(key, JSON.stringify(value));
const wait = () => new Promise((r) => setTimeout(r, 150));

export async function getPatientProfile() { await wait(); return read().patientProfile as PatientProfile; }
export async function updatePatientProfile(payload: PatientProfile) { const s = read(); s.patientProfile = payload; write(s); return payload; }
export async function getMedicalRecords() { await wait(); return read().medicalRecords as MedicalRecord[]; }
export async function getFamilyMembers() { await wait(); return read().familyMembers as FamilyMember[]; }
export async function addFamilyMember(payload: FamilyMember) { const s = read(); s.familyMembers = [payload, ...s.familyMembers]; write(s); return payload; }
export async function updateFamilyMember(payload: FamilyMember) { const s = read(); s.familyMembers = s.familyMembers.map((m: FamilyMember) => m.id === payload.id ? payload : m); write(s); return payload; }
export async function deleteFamilyMember(id: string) { const s = read(); s.familyMembers = s.familyMembers.filter((m: FamilyMember) => m.id !== id); write(s); }
export async function getDailyWins() { return { points: 0 }; }
export async function completeDailyMission() { return { ok: true }; }
export async function getBadges() { return []; }
export async function getVouchers() { return []; }
export async function redeemVoucher() { return { ok: true }; }
export async function updateSecuritySettings() { return { ok: true }; }
export async function logoutUser() { localStorage.removeItem('prime.profile.state.v1'); return { ok: true }; }
