import { HeroBannerSection } from "@/components/home/HeroBannerSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { BrandStory } from "@/components/home/BrandStory";
import { Newsletter } from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <HeroBannerSection />
      
      <div className="fluid-wrapper">
        <div className="fluid-content">
          <CategoriesSection />
          <CollectionsSection />
          <FeaturedProductsSection />
        </div>
      </div>

      <BrandStory />
      <Newsletter />
    </>
  );
}
