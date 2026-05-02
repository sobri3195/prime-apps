# Klinik Utama Mata — PRD + Arsitektur Teknis (SPA/PWA)

## 1) Product Requirements Document (PRD)

### 1.1 Ringkasan Produk
Klinik Utama Mata adalah aplikasi web **mobile-first** dengan arsitektur **SPA** (siap ditingkatkan menjadi **PWA**) untuk pasien dan backoffice klinik. Produk mencakup:
- Aplikasi pasien (bottom navigation 5 menu: Beranda, AI, Marketplace, Profil, Laporan).
- Backoffice (admin, dokter, perawat, kasir, owner, super admin).
- Fitur AI edukasi/screening awal mata (**bukan diagnosis final**).
- Chatbot layanan klinik (**CekBot**).

### 1.2 Tujuan Bisnis
- Meningkatkan booking, kehadiran kontrol, dan kepatuhan pasien.
- Mempercepat operasional klinik (registrasi, antrean, rekam medis, kasir).
- Menumbuhkan pendapatan marketplace layanan/produk secara etis.
- Menyediakan dashboard owner berbasis data.

### 1.3 Non-Goal
- AI tidak memberikan diagnosis final.
- Tidak menggantikan keputusan klinis dokter.
- Tidak mendorong pembelian medis berlebihan.

### 1.4 Persona & Role
1. Pasien
2. Dokter Mata
3. Perawat/Refraksionis
4. Admin Klinik
5. Kasir
6. Apoteker
7. Owner/Manajemen
8. Super Admin

### 1.5 KPI Utama
- Conversion AI screening → booking (target MVP: ≥ 10%).
- Booking completion rate (target MVP: ≥ 70%).
- Monthly active patient.
- Retention 30 hari.
- NPS pasien.
- Error rate API < 1% pada endpoint kritikal.

### 1.6 Batasan & Kepatuhan
- Disclaimer medis wajib di AI Mata/CekBot.
- RBAC ketat untuk data medis.
- Audit log akses data sensitif.
- Enkripsi data sensitif, signed URL untuk file medis.

---

## 2) Rancangan Fitur Lengkap

### 2.1 Aplikasi Pasien
- **Beranda**: greeting, health summary, poin, level, streak, jadwal, antrean, quick actions, promo, artikel, reminder.
- **AI**:
  - **AI Mata**: screening gejala, skor risiko, rekomendasi tindak lanjut, upload foto dokumentasi, riwayat screening.
  - **CekBot**: chat layanan klinik + quick replies + CTA booking.
- **Marketplace**: katalog, filter, cart, checkout, status pembayaran, riwayat order, voucher, redeem poin.
- **Profil**: data akun/pasien, family member, histori klinis & transaksi.
- **Laporan**: summary kesehatan mata, grafik OD/OS, histori pemeriksaan, PDF export.

### 2.2 Backoffice
Dashboard, pasien, antrean, jadwal, rekam medis, resep, kasir, invoice, pembayaran, inventory, marketplace management, AI rule management, CekBot KB, laporan manajemen, audit log, pengaturan klinik, user-role-permission.

---

## 3) Arsitektur Frontend (React + Vite)

```txt
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
├── components/
│   ├── ui/
│   ├── common/
│   ├── bottom-navigation/
│   ├── cards/
│   ├── forms/
│   └── charts/
├── features/
│   ├── auth/
│   ├── home/
│   ├── ai-eye/
│   ├── cekbot/
│   ├── marketplace/
│   ├── profile/
│   ├── reports/
│   ├── gamification/
│   ├── appointments/
│   ├── queue/
│   ├── patients/
│   ├── medical-records/
│   ├── prescriptions/
│   ├── cashier/
│   ├── inventory/
│   └── admin/
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
├── schemas/
└── assets/
```

**Prinsip:** feature-based, lazy routes, protected route, role guard, TanStack Query, Zustand, RHF+Zod, shadcn/ui, Tailwind.

---

## 4) Arsitektur Backend (NestJS)

```txt
src/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── utils/
├── config/
├── database/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── patients/
│   ├── appointments/
│   ├── visits/
│   ├── queue/
│   ├── medical-records/
│   ├── prescriptions/
│   ├── eyeglass-prescriptions/
│   ├── cashier/
│   ├── payments/
│   ├── marketplace/
│   ├── orders/
│   ├── inventory/
│   ├── ai-eye/
│   ├── cekbot/
│   ├── gamification/
│   ├── reports/
│   ├── files/
│   ├── notifications/
│   ├── audit-logs/
│   └── settings/
├── prisma/
└── main.ts
```

