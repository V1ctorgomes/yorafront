import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex flex-col">
      <Link
        href={`/produto/${product.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-yora-sand"
      >
        <Image
          src={product.coverImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.isNew && (
          <div className="absolute top-3 left-3">
            <Badge type="new" />
          </div>
        )}
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="text-sm tracking-wide text-yora-charcoal transition-colors group-hover:text-yora-taupe">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-medium text-yora-charcoal">
            {formatPrice(product.basePrice)}
          </span>
        </div>

        <div className="mt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:opacity-100">
          <Button variant="primary" size="sm" className="w-full" disabled>
            Adicionar à sacola
          </Button>
        </div>
      </div>
    </article>
  );
}
