export type ProductBadge = "new" | "sale" | "sold-out";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  isNew?: boolean;
  badge?: ProductBadge;
  compareAtPrice?: number;
}

export interface NavItem {
  label: string;
  href: string;
}
