import { getApiUrl } from "@/lib/env";
import type { Banner } from "@/types";

export async function fetchActiveBanners(): Promise<Banner[]> {
  try {
    const response = await fetch(`${getApiUrl()}/banners`, {
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
