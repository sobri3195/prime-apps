import {
  Bell,
  BookmarkPlus,
  Eye,
  Filter,
  Glasses,
  Heart,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useState } from 'react';
import frameClassicImage from '@/assets/marketplace/frame-classic.svg';
import contactLensImage from '@/assets/marketplace/contact-lens.svg';
import eyeDropsImage from '@/assets/marketplace/eye-drops.svg';
import eyeVitaminImage from '@/assets/marketplace/eye-vitamin.svg';
import clinicCheckupImage from '@/assets/marketplace/clinic-checkup.svg';
import { RewardSection } from '../gamification/GamificationComponents';
import { POINT_RULES, useGamificationStore } from '../gamification/gamificationStore';

const categories = [
  { name: 'Kacamata', icon: Glasses, image: frameClassicImage },
  { name: 'Lensa Kontak', icon: Eye, image: contactLensImage },
  { name: 'Tetes Mata', icon: Pill, image: eyeDropsImage },
  { name: 'Vitamin Mata', icon: Sparkles, image: eyeVitaminImage },
  { name: 'Paket Klinik', icon: Stethoscope, image: clinicCheckupImage },
];

const products = [
  {
    name: 'Frame Kacamata Prime Classic',
    desc: 'Unisex / ringan',
    price: 'Rp 450.000',
    icon: Glasses,
    image: frameClassicImage,
    badge: 'Best seller',
  },
  {
    name: 'Lensa Kontak Harian',
    desc: '30 lensa steril',
    price: 'Rp 85.000',
    icon: Eye,
    image: contactLensImage,
    badge: 'Nyaman',
  },
  {
    name: 'Tetes Mata Lubricant',
    desc: '15 ml untuk mata kering',
    price: 'Rp 55.000',
    icon: Pill,
    image: eyeDropsImage,
    badge: 'Original',
  },
  {
    name: 'Vitamin Mata',
    desc: 'Suplemen / 30 kapsul',
    price: 'Rp 95.000',
    icon: Sparkles,
    image: eyeVitaminImage,
    badge: 'Rekomendasi',
  },
];

const services = [
  {
    title: 'Paket Pemeriksaan Mata Lengkap',
    desc: 'Cek mata menyeluruh dengan dokter & optometri',
    price: 'Rp 150.000',
    badge: 'Paket',
    image: clinicCheckupImage,
  },
  {
    title: 'Paket Konsultasi Dokter Mata',
    desc: 'Konsultasi & saran medis',
    price: 'Rp 200.000',
    badge: 'Layanan',
    image: clinicCheckupImage,
  },
  {
    title: 'Screening Mata Awal',
    desc: 'Pemeriksaan awal cepat',
    price: 'Rp 75.000',
    badge: 'Layanan',
    image: eyeDropsImage,
  },
  {
    title: 'Pemeriksaan Minus / Silinder',
    desc: 'Cek refraksi dan resep kacamata',
    price: 'Rp 100.000',
    badge: 'Layanan',
    image: frameClassicImage,
  },
];

const trustCards = [
  { title: 'Produk Original', icon: ShieldCheck },
  { title: 'Rekomendasi Dokter', icon: Stethoscope },
  { title: 'Booking Mudah', icon: BookmarkPlus },
];

