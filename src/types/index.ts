export type ProductBadge = "new" | "sale" | "sold-out";

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface ProductCollectionRef {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  sku: string;
  color: string;
  size: string;
  priceOverride: number | null;
  price: number;
  stock: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  coverImage: string;
  basePrice: number;
  isNew: boolean;
  isFeatured: boolean;
  category: ProductCategoryRef;
  description?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: ProductImage[];
}

export interface AdminProduct extends Product {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  collection?: ProductCollectionRef | null;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerImageUrl: string;
  thumbnailImageUrl: string;
  launchDate: string;
  endDate: string | null;
  isFeatured: boolean;
}

export interface CollectionDetail extends Collection {
  productCount: number;
  products: Product[];
}

export interface AdminCollection extends Collection {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  displayOrder: number;
}

export interface AdminBanner extends Banner {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
}

export interface AdminCategory extends Category {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface NavItem {
  label: string;
  href: string;
}

export interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ProductFormData {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  collectionId: string;
  basePrice: number;
  coverImage: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface CollectionFormData {
  name: string;
  slug: string;
  description: string;
  bannerImageUrl: string;
  thumbnailImageUrl: string;
  launchDate: string;
  endDate: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface VariantFormData {
  color: string;
  size: string;
  sku: string;
  priceOverride: string;
  stock: number;
  isActive: boolean;
}

export interface ImageFormData {
  imageUrl: string;
  altText: string;
  displayOrder: number;
}

export interface CartItem {
  productId: string;
  productVariantId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  maxStock?: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
}

export interface AuthResponse {
  accessToken: string;
  admin: {
    id: string;
    email: string;
  };
}
