export type ProductCategory = 'kacamata' | 'lensa-kontak' | 'tetes-mata' | 'vitamin';
export type FilterCategory = 'semua' | ProductCategory | 'layanan-klinik' | 'rekomendasi-dokter' | 'promo';
export type PriceFilter = 'none' | 'lowest' | 'highest' | 'under-100k' | '100k-250k' | 'above-250k';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  image: string;
  badge?: string;
  stock: number;
  requiresDoctorRecommendation?: boolean;
  promo?: boolean;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: string;
  type: 'clinic-service';
};

export type CartItem = {
  id: string;
  itemType: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
};