export function MarketplacePage() {
  const [feedback, setFeedback] = useState('');
  const addPoints = useGamificationStore((state) => state.addPoints);
  const userId = 'patient-001';

  const rewardMarketplacePurchase = (itemName: string) => {
    addPoints(userId, 'marketplace_purchase', POINT_RULES.marketplace_purchase, `Pembelian marketplace: ${itemName}`);
    setFeedback(`Pembelian ${itemName} dicatat. +20 poin Daily Wins.`);
  };

  const rewardBooking = (serviceTitle: string) => {
    addPoints(userId, 'booking_created', POINT_RULES.booking_created, `Booking layanan: ${serviceTitle}`);
    setFeedback(`Booking ${serviceTitle} berhasil. +25 poin Daily Wins.`);
  };

  return (
    <section className="space-y-4 pb-3">
      <header className="flex items-start justify-between rounded-3xl bg-white px-1 pb-1 pt-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Marketplace</h1>
          <p className="mt-1 text-sm text-slate-500">Fokus belanja kebutuhan mata dengan gambar produk jelas</p>
        </div>
        <button className="relative rounded-2xl border border-cyan-100 bg-cyan-50 p-2.5 text-cyan-700 shadow-sm">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </button>
      </header>

      <div className="flex gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-2xl border border-cyan-100 bg-white px-3 py-3 shadow-sm shadow-cyan-50">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Cari produk atau layanan mata"
          />
        </label>
        <button className="rounded-2xl border border-cyan-100 bg-white px-3 text-cyan-700 shadow-sm shadow-cyan-50">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {feedback && (
        <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{feedback}</p>
      )}

      <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 p-5 text-white shadow-lg shadow-cyan-200">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-sm" />
        <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-blue-300/40 blur-sm" />
        <div className="relative grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <h2 className="max-w-[260px] text-lg font-semibold leading-snug">Etalase fokus kebutuhan mata Prime</h2>
            <p className="text-sm leading-relaxed text-cyan-50">
              Produk terpercaya dan layanan profesional untuk kesehatan mata Anda.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['Aman & Terpercaya', 'Produk Berkualitas', 'Booking Mudah'].map((point) => (
                <span key={point} className="rounded-xl bg-white/20 px-2 py-1.5 text-center text-[11px] font-medium">
                  {point}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white/18 p-2 backdrop-blur-sm">
            <img
              src={clinicCheckupImage}
              alt="Ilustrasi produk dan layanan pemeriksaan mata Prime"
              className="h-36 w-full rounded-2xl object-cover shadow-lg shadow-blue-900/10"
            />
          </div>
        </div>
      </article>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Kategori Cepat</h3>
          <p className="text-xs text-cyan-700">Pilih sesuai kebutuhan 👁️</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(({ name, icon: Icon, image }) => (
            <button key={name} className="min-w-[112px] overflow-hidden rounded-2xl border border-cyan-100 bg-white text-center shadow-sm shadow-cyan-50">
              <img src={image} alt={`Gambar kategori ${name}`} className="h-16 w-full object-cover" />
              <div className="p-2">
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-1.5 text-xs font-medium text-slate-600">{name}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Produk Pilihan</h3>
          <button className="text-xs font-medium text-cyan-700">Lihat semua</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.map(({ name, desc, price, icon: Icon, image, badge }) => (
            <article key={name} className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-sm shadow-cyan-50">
              <div className="relative">
                <img src={image} alt={`Foto produk ${name}`} className="h-32 w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-cyan-700 shadow-sm">
                  {badge}
                </span>
                <button className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-slate-400 shadow-sm">
                  <Heart className="h-4 w-4" />
                </button>
                <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-cyan-700 shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold leading-snug text-slate-900">{name}</p>
                <p className="mt-1 text-xs text-slate-500">{desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-cyan-700">{price}</p>
                  <button
                    type="button"
                    onClick={() => rewardMarketplacePurchase(name)}
                    className="rounded-xl bg-cyan-600 p-2 text-white shadow-sm shadow-cyan-200"
                    aria-label={`Beli ${name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Layanan Klinik</h3>
        <div className="space-y-2">
          {services.map(({ title, desc, price, badge, image }) => (
            <article key={title} className="rounded-2xl border border-cyan-100 bg-white p-3 shadow-sm shadow-cyan-50">
              <div className="flex items-start gap-3">
                <img src={image} alt={`Gambar layanan ${title}`} className="h-20 w-20 flex-none rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
                    {badge}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => rewardBooking(title)}
                  className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-medium text-white"
                >
                  Booking
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold text-cyan-700">{price}</p>
            </article>
          ))}
        </div>
      </section>

      <article className="rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 p-4 text-white shadow-lg shadow-cyan-200">
        <div className="flex items-center gap-3">
          <img src={contactLensImage} alt="Gambar promo produk lensa kontak" className="h-20 w-24 rounded-2xl object-cover" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Promo Hari Ini</p>
            <p className="mt-1 text-lg font-semibold">Diskon hingga 20% untuk produk pilihan.</p>
          </div>
        </div>
        <button className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-medium text-cyan-700">Lihat Promo</button>
      </article>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Kenapa pilih Marketplace Prime?</h3>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {trustCards.map(({ title, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-cyan-100 bg-white p-2.5 text-center shadow-sm shadow-cyan-50">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-600">{title}</p>
            </article>
          ))}
        </div>
      </section>

      <RewardSection />

      <p className="text-center text-xs text-slate-400">Butuh bantuan memilih? Tim Klinik Utama Prime siap membantu Anda 🤍</p>
    </section>
  );
}