**Infra:** PostgreSQL, Redis (cache/queue/session/rate limit), S3/MinIO, JWT/cookie secure session, DTO validation, global exception filter.

---

## 5) Database Schema Prisma (Ringkas + Initial)

> Lihat contoh penuh awal pada bagian kode #19.

Entitas inti: User, Role, Permission, UserRole, Patient, FamilyMember, Appointment, Visit, Queue, MedicalRecord, EyeExamination, Prescription, EyeglassPrescription, Product, ProductCategory, Cart, Order, Invoice, Payment, Inventory, AiEyeScreening, CekBotConversation, GamificationPoint, Badge/Mission/Reward, Notification, FileUpload, AuditLog, ClinicSetting.

Kebijakan umum:
- Semua tabel penting: `id`, `createdAt`, `updatedAt`, opsional `deletedAt`.
- Data medis: `createdBy`, relasi audit log.

---

## 6) API Endpoint Lengkap

### Auth
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/refresh`
- GET `/auth/me`

### Home
- GET `/home/summary`
- GET `/home/reminders`
- GET `/home/articles`
- GET `/home/promos`

### AI Mata
- POST `/ai-eye/screenings`
- GET `/ai-eye/screenings`
- GET `/ai-eye/screenings/:id`
- POST `/ai-eye/upload-photo`
- GET `/ai-eye/recommendations/:id`

### CekBot
- POST `/cekbot/conversations`
- GET `/cekbot/conversations`
- GET `/cekbot/conversations/:id`
- POST `/cekbot/conversations/:id/messages`
- GET `/cekbot/suggestions`

### Marketplace/Cart/Order/Payment
- GET `/marketplace/products`
- GET `/marketplace/products/:id`
- GET `/marketplace/categories`
- POST `/cart/items`
- GET `/cart`
- PATCH `/cart/items/:id`
- DELETE `/cart/items/:id`
- POST `/orders`
- GET `/orders`
- GET `/orders/:id`
- POST `/payments`

### Profile
- GET `/profile`
- PATCH `/profile`
- GET `/profile/family`
- POST `/profile/family`
- PATCH `/profile/family/:id`
- GET `/profile/visits`
- GET `/profile/prescriptions`
- GET `/profile/invoices`

### Reports
- GET `/reports/patient-summary`
- GET `/reports/visual-acuity`
- GET `/reports/intraocular-pressure`
- GET `/reports/medical-history`
- GET `/reports/gamification`
- GET `/reports/download-pdf`

### Gamification
- GET `/gamification/summary`
- GET `/gamification/points`
- GET `/gamification/badges`
- GET `/gamification/missions`
- POST `/gamification/missions/:id/claim`
- GET `/gamification/rewards`
- POST `/gamification/rewards/:id/redeem`

### Admin CRUD
`/admin/patients`, `/admin/visits`, `/admin/medical-records`, `/admin/marketplace`, `/admin/inventory`, `/admin/reports`, `/admin/users`, `/admin/roles`, `/admin/permissions`, `/admin/audit-logs`.

---

## 7) Wireframe Text (Bottom Nav 5 Menu)

```txt
[ App Header ]
[ Content Scroll Area ................................ ]
[ Card ][ Card ][ Card ]

┌─────────────────────────────────────────────────────┐
│  🏠 Beranda   🧠 AI   🛍 Marketplace   👤 Profil   📊 Laporan │
└─────────────────────────────────────────────────────┘
  - fixed bottom
  - safe-area-inset-bottom
  - active tab: filled icon + accent text
