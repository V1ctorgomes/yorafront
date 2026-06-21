import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { fetchProductBySlug } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[3/4] overflow-hidden bg-yora-sand">
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col">
          <Link
            href={`/categoria/${product.category.slug}`}
            className="text-xs tracking-[0.35em] text-yora-taupe uppercase transition-colors hover:text-yora-charcoal"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-3 font-display text-4xl text-yora-charcoal md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 text-2xl font-medium text-yora-charcoal">
            {formatPrice(product.basePrice)}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-yora-muted md:text-base">
            {product.shortDescription}
          </p>

          <div className="mt-8">
            <Button disabled className="min-w-[220px]">
              Comprar
            </Button>
            <p className="mt-3 text-xs text-yora-muted">
              Carrinho disponível em breve.
            </p>
          </div>

          {product.description && (
            <div className="mt-10 border-t border-yora-charcoal/10 pt-8">
              <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
                Sobre o produto
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-yora-charcoal/90 md:text-base">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
