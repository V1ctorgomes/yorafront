export type ProductBadge = "new" | "sale" | "sold-out";

export interface ProductCategoryRef {
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
  basePrice: number;
  coverImage: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
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

export interface AuthResponse {
  accessToken: string;
  admin: {
    id: string;
    email: string;
  };
}
