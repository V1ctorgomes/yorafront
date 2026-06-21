import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/home/ProductCard";
import { fetchCollectionBySlug } from "@/lib/api/collections";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

function formatLaunchDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await fetchCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <div>
      <section className="relative min-h-[360px] overflow-hidden bg-yora-sand md:min-h-[480px]">
        <Image
          src={collection.bannerImageUrl}
          alt={collection.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-yora-charcoal/45" />
        <div className="relative mx-auto flex min-h-[360px] max-w-7xl flex-col justify-end px-4 pb-12 md:min-h-[480px] md:px-6 md:pb-16 lg:px-8">
          <p className="text-xs tracking-[0.35em] text-yora-cream/80 uppercase">
            Coleção
          </p>
          <h1 className="mt-3 font-display text-4xl text-yora-cream md:text-6xl">
            {collection.name}
          </h1>
          <p className="mt-3 text-sm text-yora-cream/80">
            Lançamento em {formatLaunchDate(collection.launchDate)}
          </p>
          {collection.description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-yora-cream/90 md:text-base">
              {collection.description}
            </p>
          )}
          <p className="mt-4 text-xs tracking-widest text-yora-cream/70 uppercase">
            {collection.productCount}{" "}
            {collection.productCount === 1 ? "produto" : "produtos"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        {collection.products.length === 0 ? (
          <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-16 text-center">
            <p className="font-display text-2xl text-yora-charcoal">
              Produtos em breve
            </p>
            <p className="mt-3 text-sm text-yora-muted">
              Esta coleção ainda não possui produtos vinculados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {collection.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
