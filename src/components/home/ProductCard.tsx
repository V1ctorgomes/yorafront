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
  const isSoldOut = product.badge === "sold-out";

  return (
    <article className="group flex flex-col">
      <Link
        href={`/produtos/${product.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-yora-sand"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge type={product.badge} />
          </div>
        )}
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="text-sm tracking-wide text-yora-charcoal transition-colors group-hover:text-yora-taupe">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-medium text-yora-charcoal">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-yora-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="mt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:opacity-100">
          <Button
            variant={isSoldOut ? "ghost" : "primary"}
            size="sm"
            className="w-full"
            disabled={isSoldOut}
          >
            {isSoldOut ? "Indisponível" : "Adicionar à sacola"}
          </Button>
        </div>
      </div>
    </article>
  );
}
