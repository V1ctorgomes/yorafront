import { ProductCard } from "@/components/home/ProductCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { fetchProducts } from "@/lib/api/products";

export default async function NovidadesPage() {
  const products = await fetchProducts({ isNew: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <SectionTitle
        title="Novidades"
        subtitle="As últimas peças que acabaram de chegar."
      />

      {products.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-16 text-center">
          <p className="font-display text-2xl text-yora-charcoal">
            Nenhuma novidade no momento
          </p>
          <p className="mt-3 text-sm text-yora-muted">
            Volte em breve para conferir os lançamentos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
