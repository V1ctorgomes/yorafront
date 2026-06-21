import { getApiUrl } from "@/lib/env";
import type { Collection, CollectionDetail } from "@/types";

interface FetchCollectionsParams {
  featured?: boolean;
}

export async function fetchActiveCollections(
  params?: FetchCollectionsParams,
): Promise<Collection[]> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.featured) {
      searchParams.set("featured", "true");
    }

    const query = searchParams.toString();
    const response = await fetch(
      `${getApiUrl()}/collections${query ? `?${query}` : ""}`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export async function fetchCollectionBySlug(
  slug: string,
): Promise<CollectionDetail | null> {
  try {
    const response = await fetch(`${getApiUrl()}/collections/${slug}`, {
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
