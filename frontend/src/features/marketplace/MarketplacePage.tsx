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

const categories = [
  { name: 'Kacamata', icon: Glasses },
  { name: 'Lensa Kontak', icon: Eye },
  { name: 'Tetes Mata', icon: Pill },
  { name: 'Vitamin Mata', icon: Sparkles },
  { name: 'Paket Klinik', icon: Stethoscope },
];

const products = [
  { name: 'Frame Kacamata Prime Classic', desc: 'Unisex / ringan', price: 'Rp 450.000', icon: Glasses },
  { name: 'Lensa Kontak Harian', desc: '30 lensa', price: 'Rp 85.000', icon: Eye },
  { name: 'Tetes Mata Lubricant', desc: '15 ml', price: 'Rp 55.000', icon: Pill },
  { name: 'Vitamin Mata', desc: 'Suplemen / 30 kapsul', price: 'Rp 95.000', icon: Sparkles },
];

const services = [
  { title: 'Paket Pemeriksaan Mata Lengkap', desc: 'Cek mata menyeluruh', price: 'Rp 150.000', badge: 'Paket' },
  { title: 'Paket Konsultasi Dokter Mata', desc: 'Konsultasi & saran medis', price: 'Rp 200.000', badge: 'Layanan' },
  { title: 'Screening Mata Awal', desc: 'Pemeriksaan awal cepat', price: 'Rp 75.000', badge: 'Layanan' },
  { title: 'Pemeriksaan Minus / Silinder', desc: 'Cek refraksi', price: 'Rp 100.000', badge: 'Layanan' },
];

const trustCards = [
  { title: 'Produk Original', icon: ShieldCheck },
  { title: 'Rekomendasi Dokter', icon: Stethoscope },
  { title: 'Booking Mudah', icon: BookmarkPlus },
];

export function MarketplacePage() {
  return (
    <section className="space-y-4 pb-3">
      <header className="flex items-start justify-between rounded-3xl bg-white px-1 pb-1 pt-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Marketplace</h1>
          <p className="mt-1 text-sm text-slate-500">Belanja kebutuhan mata & booking layanan klinik</p>
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

      <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 p-5 text-white shadow-lg shadow-cyan-200">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-sm" />
        <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-blue-300/40 blur-sm" />
        <div className="relative space-y-3">
          <h2 className="max-w-[260px] text-lg font-semibold leading-snug">Belanja kebutuhan mata & booking layanan</h2>
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
      </article>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Kategori Cepat</h3>
          <p className="text-xs text-cyan-700">Pilih sesuai kebutuhan 👁️</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(({ name, icon: Icon }) => (
            <button key={name} className="min-w-[94px] rounded-2xl border border-cyan-100 bg-white p-2.5 text-center shadow-sm shadow-cyan-50">
              <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-2 text-xs font-medium text-slate-600">{name}</p>
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
          {products.map(({ name, desc, price, icon: Icon }) => (
            <article key={name} className="rounded-3xl border border-cyan-100 bg-white p-3 shadow-sm shadow-cyan-50">
              <div className="flex items-start justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Icon className="h-8 w-8" />
                </div>
                <button className="rounded-lg p-1 text-slate-400">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm font-semibold leading-snug text-slate-900">{name}</p>
              <p className="mt-1 text-xs text-slate-500">{desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-cyan-700">{price}</p>
                <button className="rounded-xl bg-cyan-600 p-2 text-white shadow-sm shadow-cyan-200">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Layanan Klinik</h3>
        <div className="space-y-2">
          {services.map(({ title, desc, price, badge }) => (
            <article key={title} className="rounded-2xl border border-cyan-100 bg-white p-3 shadow-sm shadow-cyan-50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
                    {badge}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{desc}</p>
                </div>
                <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-medium text-white">Booking</button>
              </div>
              <p className="mt-2 text-sm font-semibold text-cyan-700">{price}</p>
            </article>
          ))}
        </div>
      </section>

      <article className="rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 p-4 text-white shadow-lg shadow-cyan-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Promo Hari Ini</p>
        <p className="mt-1 text-lg font-semibold">Diskon hingga 20% untuk produk pilihan.</p>
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

      <p className="text-center text-xs text-slate-400">Butuh bantuan memilih? Tim Klinik Utama Prime siap membantu Anda 🤍</p>
    </section>
  );
}
