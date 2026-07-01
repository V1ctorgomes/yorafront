"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  buildProductGalleryImages,
  DraggableImageCarousel,
} from "@/components/product/DraggableImageCarousel";
import { ProductColorSwatches } from "@/components/product/ProductColorSwatches";
import { extractProductColors } from "@/lib/product-colors";
import {
  getSaleDiscountPercent,
  hasSalePricing,
} from "@/lib/product-pricing";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const availableColors = useMemo(
    () => extractProductColors(product.images, product.colors),
    [product.images, product.colors],
  );

  const gallery = useMemo(
    () =>
      buildProductGalleryImages(product.coverImage, product.name, product.images, {
        color: selectedColor ?? undefined,
        limit: 3,
      }),
    [product, selectedColor],
  );

  return (
    <article className="group flex flex-col p-3 rounded-xl hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
      <div className="relative">
        <DraggableImageCarousel
          key={selectedColor ?? "default"}
          images={gallery}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          revealSecondOnHover={!selectedColor}
          onNavigate={() => router.push(`/produto/${product.slug}`)}
        />
        {product.isOnSale && (
          <div className="pointer-events-none absolute top-3 left-3 z-10">
            <Badge type="sale" />
          </div>
        )}
        {!product.isOnSale && product.isNew && (
          <div className="pointer-events-none absolute top-3 left-3 z-10">
            <Badge type="new" />
          </div>
        )}
      </div>

      {availableColors.length >= 2 && (
        <ProductColorSwatches
          colors={availableColors}
          selectedColor={selectedColor}
          onSelect={setSelectedColor}
          className="mt-3"
        />
      )}

      <div className="mt-4 flex flex-1 flex-col">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="text-sm tracking-wide text-yora-charcoal transition-colors group-hover:text-yora-taupe">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-medium text-yora-charcoal">
            {formatPrice(product.basePrice)}
          </span>
          {hasSalePricing(product) && (
            <>
              <span className="text-sm text-yora-muted line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
              <span className="text-[11px] font-medium tracking-wide text-yora-rose uppercase">
                -
                {getSaleDiscountPercent(
                  product.compareAtPrice!,
                  product.basePrice,
                )}
                %
              </span>
            </>
          )}
        </div>

        <div className="mt-4 hidden md:block opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Button variant="primary" size="sm" className="w-full" disabled>
            Adicionar à sacola
          </Button>
        </div>
      </div>
    </article>
  );
}
