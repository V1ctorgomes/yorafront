import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchCategoryBySlug } from "@/lib/api/categories";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <section className="relative min-h-[320px] overflow-hidden bg-yora-sand md:min-h-[420px]">
        {category.imageUrl && (
          <>
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-yora-charcoal/45" />
          </>
        )}
        <div className="relative mx-auto flex min-h-[320px] max-w-7xl flex-col justify-end px-4 pb-12 md:min-h-[420px] md:px-6 md:pb-16 lg:px-8">
          <p
            className={
              category.imageUrl
                ? "text-xs tracking-[0.35em] text-yora-cream/80 uppercase"
                : "text-xs tracking-[0.35em] text-yora-taupe uppercase"
            }
          >
            Categoria
          </p>
          <h1
            className={
              category.imageUrl
                ? "mt-3 font-display text-4xl text-yora-cream md:text-6xl"
                : "mt-3 font-display text-4xl text-yora-charcoal md:text-6xl"
            }
          >
            {category.name}
          </h1>
          {category.description && (
            <p
              className={
                category.imageUrl
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
        <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-16 text-center">
          <p className="font-display text-2xl text-yora-charcoal">
            Produtos em breve
          </p>
          <p className="mt-3 text-sm text-yora-muted">
            Esta categoria está pronta para receber produtos no próximo módulo.
          </p>
        </div>
      </section>
    </div>
  );
}
