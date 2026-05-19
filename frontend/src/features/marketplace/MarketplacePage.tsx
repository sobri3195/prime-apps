import {
  BookmarkPlus,
  CheckCircle2,
  Coins,
  Eye,
  Filter,
  Gift,
  Glasses,
  Heart,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import frameClassicImage from '@/assets/marketplace/frame-classic.svg';
import contactLensImage from '@/assets/marketplace/contact-lens.svg';
import eyeDropsImage from '@/assets/marketplace/eye-drops.svg';
import eyeVitaminImage from '@/assets/marketplace/eye-vitamin.svg';
import clinicCheckupImage from '@/assets/marketplace/clinic-checkup.svg';
import {
  POINT_RULES,
  useGamificationStore,
} from '../gamification/gamificationStore';

const MARKETPLACE_CART_KEY = 'prime_marketplace_cart';
const MARKETPLACE_FAVORITES_KEY = 'prime_marketplace_favorites';
const MARKETPLACE_SELECTED_CATEGORY_KEY = 'prime_marketplace_selected_category';
const DEFAULT_CATEGORY = 'Semua';

type CategoryName =
  | 'Semua'
  | 'Kacamata'
  | 'Lensa Kontak'
  | 'Tetes Mata'
  | 'Vitamin Mata'
  | 'Pemeriksaan';

type Product = {
  name: string;
  desc: string;
  price: string;
  priceValue: number;
  category: CategoryName;
  icon: LucideIcon;
  image: string;
  badge: string;
};

type Service = {
  title: string;
  desc: string;
  price: string;
  priceValue: number;
  category: CategoryName;
  badge: string;
  image: string;
};

type CartItem = {
  name: string;
  price: string;
  priceValue: number;
  quantity: number;
  kind: 'product' | 'service';
};

const categories: Array<{
  name: CategoryName;
  icon: LucideIcon;
  image: string;
}> = [
  { name: DEFAULT_CATEGORY, icon: Sparkles, image: clinicCheckupImage },
  { name: 'Kacamata', icon: Glasses, image: frameClassicImage },
  { name: 'Lensa Kontak', icon: Eye, image: contactLensImage },
  { name: 'Tetes Mata', icon: Pill, image: eyeDropsImage },
  { name: 'Vitamin Mata', icon: Sparkles, image: eyeVitaminImage },
  { name: 'Pemeriksaan', icon: Stethoscope, image: clinicCheckupImage },
];

const products: Product[] = [
  {
    name: 'Frame Kacamata Prime Classic',
    desc: 'Unisex / ringan',
    price: 'Rp 650.000',
    priceValue: 650000,
    category: 'Kacamata',
    icon: Glasses,
    image: frameClassicImage,
    badge: 'Best seller',
  },
  {
    name: 'Lensa Kontak Harian',
    desc: '30 lensa steril',
    price: 'Rp 85.000',
    priceValue: 85000,
    category: 'Lensa Kontak',
    icon: Eye,
    image: contactLensImage,
    badge: 'Nyaman',
  },
  {
    name: 'Tetes Mata Lubricant',
    desc: '15 ml untuk mata kering',
    price: 'Rp 55.000',
    priceValue: 55000,
    category: 'Tetes Mata',
    icon: Pill,
    image: eyeDropsImage,
    badge: 'Original',
  },
  {
    name: 'Vitamin Mata',
    desc: 'Suplemen / 30 kapsul',
    price: 'Rp 95.000',
    priceValue: 95000,
    category: 'Vitamin Mata',
    icon: Sparkles,
    image: eyeVitaminImage,
    badge: 'Rekomendasi',
  },
];

const services: Service[] = [
  {
    title: 'Paket Pemeriksaan Mata Lengkap',
    desc: 'Cek mata menyeluruh dengan dokter & optometri',
    price: 'Rp 150.000',
    priceValue: 150000,
    category: 'Pemeriksaan',
    badge: 'Paket',
    image: clinicCheckupImage,
  },
  {
    title: 'Paket Konsultasi Dokter Mata',
    desc: 'Konsultasi keluhan mata dengan dokter.',
    price: 'Rp 200.000',
    priceValue: 200000,
    category: 'Pemeriksaan',
    badge: 'Layanan',
    image: clinicCheckupImage,
  },
  {
    title: 'Screening Mata Awal',
    desc: 'Pemeriksaan awal mata cepat.',
    price: 'Rp 75.000',
    priceValue: 75000,
    category: 'Pemeriksaan',
    badge: 'Layanan',
    image: eyeDropsImage,
  },
  {
    title: 'Pemeriksaan Minus / Silinder',
    desc: 'Cek refraksi dan resep kacamata',
    price: 'Rp 100.000',
    priceValue: 100000,
    category: 'Pemeriksaan',
    badge: 'Layanan',
    image: frameClassicImage,
  },
];

const benefits = [
  { title: 'Produk Original', icon: ShieldCheck, copy: 'Kurasi klinik' },
  { title: 'Rekomendasi Dokter', icon: Stethoscope, copy: 'Lebih terarah' },
  { title: 'Booking Mudah', icon: BookmarkPlus, copy: 'Satu ketukan' },
  { title: 'Reward & Voucher', icon: Gift, copy: 'Poin pasien' },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const isCategoryName = (value: string): value is CategoryName =>
  categories.some((category) => category.name === value);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

function MarketplaceHeader() {
  return (
    <header className="flex items-start justify-between gap-4 rounded-[24px] border border-prime-gold/20 bg-white p-5 shadow-prime-card backdrop-blur">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-prime-gold-dark/75">
          PRIME BELANJA
        </p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-prime-black">
          Marketplace
        </h1>
        <p className="mt-1 max-w-[270px] text-sm leading-relaxed text-prime-muted">
          Fokus belanja kebutuhan mata dengan produk dan layanan klinik.
        </p>
      </div>
      <button
        type="button"
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-prime-gold/20 bg-prime-cream/45 text-prime-gold-dark shadow-sm transition hover:bg-prime-cream/70 focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:scale-95"
        aria-label="Buka keranjang marketplace"
      >
        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
        
      </button>
    </header>
  );
}

function SearchFilterBar({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onFilterClick,
}: {
  searchTerm: string;
  selectedCategory: CategoryName;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="group flex min-h-[54px] flex-1 items-center gap-2.5 rounded-[20px] border border-prime-gold/15 bg-white px-4 shadow-prime-card transition focus-within:border-prime-gold/55 focus-within:ring-4 focus-within:ring-prime-gold/15">
        <Search className="h-[18px] w-[18px] shrink-0 text-prime-muted" aria-hidden="true" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-transparent text-[15px] font-medium text-prime-black outline-none placeholder:text-prime-muted/65"
          placeholder="Cari produk atau layanan mata"
          type="search"
        />
      </label>
      <button
        type="button"
        onClick={onFilterClick}
        className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[18px] border shadow-prime-card transition focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:scale-95 ${
          selectedCategory === 'Pemeriksaan'
            ? 'border-prime-gold bg-prime-gold text-white'
            : 'border-prime-gold/30 bg-white text-prime-gold-dark'
        }`}
        aria-label="Filter layanan klinik"
      >
        <Filter className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function MarketplaceHero() {
  return (
    <article className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#b19731] via-[#d4b257] to-[#ffe7ab] p-5 text-prime-black shadow-prime-lift">
      <div className="absolute -right-14 -top-16 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
      <div className="absolute -bottom-16 left-8 h-28 w-28 rounded-full bg-prime-teal-soft/80 blur-2xl" />
      <div className="relative grid grid-cols-[1fr_102px] items-center gap-3">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-white/55 px-3 py-1 text-xs font-bold text-prime-gold-dark shadow-sm">
            Etalase Prime
          </p>
          <h2 className="mt-3 text-xl font-bold leading-snug text-[#221b10]">
            Etalase fokus kebutuhan mata Prime
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#433515]">
            Produk terpercaya dan layanan profesional untuk kesehatan mata Anda.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Aman & Terpercaya', 'Produk Berkualitas', 'Booking Mudah'].map(
              (point) => (
                <span
                  key={point}
                  className="rounded-full border border-white/50 bg-white/45 px-2.5 py-1 text-[11px] font-bold text-[#453510] backdrop-blur"
                >
                  {point}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/45 bg-white/45 p-2 shadow-sm backdrop-blur">
          <img
            src={clinicCheckupImage}
            alt="Ilustrasi produk dan layanan pemeriksaan mata Prime"
            className="h-28 w-full object-contain"
          />
        </div>
      </div>
    </article>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold tracking-tight text-prime-black">
        {title}
      </h2>
      {action}
    </div>
  );
}

function CategoryScroller({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: CategoryName;
  onSelectCategory: (category: CategoryName) => void;
}) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Kategori Cepat"
        action={
          <p className="text-xs font-semibold text-prime-gold-dark/80">
            Pilih sesuai kebutuhan
          </p>
        }
      />
      <div className="marketplace-scrollbar-hide -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:px-6">
        {categories.map(({ name, icon: Icon, image }) => {
          const isSelected = selectedCategory === name;

          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelectCategory(name)}
              className={`min-h-[118px] min-w-[104px] snap-start rounded-[22px] border p-2.5 text-center shadow-prime-card transition focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:scale-[0.97] ${
                isSelected
                  ? 'border-prime-gold bg-prime-gold text-white ring-1 ring-prime-gold/25'
                  : 'border-prime-gold/30 bg-white text-prime-black hover:border-prime-gold/50'
              }`}
              aria-pressed={isSelected}
            >
              <span
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] ${
                  isSelected ? 'bg-white/90' : 'bg-[#fff8e8]'
                }`}
              >
                <img
                  src={image}
                  alt={`Gambar kategori ${name}`}
                  className="h-11 w-11 object-contain"
                />
              </span>
              <span
                className={`mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-xl ${
                  isSelected
                    ? 'bg-white text-prime-gold-dark'
                    : 'bg-prime-cream/70 text-prime-gold-dark'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="mt-1.5 block text-xs font-bold leading-snug">
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
  onAddToCart: (item: Pick<CartItem, 'name' | 'price' | 'priceValue' | 'kind'>) => void;
}) {
  const Icon = product.icon;

  return (
    <article className="group flex min-h-[258px] flex-col rounded-[24px] border border-white bg-white p-2.5 shadow-prime-card transition hover:-translate-y-0.5 hover:border-prime-gold/25 active:scale-[0.99]">
      <div className="relative rounded-[20px] bg-gradient-to-br from-[#fff8e8] to-prime-teal-soft/70 p-3">
        <img
          src={product.image}
          alt={`Foto produk ${product.name}`}
          className="h-[104px] w-full object-contain"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-prime-gold-dark shadow-sm">
          {product.badge}
        </span>
        <button
          type="button"
          onClick={() => onToggleFavorite(product.name)}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:scale-90 ${
            isFavorite ? 'text-rose-500' : 'text-prime-muted'
          }`}
          aria-label={`${isFavorite ? 'Hapus favorit' : 'Tambahkan favorit'} ${product.name}`}
          aria-pressed={isFavorite}
        >
          <Heart
            className="h-4 w-4"
            fill={isFavorite ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
        <span className="absolute bottom-2.5 left-2.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-white/95 text-prime-teal shadow-sm">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <h3 className="line-clamp-2 min-h-[40px] text-[15px] font-bold leading-snug text-prime-black">
          {product.name}
        </h3>
        <p className="mt-1 text-xs font-medium text-prime-muted">
          {product.desc}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-[15px] font-extrabold text-prime-gold-dark">
            {product.price}
          </p>
          <button
            type="button"
            onClick={() =>
              onAddToCart({
                name: product.name,
                price: product.price,
                priceValue: product.priceValue,
                kind: 'product',
              })
            }
            className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-prime-gold text-white shadow-sm shadow-prime-gold/20 transition focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:scale-90"
            aria-label={`Tambah ${product.name} ke keranjang`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductGrid({
  products: productItems,
  favorites,
  onToggleFavorite,
  onAddToCart,
}: {
  products: Product[];
  favorites: string[];
  onToggleFavorite: (name: string) => void;
  onAddToCart: (item: Pick<CartItem, 'name' | 'price' | 'priceValue' | 'kind'>) => void;
}) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Produk Pilihan"
        action={
          <button
            type="button"
            className="rounded-full px-2 py-1 text-xs font-bold text-prime-gold-dark transition hover:bg-prime-gold-soft focus:outline-none focus:ring-4 focus:ring-prime-gold/20"
          >
            Lihat semua
          </button>
        }
      />
      {productItems.length ? (
        <div className="grid grid-cols-2 gap-3">
          {productItems.map((product) => (
            <ProductCard
              key={product.name}
              product={product}
              isFavorite={favorites.includes(product.name)}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="Produk tidak ditemukan untuk filter saat ini." />
      )}
    </section>
  );
}

function ServiceCard({
  service,
  onBookService,
}: {
  service: Service;
  onBookService: (service: Service) => void;
}) {
  return (
    <article className="rounded-[24px] border border-prime-gold/15 bg-white p-4 shadow-prime-card">
      <div className="flex items-center gap-3">
        <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[22px] bg-prime-teal-soft p-2.5">
          <img
            src={service.image}
            alt={`Ilustrasi layanan ${service.title}`}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-prime-cream/70 px-2.5 py-1 text-[11px] font-bold text-prime-gold-dark">
            {service.badge}
          </span>
          <h3 className="mt-2 text-[15px] font-bold leading-snug text-prime-black">
            {service.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-prime-muted">
            {service.desc}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-prime-gold/10 pt-3">
        <p className="text-base font-extrabold text-prime-gold-dark">
          {service.price}
        </p>
        <button
          type="button"
          onClick={() => onBookService(service)}
          className="rounded-[16px] bg-prime-gold px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-prime-gold/20 transition focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:scale-95"
        >
          Booking
        </button>
      </div>
    </article>
  );
}

function ClinicServiceList({
  services: serviceItems,
  onBookService,
}: {
  services: Service[];
  onBookService: (service: Service) => void;
}) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Layanan Klinik" />
      {serviceItems.length ? (
        <div className="space-y-3">
          {serviceItems.map((service) => (
            <ServiceCard
              key={service.title}
              service={service}
              onBookService={onBookService}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="Layanan tidak ditemukan untuk filter saat ini." />
      )}
    </section>
  );
}

function MiniCart({
  cartItems,
  cartQuantity,
  cartTotal,
  onCheckout,
}: {
  cartItems: CartItem[];
  cartQuantity: number;
  cartTotal: number;
  onCheckout: () => void;
}) {
  const isEmpty = cartQuantity === 0;

  return (
    <section className="rounded-[24px] border border-prime-gold/20 bg-white p-4 shadow-prime-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-prime-black">Keranjang</p>
          <p className="mt-0.5 text-xs font-medium text-prime-muted">
            {cartQuantity} item dipilih
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-prime-gold-soft text-prime-gold-dark">
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {cartItems.length ? (
          cartItems.slice(0, 3).map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-2 rounded-[18px] bg-[#fff8e8] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-prime-black">
                  {item.name}
                </p>
                <p className="text-xs text-prime-muted">
                  {item.price} × {item.quantity}
                </p>
              </div>
              <p className="text-xs font-semibold text-prime-gold-dark">x{item.quantity}</p>
            </div>
          ))
        ) : (
          <p className="rounded-[18px] bg-[#fff8e8] px-3 py-3 text-sm font-medium text-prime-muted">
            Belum ada item di keranjang.
          </p>
        )}
        {cartItems.length > 2 && (
          <p className="text-xs font-semibold text-prime-gold-dark">
            +{cartItems.length - 3} item lainnya tersimpan.
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-prime-gold/10 pt-3">
        <div>
          <p className="text-xs text-prime-muted">Total estimasi</p>
          <p className="text-lg font-extrabold text-prime-black">
            {formatRupiah(cartTotal)}
          </p>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          disabled={isEmpty}
          className="inline-flex items-center gap-2 rounded-[16px] bg-prime-gold px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-prime-gold/20 transition focus:outline-none focus:ring-4 focus:ring-prime-gold/20 active:scale-95 disabled:cursor-not-allowed disabled:bg-prime-black/15 disabled:text-prime-muted disabled:shadow-none"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Checkout
        </button>
      </div>
    </section>
  );
}

function PromoCard() {
  return (
    <article className="overflow-hidden rounded-[28px] border border-prime-gold/15 bg-white p-4 shadow-prime-card">
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-prime-gold-soft to-prime-teal-soft p-3">
          <img
            src={contactLensImage}
            alt="Gambar promo produk lensa kontak"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-prime-gold-dark">
            Promo Hari Ini
          </p>
          <h2 className="mt-2 text-lg font-bold leading-snug text-prime-black">
            Diskon hingga 20% untuk produk pilihan.
          </h2>
          <button
            type="button"
            className="mt-3 rounded-[14px] bg-prime-gold-soft px-3 py-2 text-xs font-bold text-prime-gold-dark transition hover:bg-prime-cream focus:outline-none focus:ring-4 focus:ring-prime-gold/20"
          >
            Lihat Promo
          </button>
        </div>
      </div>
    </article>
  );
}

function BenefitGrid() {
  return (
    <section className="space-y-3">
      <SectionHeader title="Kenapa pilih Marketplace Prime?" />
      <div className="grid grid-cols-2 gap-3">
        {benefits.map(({ title, icon: Icon, copy }) => (
          <article
            key={title}
            className="rounded-[22px] border border-white bg-white p-3 shadow-prime-card"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-prime-gold-soft text-prime-gold-dark">
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <p className="mt-2 text-sm font-bold text-prime-black">{title}</p>
            <p className="mt-0.5 text-xs font-medium text-prime-muted">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RewardVoucherSection() {
  const [message, setMessage] = useState<string | null>(null);
  const { getAvailableRewards, redeemReward, user } = useGamificationStore();
  const rewards = getAvailableRewards(user.userId);
  const nextReward = useMemo(
    () =>
      rewards.find((reward) => user.totalPoints < reward.pointsRequired) ??
      rewards[rewards.length - 1],
    [rewards, user.totalPoints],
  );
  const progress = nextReward
    ? Math.min(100, Math.round((user.totalPoints / nextReward.pointsRequired) * 100))
    : 100;

  const handleRedeem = (rewardId: string) => {
    const result = redeemReward(user.userId, rewardId);
    setMessage(result.message);
    window.setTimeout(() => setMessage(null), 3000);
  };

  return (
    <section className="rounded-[28px] border border-prime-gold/15 bg-white p-4 shadow-prime-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-prime-gold-dark">
            <Gift className="h-4 w-4" aria-hidden="true" /> Reward & Voucher
          </p>
          <h2 className="mt-1 text-lg font-bold text-prime-black">
            Poin saat ini: {user.totalPoints}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-prime-gold-soft px-3 py-1.5 text-xs font-bold text-prime-gold-dark">
          <Coins className="h-3.5 w-3.5" aria-hidden="true" /> 120+
        </span>
      </div>

      {nextReward && (
        <div className="mt-4 rounded-[22px] bg-[#fff8e8] p-3">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold text-prime-muted">
            <span>Progress ke reward berikutnya</span>
            <span className="text-prime-gold-dark">{progress}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-prime-gold to-prime-teal transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {message && (
        <p className="mt-3 rounded-[18px] bg-prime-gold-soft px-3 py-2 text-xs font-bold text-prime-gold-dark">
          {message}
        </p>
      )}

      <div className="mt-3 space-y-2.5">
        {rewards.map((reward) => {
          const enoughPoints = user.totalPoints >= reward.pointsRequired;

          return (
            <VoucherCard
              key={reward.id}
              title={reward.title}
              description={reward.description}
              requirement={`Butuh ${reward.pointsRequired} poin • Nilai ${reward.value}`}
              status={enoughPoints ? 'Tukar Poin' : 'Poin belum cukup'}
              disabled={!enoughPoints}
              onRedeem={() => handleRedeem(reward.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

function VoucherCard({
  title,
  description,
  requirement,
  status,
  disabled,
  onRedeem,
}: {
  title: string;
  description: string;
  requirement: string;
  status: string;
  disabled: boolean;
  onRedeem: () => void;
}) {
  return (
    <article className="rounded-[20px] border border-prime-gold/10 bg-prime-gold-soft/45 p-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-white text-prime-gold-dark shadow-sm">
          <Gift className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-snug text-prime-black">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-prime-muted">
            {description}
          </p>
          <p className="mt-2 text-xs font-bold text-prime-gold-dark">
            {requirement}
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onRedeem}
        className="mt-3 rounded-full bg-prime-gold px-3 py-2 text-xs font-bold text-white transition focus:outline-none focus:ring-4 focus:ring-prime-gold/20 disabled:cursor-not-allowed disabled:bg-prime-black/10 disabled:text-prime-muted"
      >
        {status}
      </button>
    </article>
  );
}

function MarketplaceSupportCard() {
  return (
    <section className="rounded-[24px] border border-prime-teal/10 bg-prime-teal-soft p-4 text-center shadow-prime-card">
      <p className="text-sm font-bold leading-relaxed text-prime-black">
        Butuh bantuan memilih? Tim Klinik Utama Prime siap membantu Anda 🤍
      </p>
      <button
        type="button"
        className="mt-3 rounded-[14px] bg-white px-4 py-2 text-xs font-bold text-prime-teal shadow-sm transition focus:outline-none focus:ring-4 focus:ring-prime-teal/20 active:scale-95"
      >
        Hubungi Admin
      </button>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-[22px] border border-dashed border-prime-gold/25 bg-white px-4 py-5 text-center text-sm font-medium text-prime-muted">
      {message}
    </p>
  );
}

export function MarketplacePage() {
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>(() => {
    const storedCategory = readStorage<string>(
      MARKETPLACE_SELECTED_CATEGORY_KEY,
      DEFAULT_CATEGORY,
    );
    return isCategoryName(storedCategory) ? storedCategory : DEFAULT_CATEGORY;
  });
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(MARKETPLACE_CART_KEY, []),
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    readStorage<string[]>(MARKETPLACE_FAVORITES_KEY, []),
  );
  const addPoints = useGamificationStore((state) => state.addPoints);
  const userId = 'patient-001';

  useEffect(() => {
    window.localStorage.setItem(MARKETPLACE_CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    window.localStorage.setItem(
      MARKETPLACE_FAVORITES_KEY,
      JSON.stringify(favorites),
    );
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(
      MARKETPLACE_SELECTED_CATEGORY_KEY,
      JSON.stringify(selectedCategory),
    );
  }, [selectedCategory]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          selectedCategory === DEFAULT_CATEGORY ||
          product.category === selectedCategory;
        const matchesSearch =
          !normalizedSearchTerm ||
          [product.name, product.desc, product.badge, product.category].some(
            (value) => value.toLowerCase().includes(normalizedSearchTerm),
          );

        return matchesCategory && matchesSearch;
      }),
    [normalizedSearchTerm, selectedCategory],
  );
  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        const matchesCategory =
          selectedCategory === DEFAULT_CATEGORY ||
          service.category === selectedCategory;
        const matchesSearch =
          !normalizedSearchTerm ||
          [service.title, service.desc, service.badge, service.category].some(
            (value) => value.toLowerCase().includes(normalizedSearchTerm),
          );

        return matchesCategory && matchesSearch;
      }),
    [normalizedSearchTerm, selectedCategory],
  );
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.priceValue * item.quantity,
    0,
  );
  const cartQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2600);
  };

  const updateCategory = (category: CategoryName) => {
    setSelectedCategory(category);
    showFeedback(`Filter kategori: ${category}`);
  };

  const addToCart = (item: Pick<CartItem, 'name' | 'price' | 'priceValue' | 'kind'>) => {
    setCartItems((current) => {
      const existingItem = current.find(
        (cartItem) => cartItem.name === item.name,
      );

      if (existingItem) {
        return current.map((cartItem) =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
    showFeedback(`${item.name} ditambahkan ke keranjang.`);
  };

  const toggleFavorite = (productName: string) => {
    setFavorites((current) => {
      const alreadyFavorite = current.includes(productName);
      showFeedback(
        alreadyFavorite
          ? `${productName} dihapus dari favorit.`
          : `${productName} disimpan ke favorit.`,
      );
      return alreadyFavorite
        ? current.filter((name) => name !== productName)
        : [...current, productName];
    });
  };

  const decreaseCartItem = (itemName: string) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.name === itemName
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeCartItem = (itemName: string) => {
    setCartItems((current) => current.filter((item) => item.name !== itemName));
    showFeedback(`${itemName} dihapus dari keranjang.`);
  };

  const checkoutCart = () => {
    if (!cartItems.length) {
      return;
    }

    addPoints(
      userId,
      'marketplace_purchase',
      POINT_RULES.marketplace_purchase,
      `Checkout marketplace: ${cartItems.map((item) => item.name).join(', ')}`,
    );
    showFeedback(
      `Checkout ${cartQuantity} item senilai ${formatRupiah(cartTotal)} berhasil dicatat. +20 poin Daily Wins.`,
    );
    setCartItems([]);
  };

  const bookService = (service: Service) => {
    addToCart({
      name: service.title,
      price: service.price,
      priceValue: service.priceValue,
      kind: 'service',
    });
    addPoints(
      userId,
      'booking_created',
      POINT_RULES.booking_created,
      `Booking layanan: ${service.title}`,
    );
    showFeedback(`Booking ${service.title} tersimpan. +25 poin Daily Wins.`);
  };

  return (
    <section className="space-y-6 pb-24">
      <MarketplaceHeader />
      <SearchFilterBar
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchTerm}
        onFilterClick={() =>
          updateCategory(
            selectedCategory === 'Pemeriksaan' ? DEFAULT_CATEGORY : 'Pemeriksaan',
          )
        }
      />

      {feedback && (
        <p
          className="rounded-[18px] border border-prime-gold/15 bg-white/90 px-4 py-2.5 text-xs font-bold text-prime-gold-dark shadow-prime-card"
          role="status"
        >
          {feedback}
        </p>
      )}

      <MarketplaceHero />
      <CategoryScroller
        selectedCategory={selectedCategory}
        onSelectCategory={updateCategory}
      />
      <ProductGrid
        products={filteredProducts}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onAddToCart={addToCart}
      />
      <ClinicServiceList
        services={filteredServices}
        onBookService={bookService}
      />
      <MiniCart
        cartItems={cartItems}
        cartQuantity={cartQuantity}
        cartTotal={cartTotal}
        onCheckout={checkoutCart}
      />
      <PromoCard />
      <BenefitGrid />
      <RewardVoucherSection />
      <MarketplaceSupportCard />
    </section>
  );
}
