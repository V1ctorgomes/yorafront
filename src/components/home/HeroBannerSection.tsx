import {
  HeroBannerCarousel,
  HeroBannerEmpty,
} from "@/components/home/HeroBanner";
import { fetchActiveBanners } from "@/lib/api/banners";

export async function HeroBannerSection() {
  const banners = await fetchActiveBanners();

  if (banners.length === 0) {
    return <HeroBannerEmpty />;
  }

  return <HeroBannerCarousel banners={banners} />;
}
