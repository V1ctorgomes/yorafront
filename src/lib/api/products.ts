import { getApiUrl } from "@/lib/env";
import type { Product, ProductVariant } from "@/types";

interface FetchProductsParams {
  featured?: boolean;
  isNew?: boolean;
  category?: string;
}

function buildProductsUrl(params?: FetchProductsParams) {
  const searchParams = new URLSearchParams();

  if (params?.featured) {
    searchParams.set("featured", "true");
  }

  if (params?.isNew) {
    searchParams.set("isNew", "true");
  }

  if (params?.category) {
    searchParams.set("category", params.category);
  }

  const query = searchParams.toString();
  return `${getApiUrl()}/products${query ? `?${query}` : ""}`;
}

export async function fetchProducts(
  params?: FetchProductsParams,
): Promise<Product[]> {
  try {
    const response = await fetch(buildProductsUrl(params), {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    const response = await fetch(`${getApiUrl()}/products/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function fetchProductVariants(
  slug: string,
): Promise<ProductVariant[]> {
  try {
    const response = await fetch(`${getApiUrl()}/products/${slug}/variants`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}
