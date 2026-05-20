import { BookmarkPlus, CheckCircle2, Coins, Eye, Filter, Gift, Glasses, Heart, Pill, Plus, Search, ShieldCheck, ShoppingCart, Sparkles, Stethoscope, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import frameClassicImage from '@/assets/marketplace/frame-classic.svg';
import contactLensImage from '@/assets/marketplace/contact-lens.svg';
import eyeDropsImage from '@/assets/marketplace/eye-drops.svg';
import eyeVitaminImage from '@/assets/marketplace/eye-vitamin.svg';
import clinicCheckupImage from '@/assets/marketplace/clinic-checkup.svg';
import { POINT_RULES, useGamificationStore } from '../gamification/gamificationStore';

const STORAGE_KEYS = { cart: 'prime_marketplace_cart', favorites: 'prime_marketplace_favorites', category: 'prime_marketplace_selected_category', filter: 'prime_marketplace_filter_state', voucher: 'prime_marketplace_active_voucher' };
const DEFAULT_CATEGORY = 'Semua';
type CategoryName = 'Semua' | 'Kacamata' | 'Lensa Kontak' | 'Tetes Mata' | 'Vitamin Mata' | 'Pemeriksaan';
type Product = { name: string; desc: string; priceValue: number; category: CategoryName; icon: LucideIcon; image: string; badge: string; recommended?: boolean };
type Service = { title: string; desc: string; priceValue: number; category: CategoryName; badge: string; image: string; recommended?: boolean };
type CartItem = { name: string; priceValue: number; quantity: number; kind: 'product' | 'service' };
type FilterState = { priceRange: 'all' | 'low' | 'mid' | 'high'; kind: 'all' | 'product' | 'service'; bestSeller: boolean; doctorRecommended: boolean };

const categories = [{ name: DEFAULT_CATEGORY, icon: Sparkles, image: clinicCheckupImage }, { name: 'Kacamata', icon: Glasses, image: frameClassicImage }, { name: 'Lensa Kontak', icon: Eye, image: contactLensImage }, { name: 'Tetes Mata', icon: Pill, image: eyeDropsImage }, { name: 'Vitamin Mata', icon: Sparkles, image: eyeVitaminImage }, { name: 'Pemeriksaan', icon: Stethoscope, image: clinicCheckupImage }] as const;
const baseProducts: Product[] = [{ name: 'Frame Kacamata Prime Classic', desc: 'Unisex / ringan', priceValue: 650000, category: 'Kacamata', icon: Glasses, image: frameClassicImage, badge: 'Best seller', recommended: true }, { name: 'Lensa Kontak Harian', desc: '30 lensa steril', priceValue: 85000, category: 'Lensa Kontak', icon: Eye, image: contactLensImage, badge: 'Nyaman' }, { name: 'Tetes Mata Lubricant', desc: '15 ml untuk mata kering', priceValue: 55000, category: 'Tetes Mata', icon: Pill, image: eyeDropsImage, badge: 'Original', recommended: true }, { name: 'Vitamin Mata', desc: 'Suplemen / 30 kapsul', priceValue: 95000, category: 'Vitamin Mata', icon: Sparkles, image: eyeVitaminImage, badge: 'Rekomendasi', recommended: true }];
const baseServices: Service[] = [{ title: 'Paket Pemeriksaan Mata Lengkap', desc: 'Cek mata menyeluruh dengan dokter & optometri', priceValue: 150000, category: 'Pemeriksaan', badge: 'Paket', image: clinicCheckupImage, recommended: true }, { title: 'Paket Konsultasi Dokter Mata', desc: 'Konsultasi keluhan mata dengan dokter.', priceValue: 200000, category: 'Pemeriksaan', badge: 'Layanan', image: clinicCheckupImage }, { title: 'Screening Mata Awal', desc: 'Pemeriksaan awal mata cepat.', priceValue: 75000, category: 'Pemeriksaan', badge: 'Layanan', image: eyeDropsImage }, { title: 'Pemeriksaan Minus / Silinder', desc: 'Cek refraksi dan resep kacamata', priceValue: 100000, category: 'Pemeriksaan', badge: 'Layanan', image: frameClassicImage, recommended: true }];
const benefits = [{ title: 'Produk Original', icon: ShieldCheck, copy: 'Kurasi klinik' }, { title: 'Rekomendasi Dokter', icon: Stethoscope, copy: 'Lebih terarah' }, { title: 'Booking Mudah', icon: BookmarkPlus, copy: 'Satu ketukan' }, { title: 'Reward & Voucher', icon: Gift, copy: 'Poin pasien' }];
const vouchers = [{ id: 'VOUCHER10', title: 'Diskon 10%', pointsRequired: 40, code: 'PRIME10' }, { id: 'VOUCHER25', title: 'Diskon 25K', pointsRequired: 70, code: 'PRIME25K' }];
const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
const readStorage = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } };

export function MarketplacePage() {
  const navigate = useNavigate();
  const cartRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryName>(() => readStorage(STORAGE_KEYS.category, DEFAULT_CATEGORY));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<FilterState>(() => readStorage(STORAGE_KEYS.filter, { priceRange: 'all', kind: 'all', bestSeller: false, doctorRecommended: false }));
  const [products] = useState<Product[]>(baseProducts);
  const [services] = useState<Service[]>(baseServices);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readStorage(STORAGE_KEYS.cart, []));
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(STORAGE_KEYS.favorites, []));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<string | null>(() => readStorage(STORAGE_KEYS.voucher, null));
  const [rewardPoints, setRewardPoints] = useState<number>(() => useGamificationStore.getState().user.totalPoints);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedModal, setSelectedModal] = useState<null | 'filter' | 'promo' | 'benefit' | 'admin'>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const addPoints = useGamificationStore((state) => state.addPoints);

  useEffect(() => localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cartItems)), [cartItems]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.category, JSON.stringify(activeCategory)), [activeCategory]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.filter, JSON.stringify(filterState)), [filterState]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.voucher, JSON.stringify(activeVoucher)), [activeVoucher]);

  const showToast = (message: string) => { setToastMessage(message); setTimeout(() => setToastMessage(''), 2500); };
  const getProducts = () => products;
  const getServices = () => services;
  const searchMarketplace = (query: string) => query.trim().toLowerCase();
  const filterMarketplace = <T extends Product | Service>(items: T[], kind: 'product' | 'service') => items.filter((item) => {
    const query = searchMarketplace(searchQuery);
    const name = 'name' in item ? item.name : item.title;
    const passesSearch = !query || `${name} ${item.desc} ${item.badge} ${item.category}`.toLowerCase().includes(query);
    const passesCategory = activeCategory === DEFAULT_CATEGORY || item.category === activeCategory;
    const passesKind = filterState.kind === 'all' || filterState.kind === kind;
    const passesBestSeller = !filterState.bestSeller || item.badge.toLowerCase().includes('best');
    const passesDoctor = !filterState.doctorRecommended || !!item.recommended;
    const passesPrice = filterState.priceRange === 'all' || (filterState.priceRange === 'low' ? item.priceValue <= 100000 : filterState.priceRange === 'mid' ? item.priceValue > 100000 && item.priceValue <= 250000 : item.priceValue > 250000);
    return passesSearch && passesCategory && passesKind && passesBestSeller && passesDoctor && passesPrice;
  });
  const addToCart = (item: Omit<CartItem, 'quantity'>) => { setCartItems((c) => c.some((x) => x.name === item.name) ? c.map((x) => x.name === item.name ? { ...x, quantity: x.quantity + 1 } : x) : [...c, { ...item, quantity: 1 }]); showToast('Produk ditambahkan ke keranjang.'); };
  const updateCartQty = (name: string, delta: number) => setCartItems((c) => c.map((i) => i.name === name ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter((i) => i.quantity > 0));
  const removeFromCart = (name: string) => setCartItems((c) => c.filter((i) => i.name !== name));
  const toggleFavorite = (name: string) => setFavorites((f) => f.includes(name) ? f.filter((x) => x !== name) : [...f, name]);
  const checkoutCart = () => { if (!cartItems.length) return; setCartItems([]); addPoints('patient-001', 'marketplace_purchase', POINT_RULES.marketplace_purchase, 'Checkout marketplace'); showToast('Checkout berhasil diproses.'); };
  const redeemVoucher = (id: string) => { const voucher = vouchers.find((v) => v.id === id); if (!voucher || rewardPoints < voucher.pointsRequired) return; setRewardPoints((v) => v - voucher.pointsRequired); setActiveVoucher(voucher.code); showToast(`Voucher aktif: ${voucher.code}`); };
  const createBookingFromService = (service: Service) => navigate('/booking', { state: { service: service.title } });
  const contactAdmin = () => setSelectedModal('admin');

  const filteredProducts = useMemo(() => filterMarketplace(getProducts(), 'product'), [products, searchQuery, activeCategory, filterState]);
  const filteredServices = useMemo(() => filterMarketplace(getServices(), 'service'), [services, searchQuery, activeCategory, filterState]);
  const cartTotal = cartItems.reduce((t, i) => t + i.priceValue * i.quantity, 0);
  const discount = activeVoucher === 'PRIME10' ? Math.round(cartTotal * 0.1) : activeVoucher === 'PRIME25K' ? 25000 : 0;

  return <section className="space-y-6 pb-[calc(120px+env(safe-area-inset-bottom))]">
    <header className="flex items-start justify-between rounded-[24px] border border-prime-gold/20 bg-white p-5 shadow-prime-card"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-prime-gold-dark/75">PRIME BELANJA</p><h1 className="text-[28px] font-bold">Marketplace</h1><p className="text-sm text-prime-muted">Fokus belanja kebutuhan mata dengan produk dan layanan klinik.</p></div><button onClick={() => cartRef.current?.scrollIntoView({ behavior: 'smooth' })} className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-prime-gold/20 bg-prime-cream/45"><ShoppingCart className="h-5 w-5"/></button></header>
    <div className="flex items-center gap-3"><label className="flex min-h-[54px] flex-1 items-center gap-2.5 rounded-[20px] border border-prime-gold/15 bg-white px-4"><Search className="h-4 w-4"/><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari produk atau layanan mata" className="w-full bg-transparent outline-none"/></label><button onClick={() => setSelectedModal('filter')} className="flex h-[54px] w-[54px] items-center justify-center rounded-[18px] border border-prime-gold/30 bg-white"><Filter className="h-5 w-5"/></button></div>
    <button onClick={() => setActiveCategory('Pemeriksaan')} className="w-full text-left rounded-[28px] bg-gradient-to-br from-[#b19731] via-[#d4b257] to-[#ffe7ab] p-5"><h2 className="text-xl font-bold">Etalase fokus kebutuhan mata Prime</h2><p className="text-sm">Produk terpercaya dan layanan profesional untuk kesehatan mata Anda.</p></button>
    <section><h2 className="text-lg font-bold">Kategori Cepat</h2><div className="marketplace-scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">{categories.map((c) => <button key={c.name} onClick={() => setActiveCategory(c.name as CategoryName)} className={`min-w-[104px] rounded-[22px] border p-2.5 ${activeCategory === c.name ? 'bg-prime-gold text-white' : 'bg-white'} hover:-translate-y-0.5 active:scale-[0.98]`}><img src={c.image} className="mx-auto h-11 w-11"/><span className="mt-1 block text-xs font-bold">{c.name}</span></button>)}</div></section>
    <section><h2 className="text-lg font-bold">Produk Pilihan</h2><div className="grid grid-cols-2 gap-3">{filteredProducts.map((p) => <article key={p.name} onClick={() => setSelectedProduct(p)} className="cursor-pointer rounded-[24px] bg-white p-2.5 shadow-prime-card hover:-translate-y-0.5 active:scale-[0.98]"><img src={p.image} className="h-[104px] w-full"/><p className="text-xs">{p.badge}</p><h3 className="text-sm font-bold">{p.name}</h3><p className="text-xs">{p.desc}</p><div className="mt-2 flex items-center justify-between"><p className="font-bold text-prime-gold-dark">{formatRupiah(p.priceValue)}</p><div className="flex gap-1"><button onClick={(e) => {e.stopPropagation(); toggleFavorite(p.name);}}><Heart className={`h-4 w-4 ${favorites.includes(p.name) ? 'fill-current text-rose-500' : ''}`}/></button><button onClick={(e) => {e.stopPropagation(); addToCart({ name: p.name, priceValue: p.priceValue, kind: 'product' });}} className="rounded bg-prime-gold text-white"><Plus className="h-4 w-4"/></button></div></div></article>)}</div></section>
    <section><h2 className="text-lg font-bold">Layanan Klinik</h2><div className="space-y-3">{filteredServices.map((s) => <article key={s.title} className="rounded-[24px] bg-white p-4 shadow-prime-card"><button onClick={() => setSelectedService(s)} className="w-full text-left"><h3 className="font-bold">{s.title}</h3><p className="text-xs">{s.desc}</p></button><div className="mt-2 flex justify-between"><p className="font-bold text-prime-gold-dark">{formatRupiah(s.priceValue)}</p><button onClick={() => createBookingFromService(s)} className="prime-cta-gold px-3 py-2 text-xs">Booking</button></div></article>)}</div></section>
    <section ref={cartRef} className="rounded-[24px] bg-white p-4 shadow-prime-card"><h2 className="font-bold">Keranjang</h2>{cartItems.length === 0 ? <p className="text-sm text-prime-muted">Belum ada item di keranjang.</p> : cartItems.map((i) => <div key={i.name} className="mt-2 flex items-center justify-between"><div><p className="text-sm font-semibold">{i.name}</p><p className="text-xs">{formatRupiah(i.priceValue)} x {i.quantity}</p></div><div className="flex items-center gap-1"><button onClick={() => updateCartQty(i.name, -1)}>-</button><button onClick={() => updateCartQty(i.name, 1)}>+</button><button onClick={() => removeFromCart(i.name)}><Trash2 className="h-4 w-4"/></button></div></div>)}<p className="mt-3 text-sm">Total estimasi: {formatRupiah(Math.max(0, cartTotal - discount))}</p><button onClick={checkoutCart} disabled={!cartItems.length} className="mt-2 prime-cta-gold px-4 py-2 text-sm disabled:opacity-45">Checkout</button></section>
    <section className="rounded-[24px] bg-white p-4 shadow-prime-card"><h2 className="font-bold">Promo Hari Ini</h2><button onClick={() => setSelectedModal('promo')} className="mt-2 rounded bg-prime-gold-soft px-3 py-2 text-xs">Lihat Promo</button></section>
    <section><h2 className="text-lg font-bold">Kenapa Pilih Marketplace Prime</h2><div className="grid grid-cols-2 gap-3">{benefits.map((b) => <button key={b.title} onClick={() => {setSelectedBenefit(`${b.title}: ${b.copy}`); setSelectedModal('benefit');}} className="rounded-[22px] bg-white p-3 text-left shadow-prime-card hover:-translate-y-0.5 active:scale-[0.98]"><b>{b.title}</b><p className="text-xs">{b.copy}</p></button>)}</div></section>
    <section className="rounded-[24px] bg-white p-4 shadow-prime-card"><p className="font-bold">Poin saat ini: {rewardPoints}</p><div className="mt-2 h-2 rounded-full bg-prime-surface"><div className="h-2 rounded-full bg-prime-gold" style={{ width: `${Math.min(100, (rewardPoints / 100) * 100)}%`}} /></div>{vouchers.map((v) => <div key={v.id} className="mt-2 rounded bg-prime-gold-soft/45 p-2"><p className="font-semibold">{v.title}</p><button disabled={rewardPoints < v.pointsRequired} onClick={() => redeemVoucher(v.id)} className="mt-1 rounded bg-prime-gold px-2 py-1 text-xs text-white disabled:opacity-45">{rewardPoints < v.pointsRequired ? 'Poin belum cukup' : 'Tukar Sekarang'}</button></div>)}{activeVoucher && <p className="mt-2 text-xs font-bold">Voucher aktif: {activeVoucher}</p>}</section>
    <section className="rounded-[24px] bg-prime-teal-soft p-4"><button onClick={contactAdmin} className="rounded bg-white px-3 py-2 text-xs">Hubungi Admin</button></section>
    {toastMessage && <p className="fixed left-1/2 top-4 z-[70] -translate-x-1/2 rounded bg-prime-black px-3 py-2 text-xs text-white">{toastMessage}</p>}
    {selectedModal && <div className="fixed inset-0 z-[60] flex items-end bg-black/35 p-4" onClick={() => setSelectedModal(null)}><div onClick={(e) => e.stopPropagation()} className="w-full rounded-2xl bg-white p-4"><p className="font-bold">{selectedModal === 'filter' ? 'Filter Marketplace' : selectedModal === 'promo' ? 'Promo' : selectedModal === 'admin' ? 'Bantuan Admin' : 'Kenapa pilih Prime?'}</p><div className="mt-2 text-sm">{selectedModal === 'filter' && <p>Atur kategori, rentang harga, produk/layanan, best seller, rekomendasi dokter.</p>}{selectedModal === 'promo' && <button onClick={() => { setActiveVoucher('PRIME10'); setSelectedModal(null); }} className="rounded bg-prime-gold px-3 py-1 text-white">Pakai promo 10%</button>}{selectedModal === 'benefit' && <p>{selectedBenefit}</p>}{selectedModal === 'admin' && <ul className="list-disc pl-5"><li>WhatsApp Admin</li><li>Chat Klinik</li><li>FAQ Marketplace</li></ul>}</div></div></div>}
    {selectedProduct && <div className="fixed inset-0 z-[60] bg-black/35 p-4" onClick={() => setSelectedProduct(null)}><div className="mx-auto mt-16 max-w-sm rounded-2xl bg-white p-4"><p className="font-bold">{selectedProduct.name}</p><p className="text-sm">{selectedProduct.desc}</p></div></div>}
    {selectedService && <div className="fixed inset-0 z-[60] bg-black/35 p-4" onClick={() => setSelectedService(null)}><div className="mx-auto mt-16 max-w-sm rounded-2xl bg-white p-4"><p className="font-bold">{selectedService.title}</p><p className="text-sm">{selectedService.desc}</p></div></div>}
  </section>;
}
