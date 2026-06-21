import { ProductCard } from "@/components/home/ProductCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/Button";
import { fetchProducts } from "@/lib/api/products";

export async function FeaturedProductsSection() {
  const products = await fetchProducts({ featured: true });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:mb-8 md:flex-row md:items-end">
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
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
