"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn, formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

interface ProductDetailProps {
  product: Product;
  variants: ProductVariant[];
}

function getInitialSelection(variants: ProductVariant[]) {
  const inStock = variants.find((variant) => variant.stock > 0);
  const first = variants[0];

  return {
    color: (inStock ?? first)?.color ?? "",
    size: (inStock ?? first)?.size ?? "",
  };
}

export function ProductDetail({ product, variants }: ProductDetailProps) {
  const gallery = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }

    return [
      {
        id: "cover",
        imageUrl: product.coverImage,
        altText: product.name,
        displayOrder: 0,
      },
    ];
  }, [product]);

  const colors = useMemo(
    () => [...new Set(variants.map((variant) => variant.color))],
    [variants],
  );

  const sizes = useMemo(
    () => [...new Set(variants.map((variant) => variant.size))],
    [variants],
  );

  const initial = getInitialSelection(variants);
  const [selectedColor, setSelectedColor] = useState(initial.color);
  const [selectedSize, setSelectedSize] = useState(initial.size);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const selectedVariant = variants.find(
    (variant) =>
      variant.color === selectedColor && variant.size === selectedSize,
  );

  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const isSoldOut = !selectedVariant || selectedVariant.stock <= 0;

  function handleColorChange(color: string) {
    setSelectedColor(color);

    const variantForColor = variants.find(
      (variant) => variant.color === color && variant.size === selectedSize,
    );

    if (!variantForColor) {
      const fallbackSize = variants.find((variant) => variant.color === color)
        ?.size;
      if (fallbackSize) {
        setSelectedSize(fallbackSize);
      }
    }
  }

  function isSizeAvailable(size: string) {
    return variants.some(
      (variant) =>
        variant.color === selectedColor &&
        variant.size === size &&
        variant.stock > 0,
    );
  }

  const activeImage = gallery[activeImageIndex] ?? gallery[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden bg-yora-sand">
            <Image
              src={activeImage.imageUrl}
              alt={activeImage.altText ?? product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-5">
              {gallery.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={cn(
                    "relative aspect-[3/4] overflow-hidden border bg-yora-sand transition-colors",
                    activeImageIndex === index
                      ? "border-yora-charcoal"
                      : "border-transparent hover:border-yora-charcoal/30",
                  )}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.altText ?? product.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>
          )}
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
            {formatPrice(displayPrice)}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-yora-muted md:text-base">
            {product.shortDescription}
          </p>

          {variants.length > 0 && (
            <div className="mt-8 space-y-6">
              {colors.length > 0 && (
                <div>
                  <p className="mb-3 text-xs tracking-[0.35em] text-yora-muted uppercase">
                    Cor
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        className={cn(
                          "border px-4 py-2 text-sm transition-colors",
                          selectedColor === color
                            ? "border-yora-charcoal bg-yora-charcoal text-yora-cream"
                            : "border-yora-charcoal/20 text-yora-charcoal hover:border-yora-charcoal",
                        )}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <p className="mb-3 text-xs tracking-[0.35em] text-yora-muted uppercase">
                    Tamanho
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const available = isSizeAvailable(size);
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-12 border px-4 py-2 text-sm transition-colors",
                            isSelected
                              ? "border-yora-charcoal bg-yora-charcoal text-yora-cream"
                              : available
                                ? "border-yora-charcoal/20 text-yora-charcoal hover:border-yora-charcoal"
                                : "border-yora-charcoal/10 text-yora-muted line-through",
                          )}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-sm text-yora-muted">
                {isSoldOut ? (
                  <span className="font-medium text-yora-charcoal">
                    Esgotado
                  </span>
                ) : (
                  <>
                    <span className="font-medium text-yora-charcoal">
                      {selectedVariant.stock}
                    </span>{" "}
                    unidade{selectedVariant.stock === 1 ? "" : "s"} disponível
                    {selectedVariant.stock === 1 ? "" : "is"}
                  </>
                )}
              </p>
            </div>
          )}

          <div className="mt-8">
            <Button disabled={isSoldOut} className="min-w-[220px]">
              {isSoldOut ? "Esgotado" : "Comprar"}
            </Button>
            {!isSoldOut && (
              <p className="mt-3 text-xs text-yora-muted">
                Carrinho disponível em breve.
              </p>
            )}
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
