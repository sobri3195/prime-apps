import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Bell, CalendarDays, CheckCircle2, ChevronRight, Lock, Mail, MapPin, Phone, Settings, ShieldCheck, UserRound, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { addFamilyMember, deleteFamilyMember, getFamilyMembers, getMedicalRecords, getPatientProfile, type FamilyMember, type MedicalRecord, type PatientProfile, updateFamilyMember, updatePatientProfile } from './profileService';

type Toast = { type: 'success' | 'error'; message: string } | null;
const phoneMask = (v: string) => v.length > 7 ? `${v.slice(0, 3)}******${v.slice(-4)}` : v;
const emailMask = (v: string) => { const [n, d] = v.split('@'); return `${(n || '').slice(0, 3)}***@${d || ''}`; };
const personalSchema = z.object({ fullName: z.string().min(1), phone: z.string().regex(/^\+62\d{8,13}$/), email: z.string().email(), birthDate: z.string().refine((d) => new Date(d) <= new Date(), 'Tanggal lahir tidak valid'), gender: z.enum(['Laki-laki', 'Perempuan']), address: z.string().optional(), insurance: z.string().optional() });
const familySchema = z.object({ id: z.string().optional(), name: z.string().min(1), relationship: z.string().min(1), birthDate: z.string().optional(), phone: z.string().optional(), isEmergencyContact: z.boolean().default(false) });

const profileMenus = [
  ['Data Pribadi', '/profile/personal-data'], ['Dokumen Medis', '/profile/medical-documents'], ['Riwayat Pemeriksaan', '/laporan'], ['Resep Kacamata', '/profile/prescription'], ['Hasil AI Mata', '/ai/history'], ['Alamat & Kontak', '/profile/contact'], ['Pengaturan Notifikasi', '/profile/notifications'], ['Bantuan Klinik', '/help'],
] as const;

