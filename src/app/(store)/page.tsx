import { HeroBanner } from "@/components/home/HeroBanner";
import { CollectionCard } from "@/components/home/CollectionCard";
import { ProductCard } from "@/components/home/ProductCard";
import { BrandStory } from "@/components/home/BrandStory";
import { Newsletter } from "@/components/home/Newsletter";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/Button";
import { banners } from "@/data/banners";
import { collections } from "@/data/collections";
import { featuredProducts } from "@/data/products";

export default function HomePage() {
  const heroBanner = banners[0];

  return (
    <>
      <HeroBanner banner={heroBanner} />

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

      <section className="relative mx-4 my-16 overflow-hidden md:mx-6 lg:mx-8">
        <div
          className="relative flex min-h-[320px] items-center justify-center bg-cover bg-center px-6 py-16 text-center md:min-h-[400px]"
          style={{ backgroundImage: `url(${banners[1].image})` }}
        >
          <div className="absolute inset-0 bg-yora-charcoal/50" />
          <div className="relative max-w-lg">
            <p className="text-xs tracking-[0.35em] text-yora-cream/80 uppercase">
              Season essentials
            </p>
            <h2 className="mt-4 font-display text-3xl text-yora-cream md:text-5xl">
              {banners[1].title}
            </h2>
            <p className="mt-4 text-sm text-yora-cream/90">
              {banners[1].subtitle}
            </p>
            <div className="mt-8">
              <Button
                href={banners[1].buttonLink}
                variant="outline"
                className="border-yora-cream text-yora-cream hover:bg-yora-cream hover:text-yora-charcoal"
              >
                {banners[1].buttonText}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