```

---

## 8) User Flow Pasien
1. Register/Login
2. Lengkapi profil + pilih/menambah anggota keluarga
3. Beranda → lihat summary + reminder
4. AI Mata screening
5. Risiko sedang/tinggi → CTA booking
6. Booking slot
7. Datang ke klinik → check-in admin
8. Masuk antrean
9. Pemeriksaan awal perawat
10. Pemeriksaan dokter + rekam medis
11. Resep/kacamata bila perlu
12. Kasir invoice + pembayaran
13. Data masuk laporan pasien
14. Dapat poin/badge + reminder kontrol berikutnya

## 9) User Flow Admin Klinik
1. Login admin
2. Registrasi/check-in pasien
3. Kelola antrean realtime
4. Verifikasi tindakan dokter/perawat
5. Generate invoice/pembayaran
6. Update inventory + marketplace
7. Pantau KPI operasional

## 10) User Flow Dokter Mata
1. Login dokter
2. Buka antrean pasien hari ini
3. Review chief complaint + riwayat
4. Isi pemeriksaan mata detail
5. Tetapkan diagnosis + plan
6. Buat resep obat/kacamata
7. Set kontrol berikutnya
8. Submit EMR (audit logged)

---

## 11) Sistem Gamifikasi
- Nama poin: **Poin Sehat Mata**
- Level: Pemula → Sadar → Sahabat → Guardian → Champion
- Event poin: booking tepat waktu, screening AI, edukasi, check-in, reminder completed.
- Badge: Kontrol Tepat Waktu, Rajin Cek Mata, dst.
- Mission harian/mingguan.
- Guardrail etis:
  - Tidak memalukan pasien.
  - Tidak menggantikan keputusan medis.
  - Tidak memaksa transaksi medis.

---

## 12) Desain UI Components
- AppShell
- BottomNavigation
- PageHeader
- HealthSummaryCard
- PointCard
- LevelProgressCard
- MissionCard
- AppointmentCard
- QueueCard
- AiEyeScreeningForm
- RiskResultCard
- CekBotChat
- ProductCard
- CartSheet
- ProfileCard
- FamilySwitcher
- ReportChartCard
- BadgeCard
- RewardCard
- EmptyState / LoadingState / ErrorState
- ProtectedRoute / RoleGuard

---

## 13) Contoh Kode Awal React + Vite

```bash
npm create vite@latest klinik-utama-mata -- --template react-ts
cd klinik-utama-mata
npm i react-router-dom @tanstack/react-query zustand zod react-hook-form @hookform/resolvers lucide-react
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`src/main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

## 14) Contoh BottomNavigation (lucide-react)

```tsx
import { Home, Brain, ShoppingBag, User, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menus = [
  { to: '/home', label: 'Beranda', icon: Home },
  { to: '/ai', label: 'AI', icon: Brain },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/profile', label: 'Profil', icon: User },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-white/95 backdrop-blur supports-[padding:max(0px)]:pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {menus.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 text-xs transition ${
                  isActive ? 'text-cyan-600' : 'text-slate-500'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

---

## 15) Contoh Route React Router (lazy + guard)

```tsx
import { Navigate, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('@/features/home/HomePage'));
const AiPage = lazy(() => import('@/features/ai-eye/AiPage'));

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = true;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return useRoutes([
    { path: '/', element: <Navigate to="/home" replace /> },
    {
      element: <ProtectedRoute><Suspense fallback={<>Loading...</>}><HomePage /></Suspense></ProtectedRoute>,
      path: '/home',
    },
    {
      element: <ProtectedRoute><Suspense fallback={<>Loading...</>}><AiPage /></Suspense></ProtectedRoute>,
      path: '/ai',
    },
  ]);
}
```

---

## 16) Contoh Service API + TanStack Query

```ts
// services/aiEye.ts
import { useMutation, useQuery } from '@tanstack/react-query';

type ScreeningPayload = {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  painLevel: number;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export function useAiScreenings() {
  return useQuery({ queryKey: ['ai-screenings'], queryFn: () => api('/ai-eye/screenings') });
}

export function useCreateAiScreening() {
  return useMutation({
    mutationFn: (payload: ScreeningPayload) =>
      api('/ai-eye/screenings', { method: 'POST', body: JSON.stringify(payload) }),
  });
}
```

---

## 17) Contoh Form AI Mata (RHF + Zod)

```tsx
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAiScreening } from '@/services/aiEye';

const schema = z.object({
  chiefComplaint: z.string().min(3),
  symptoms: z.array(z.string()).min(1),
  duration: z.string().min(1),
  painLevel: z.number().min(0).max(10),
  traumaHistory: z.boolean().default(false),
  blurredVision: z.boolean().default(false),
});

type FormValue = z.infer<typeof schema>;

export function AiEyeScreeningForm() {
  const mutation = useCreateAiScreening();
  const { register, handleSubmit, setValue } = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: { symptoms: [], painLevel: 0 },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
      <input {...register('chiefComplaint')} placeholder="Keluhan utama" className="w-full rounded-xl border p-3" />
      <input {...register('duration')} placeholder="Durasi keluhan" className="w-full rounded-xl border p-3" />
      <input
        type="range"
        min={0}
        max={10}
        onChange={(e) => setValue('painLevel', Number(e.target.value))}
      />
      <button className="w-full rounded-xl bg-cyan-600 p-3 text-white">Kirim Screening</button>
    </form>
  );
}
```

---

## 18) Contoh Modul NestJS untuk AI Mata

```ts
// modules/ai-eye/ai-eye.module.ts
import { Module } from '@nestjs/common';
import { AiEyeController } from './ai-eye.controller';
import { AiEyeService } from './ai-eye.service';

@Module({
  controllers: [AiEyeController],
  providers: [AiEyeService],
})
export class AiEyeModule {}
```

```ts
// modules/ai-eye/ai-eye.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiEyeService } from './ai-eye.service';

@Controller('ai-eye')
export class AiEyeController {
  constructor(private readonly service: AiEyeService) {}

  @Post('screenings')
  create(@Body() body: any) {
    return this.service.createScreening(body);
  }

  @Get('screenings')
  list() {
    return this.service.getScreenings();
  }

  @Get('screenings/:id')
  detail(@Param('id') id: string) {
    return this.service.getScreeningById(id);
  }
}
```

```ts
// modules/ai-eye/ai-eye.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiEyeService {
  createScreening(payload: any) {
    const riskScore = (payload.painLevel || 0) + (payload.blurredVision ? 3 : 0) + (payload.traumaHistory ? 4 : 0);
    const riskLevel = riskScore >= 8 ? 'HIGH' : riskScore >= 4 ? 'MEDIUM' : 'LOW';
    return {
      ...payload,
      riskScore,
      riskLevel,
      disclaimer: 'AI Mata bukan pengganti dokter. Diagnosis final oleh dokter mata.',
    };
  }

  getScreenings() {
    return [];
  }

  getScreeningById(id: string) {
    return { id };
  }
}
```

---

## 19) Contoh Prisma Schema Awal

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RoleCode {
  PATIENT
  DOCTOR
  NURSE
  ADMIN
  CASHIER
  PHARMACIST
  OWNER
  SUPER_ADMIN
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  fullName     String
  phone        String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?

  patient      Patient?
  roles        UserRole[]
}

model Role {
  id        String   @id @default(cuid())
  code      RoleCode @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users UserRole[]
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  role Role @relation(fields: [roleId], references: [id])

  @@unique([userId, roleId])
}

model Patient {
  id                  String   @id @default(cuid())
  userId               String   @unique
  medicalRecordNumber String   @unique
  dateOfBirth         DateTime?
  gender              String?
  address             String?
  diabetesHistory     Boolean  @default(false)
  hypertensionHistory Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user          User             @relation(fields: [userId], references: [id])
  screenings    AiEyeScreening[]
  appointments  Appointment[]
}

model Appointment {
  id         String   @id @default(cuid())
  patientId  String
  scheduleAt DateTime
  status     String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  patient Patient @relation(fields: [patientId], references: [id])
}

model AiEyeScreening {
  id                 String   @id @default(cuid())
  patientId          String
  chiefComplaint     String
  symptoms           String[]
  duration           String
  painLevel          Int
  blurredVision      Boolean  @default(false)
  traumaHistory      Boolean  @default(false)
  riskScore          Int
  riskLevel          String
  recommendation     String?
  educationContent   String?
  uploadedEyePhoto   String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  patient Patient @relation(fields: [patientId], references: [id])
}
```

---

## 20) Roadmap (MVP → Beta → Production)

### MVP (8–12 minggu)
- Auth (register/login/me)
- Beranda dasar
- Bottom nav 5 menu
- AI Mata sederhana (form + risk score rule-based)
- CekBot dummy chat
- Marketplace basic (list/detail/cart ringan)
- Profil pasien + family dasar
- Laporan dasar
- Booking pemeriksaan
- Gamifikasi sederhana (poin+badge)
- Admin panel sederhana (pasien, antrean, booking)

### Beta (8 minggu)
- Payment gateway & invoice matang
- Rekam medis lebih lengkap + resep
- Redis queue/notifikasi
- AI recommendation tuning
- Dashboard owner/manajemen
- Export PDF laporan pasien

### Production (berkelanjutan)
- Hardening security (CSRF, encryption at rest, SIEM)
- Observability (APM, tracing)
- PWA penuh (offline cache terpilih, install prompt)
- Integrasi WhatsApp/SMS reminder
- AI governance + auditability

---

## Catatan Implementasi MVP Prioritas
1. Start dari patient app + admin mini.
2. Gunakan rule-based AI dulu sebelum model AI kompleks.
3. Gunakan dummy data + mock service untuk percepat UI.
4. Pastikan disclaimer medis muncul di AI & CekBot.