export function ProfilPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [patient, setPatient] = useState<PatientProfile | null>(null); const [family, setFamily] = useState<FamilyMember[]>([]); const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [points, setPoints] = useState(() => Number(localStorage.getItem('prime.points') || 120));
  const [checkedIn, setCheckedIn] = useState(() => localStorage.getItem('prime.checkin.date') === new Date().toISOString().slice(0, 10));
  const [modal, setModal] = useState<string | null>(null); const [selectedFamily, setSelectedFamily] = useState<FamilyMember | null>(null); const [toast, setToast] = useState<Toast>(null);

  const profileForm = useForm<z.infer<typeof personalSchema>>({ resolver: zodResolver(personalSchema) });
  const familyForm = useForm<z.infer<typeof familySchema>>({ resolver: zodResolver(familySchema), defaultValues: { isEmergencyContact: false } });

  useEffect(() => { (async () => { try { setLoading(true); setPatient(await getPatientProfile()); setFamily(await getFamilyMembers()); setRecords(await getMedicalRecords()); } catch { setError('Gagal memuat data profil.'); } finally { setLoading(false); } })(); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  const latestRecord = records[0];
  const vouchers = useMemo(() => [
    { id: 'v1', name: 'Voucher diskon pemeriksaan Rp10.000', required: 100 },
    { id: 'v2', name: 'Voucher diskon produk marketplace 8%', required: 160 },
    { id: 'v3', name: 'Gratis konsultasi singkat online', required: 200 },
    { id: 'v4', name: 'Prioritas antrean', required: 260 },
  ], []);

  if (loading) return <div className='space-y-3'>{[1,2,3].map(i=><div key={i} className='h-24 animate-pulse rounded-2xl bg-prime-cream/60'/>)}</div>;
  if (error) return <div className='rounded-2xl bg-red-50 p-4 text-red-600'><AlertCircle className='inline mr-2'/> {error}</div>;
  if (!patient) return <div className='rounded-2xl bg-prime-cream p-4'>Data profil kosong.</div>;

  const openProfileEdit = () => { profileForm.reset({ fullName: patient.fullName, phone: patient.phone, email: patient.email, birthDate: patient.birthDate, gender: (patient.gender as 'Laki-laki' | 'Perempuan') || 'Laki-laki', address: patient.address, insurance: patient.insurance || '' }); setModal('edit'); };

  return <section className='space-y-4 pb-2'>
    <header className='flex items-start justify-between'><div><h1 className='text-3xl font-bold'>Profil Pasien</h1><p className='text-sm text-prime-black/60'>Kelola data pribadi dan aktivitas akun Anda.</p></div><button aria-label='Pengaturan akun' className='rounded-xl border p-2' onClick={()=>setModal('settings')}><Settings size={18}/></button></header>

    <article className='rounded-3xl bg-gradient-to-br from-prime-black via-prime-gold to-[#d7bd64] p-4 text-white'><div className='flex justify-between'><div className='flex gap-3'><div className='grid h-14 w-14 place-items-center rounded-2xl bg-white/20'><UserRound/></div><div><p className='font-semibold'>{patient.fullName}</p><p className='text-xs'>No RM: {patient.medicalRecordNumber}</p></div></div><span className='rounded-full bg-white px-2 py-1 text-xs text-prime-black'>{patient.status}</span></div><button onClick={openProfileEdit} className='mt-3 min-h-11 rounded-xl bg-white px-3 text-prime-gold'>Edit Profil</button></article>

    <article className='rounded-3xl bg-white p-4 shadow-sm'><h2 className='font-semibold'>Daily Wins Ringkas</h2><p className='text-sm'>Poin {points} • Streak 3 hari • {checkedIn ? 'Sudah check-in hari ini' : 'Belum check-in hari ini'}</p><div className='mt-3 flex gap-2'><button className='min-h-11 rounded-xl border px-3' onClick={()=>setModal('missions')}>Lihat Misi</button><button disabled={checkedIn} className='min-h-11 rounded-xl bg-prime-gold px-3 text-white disabled:opacity-50' onClick={()=>{ const next=points+10; setPoints(next); setCheckedIn(true); localStorage.setItem('prime.points', String(next)); localStorage.setItem('prime.checkin.date', new Date().toISOString().slice(0,10)); setToast({type:'success',message:'Check-in berhasil, +10 poin.'});}}>Check-in Harian +10 poin</button></div></article>

    <article className='rounded-3xl bg-white p-4 shadow-sm'><h2 className='font-semibold'>Informasi Akun</h2><ul className='mt-2 space-y-2 text-sm'><li>Nomor HP: {phoneMask(patient.phone)}</li><li>Email: {emailMask(patient.email)}</li><li>Alamat: {patient.address?.slice(0,20)}...</li></ul><button className='mt-2 min-h-11 rounded-xl border px-3' onClick={()=>setModal('detail-akun')}>Lihat Detail</button></article>

    <article className='rounded-3xl bg-white p-4 shadow-sm'><h2 className='font-semibold'>Ringkasan Rekam Medis</h2>{latestRecord ? <><p className='mt-2 text-sm'>{latestRecord.visitDate} • {latestRecord.complaint} • {latestRecord.doctor} • {latestRecord.result}</p><button className='mt-2 min-h-11 rounded-xl bg-prime-gold px-3 text-white' onClick={()=>nav('/laporan')}>Lihat Rekam Medis</button></> : <p className='text-sm mt-2'>Belum ada rekam medis. Silakan lakukan pemeriksaan terlebih dahulu.</p>}</article>

    <article className='rounded-3xl bg-white p-4 shadow-sm'><div className='flex items-center justify-between'><h2 className='font-semibold'>Keluarga Terdaftar</h2><button className='min-h-11 rounded-xl border px-3' onClick={()=>{familyForm.reset({isEmergencyContact:false}); setSelectedFamily(null); setModal('family');}}>Tambah Anggota Keluarga</button></div><div className='mt-2 space-y-2'>{family.length===0 ? <p className='text-sm'>Belum ada anggota keluarga terdaftar.</p> : family.map(f=><div key={f.id} className='rounded-xl bg-prime-cream/40 p-3 text-sm'><div className='flex justify-between'><span>{f.name} ({f.relationship})</span><span>{f.status}</span></div><div className='mt-2 flex gap-2'><button className='rounded-lg border px-2' onClick={()=>{ setSelectedFamily(f); familyForm.reset({ id:f.id,name:f.name,relationship:f.relationship,birthDate:f.birthDate,phone:f.phone,isEmergencyContact:false }); setModal('family'); }}>Edit</button><button className='rounded-lg border px-2' onClick={()=>{ setSelectedFamily(f); setModal('delete-family'); }}>Hapus</button></div></div>)}</div></article>

    <article className='rounded-3xl bg-white p-4 shadow-sm'><h2 className='font-semibold'>Menu Profil</h2><ul>{profileMenus.map(([label,route])=><li key={label}><button className='flex min-h-11 w-full items-center justify-between border-b py-2 text-sm' onClick={()=>route==='/laporan'?nav(route):setModal('todo')}><span>{label}</span><ChevronRight size={16}/></button></li>)}</ul></article>

    <article className='rounded-3xl bg-white p-4 shadow-sm'><h2 className='font-semibold'>Keamanan Akun</h2><div className='mt-2 grid gap-2'>{['Ubah Password','Verifikasi Nomor HP','Verifikasi Email','PIN / Biometrik Aplikasi','Logout dari semua perangkat'].map(i=><button key={i} className='flex min-h-11 items-center justify-between rounded-xl border px-3 text-sm' onClick={()=>setModal(i)}><span>{i}</span><Lock size={15}/></button>)}</div></article>

    <article className='rounded-3xl bg-white p-4 shadow-sm'><h2 className='font-semibold'>Reward & Voucher</h2><p className='text-sm'>Total poin {points}</p><div className='mt-2 space-y-2'>{vouchers.map(v=><div key={v.id} className='rounded-xl border p-2 text-sm'><p>{v.name}</p><p>{v.required} poin</p><button className='mt-1 min-h-11 rounded-lg bg-prime-cream px-3' onClick={()=>{ if (points<v.required) return setToast({type:'error',message:'Poin belum cukup.'}); const next=points-v.required; setPoints(next); localStorage.setItem('prime.points', String(next)); setToast({type:'success',message:'Voucher berhasil ditukar.'}); }}>Pilih/Tukar</button></div>)}</div></article>

    <button className='min-h-11 w-full rounded-2xl border border-red-200 bg-red-50 text-red-600' onClick={()=>setModal('logout')}>Keluar Akun</button>

    {modal && <div className='fixed inset-0 z-[60] grid place-items-end bg-black/40 p-4' onClick={()=>setModal(null)}><div onClick={(e)=>e.stopPropagation()} className='w-full max-w-[430px] rounded-3xl bg-white p-4'><div className='mb-2 flex justify-between'><h3 className='font-semibold'>{modal}</h3><button aria-label='Tutup modal' onClick={()=>setModal(null)}><X/></button></div>
      {modal==='settings' && <p>Pengaturan akun sedang disiapkan.</p>}
      {modal==='missions' && <p>Route /daily-wins sedang disiapkan.</p>}
      {modal==='detail-akun' && <div className='text-sm space-y-1'><p><Phone className='inline mr-1' size={14}/>{patient.phone}</p><p><Mail className='inline mr-1' size={14}/>{patient.email}</p><p><CalendarDays className='inline mr-1' size={14}/>{patient.birthDate}</p><p><MapPin className='inline mr-1' size={14}/>{patient.address}</p><button className='mt-2 rounded-xl border px-3 py-2' onClick={openProfileEdit}>Edit</button></div>}
      {modal==='edit' && <form className='space-y-2' onSubmit={profileForm.handleSubmit(async(v)=>{ try { const payload = { ...patient, ...v }; await updatePatientProfile(payload); setPatient(payload); setModal(null); setToast({type:'success',message:'Profil berhasil diperbarui.'}); } catch { setToast({type:'error',message:'Gagal menyimpan profil. Coba lagi.'}); } })}>{['fullName','phone','email','birthDate','gender','insurance','address'].map((k)=><input key={k} aria-label={k} type={k==='birthDate'?'date':'text'} {...profileForm.register(k as keyof z.infer<typeof personalSchema>)} className='w-full rounded-xl border p-2'/>) }<button className='min-h-11 rounded-xl bg-prime-gold px-3 text-white'>Simpan</button></form>}
      {modal==='family' && <form className='space-y-2' onSubmit={familyForm.handleSubmit(async(v)=>{ const payload: FamilyMember = { id: v.id || crypto.randomUUID(), name:v.name, relationship:v.relationship, birthDate:v.birthDate || '', phone:v.phone || '', gender:'', address:'', medicalRecordNumber:'RM-'+Date.now().toString().slice(-6), status:'Aktif', history:v.isEmergencyContact?'Kontak darurat':'Belum ada riwayat' }; selectedFamily ? await updateFamilyMember(payload) : await addFamilyMember(payload); setFamily(await getFamilyMembers()); setModal(null); setToast({type:'success',message:'Data keluarga berhasil disimpan.'}); })}><input {...familyForm.register('name')} placeholder='Nama anggota keluarga' className='w-full rounded-xl border p-2'/><input {...familyForm.register('relationship')} placeholder='Hubungan keluarga' className='w-full rounded-xl border p-2'/><input type='date' {...familyForm.register('birthDate')} className='w-full rounded-xl border p-2'/><input {...familyForm.register('phone')} placeholder='Nomor HP opsional' className='w-full rounded-xl border p-2'/><label className='text-sm flex gap-2'><input type='checkbox' {...familyForm.register('isEmergencyContact')}/> Kontak darurat</label><button className='min-h-11 rounded-xl bg-prime-gold px-3 text-white'>Simpan</button></form>}
      {modal==='delete-family' && <div><p>Hapus anggota keluarga ini?</p><div className='mt-2 flex gap-2'><button className='rounded-xl border px-3 py-2' onClick={()=>setModal(null)}>Batal</button><button className='rounded-xl bg-red-500 px-3 py-2 text-white' onClick={async()=>{ if (selectedFamily) await deleteFamilyMember(selectedFamily.id); setFamily(await getFamilyMembers()); setModal(null); }}>Hapus</button></div></div>}
      {modal==='logout' && <div><p>Apakah Anda yakin ingin keluar dari akun?</p><div className='mt-2 flex gap-2'><button className='rounded-xl border px-3 py-2' onClick={()=>setModal(null)}>Batal</button><button className='rounded-xl bg-red-500 px-3 py-2 text-white' onClick={()=>{ localStorage.clear(); setToast({type:'success',message:'Anda telah keluar.'}); window.location.href='/login'; }}>Keluar</button></div></div>}
      {['Ubah Password','Verifikasi Nomor HP','Verifikasi Email','PIN / Biometrik Aplikasi','Logout dari semua perangkat','todo'].includes(modal) && <button className='min-h-11 rounded-xl bg-prime-gold px-3 text-white' onClick={()=>{ setModal(null); setToast({type:'success',message: modal==='Ubah Password'?'Password berhasil diperbarui.': modal==='Verifikasi Nomor HP'?'Kode OTP dikirim.': modal==='Verifikasi Email'?'Email verifikasi dikirim.': modal==='PIN / Biometrik Aplikasi'?'PIN aplikasi berhasil diaktifkan.':'Fitur ini sedang disiapkan.'}); }}>{modal==='todo'?'Tutup':'Lanjutkan'}</button>}
    </div></div>}
    {toast && <div className={`fixed left-1/2 top-4 z-[70] -translate-x-1/2 rounded-xl px-4 py-2 text-sm text-white ${toast.type==='success'?'bg-prime-black':'bg-red-500'}`}><CheckCircle2 className='inline mr-1' size={14}/>{toast.message}</div>}
  </section>;
}
