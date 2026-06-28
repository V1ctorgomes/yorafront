import { HeroBannerSection } from "@/components/home/HeroBannerSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { BrandStory } from "@/components/home/BrandStory";
import { Newsletter } from "@/components/home/Newsletter";
import { InteractiveBackground } from "@/components/home/InteractiveBackground";

export default function HomePage() {
  return (
    <>
      <HeroBannerSection />
      
      <InteractiveBackground>
        <CategoriesSection />
        <CollectionsSection />
        <FeaturedProductsSection />
      </InteractiveBackground>

      <BrandStory />
      <Newsletter />
    </>
  );
}
