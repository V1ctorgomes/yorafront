import { getApiUrl } from "@/lib/env";
import type { Category } from "@/types";

export async function fetchActiveCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${getApiUrl()}/categories`, {
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

export async function fetchCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  try {
    const response = await fetch(`${getApiUrl()}/categories/${slug}`, {
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
