import { HeroBannerSection } from "@/components/home/HeroBannerSection";
import { CollectionCard } from "@/components/home/CollectionCard";
import { ProductCard } from "@/components/home/ProductCard";
import { BrandStory } from "@/components/home/BrandStory";
import { Newsletter } from "@/components/home/Newsletter";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/Button";
import { collections } from "@/data/collections";
import { featuredProducts } from "@/data/products";

export default function HomePage() {
  return (
    <>
      <HeroBannerSection />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <SectionTitle
          title="Compre por modalidade"
          subtitle="Encontre a peça ideal para cada momento do seu dia."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:mb-14 md:flex-row md:items-end">
          <SectionTitle
            title="Em destaque"
            subtitle="Os favoritos de quem entende de estilo."
            align="left"
            className="mb-0"
          />
          <Button href="/novidades" variant="ghost" size="sm">
            Ver todos
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <BrandStory />

      <Newsletter />
    </>
  );
}
