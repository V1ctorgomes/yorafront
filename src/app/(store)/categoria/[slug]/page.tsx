import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/home/ProductCard";
import { fetchCategoryBySlug } from "@/lib/api/categories";
import { fetchProducts } from "@/lib/api/products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await fetchProducts({ category: slug });
  const bannerImage = category.bannerImageUrl ?? category.imageUrl;

  return (
    <div>
      <section className="relative min-h-[320px] overflow-hidden bg-yora-sand md:min-h-[420px]">
        {bannerImage ? (
          <>
            <Image
              src={bannerImage}
              alt={category.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-yora-charcoal/45" />
          </>
        ) : null}
        <div className="relative mx-auto flex min-h-[320px] max-w-7xl flex-col justify-end px-4 pb-12 md:min-h-[420px] md:px-6 md:pb-16 lg:px-8">
          <p
            className={
              bannerImage
                ? "text-xs tracking-[0.35em] text-yora-cream/80 uppercase"
                : "text-xs tracking-[0.35em] text-yora-taupe uppercase"
            }
          >
            Categoria
          </p>
          <h1
            className={
              bannerImage
                ? "mt-3 font-display text-4xl text-yora-cream md:text-6xl"
                : "mt-3 font-display text-4xl text-yora-charcoal md:text-6xl"
            }
          >
            {category.name}
          </h1>
          {category.description && (
            <p
              className={
                bannerImage
                  ? "mt-4 max-w-2xl text-sm leading-relaxed text-yora-cream/90 md:text-base"
                  : "mt-4 max-w-2xl text-sm leading-relaxed text-yora-muted md:text-base"
              }
            >
              {category.description}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        {products.length === 0 ? (
          <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-16 text-center">
            <p className="font-display text-2xl text-yora-charcoal">
              Nenhum produto disponível
            </p>
            <p className="mt-3 text-sm text-yora-muted">
              Em breve teremos novidades nesta categoria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
