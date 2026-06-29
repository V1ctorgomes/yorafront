"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MessageCircle, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  buildProductGalleryImages,
  DraggableImageCarousel,
} from "@/components/product/DraggableImageCarousel";
import { CheckoutAccessModal } from "@/features/checkout/CheckoutAccessModal";
import { useCart } from "@/features/cart/cart-context";
import { isCustomerAuthenticated } from "@/lib/auth";
import { cn, formatPrice } from "@/lib/utils";
import {
  buildProductWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
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
  const router = useRouter();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [addError, setAddError] = useState("");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const initial = getInitialSelection(variants);
  const [selectedColor, setSelectedColor] = useState(initial.color);
  const [selectedSize, setSelectedSize] = useState(initial.size);

  const gallery = useMemo(
    () =>
      buildProductGalleryImages(product.coverImage, product.name, product.images, {
        color: selectedColor || undefined,
      }),
    [product, selectedColor],
  );

  const colors = useMemo(
    () => [...new Set(variants.map((variant) => variant.color))],
    [variants],
  );

  const sizes = useMemo(
    () => [...new Set(variants.map((variant) => variant.size))],
    [variants],
  );

  const selectedVariant = variants.find(
    (variant) =>
      variant.color === selectedColor && variant.size === selectedSize,
  );

  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const isSoldOut = !selectedVariant || selectedVariant.stock <= 0;
  const canAddToCart =
    Boolean(selectedVariant && selectedColor && selectedSize) && !isSoldOut;

  const whatsappUrl = useMemo(() => {
    const message = buildProductWhatsAppMessage({
      productName: product.name,
      slug: product.slug,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      price: displayPrice,
    });

    return buildWhatsAppUrl(message);
  }, [
    product.name,
    product.slug,
    selectedColor,
    selectedSize,
    displayPrice,
  ]);

  function goToCheckout() {
    if (isCustomerAuthenticated()) {
      router.push("/checkout");
      return;
    }

    setCheckoutModalOpen(true);
  }

  async function handleAddToCart() {
    if (!selectedVariant || !canAddToCart || adding || buying) {
      return;
    }

    setAdding(true);
    setAddError("");

    try {
      await addItem(selectedVariant.id, 1);
    } catch (error) {
      setAddError(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar ao carrinho.",
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleBuy() {
    if (!selectedVariant || !canAddToCart || adding || buying) {
      return;
    }

    setBuying(true);
    setAddError("");

    try {
      await addItem(selectedVariant.id, 1, { showToast: false });
      goToCheckout();
    } catch (error) {
      setAddError(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a compra.",
      );
    } finally {
      setBuying(false);
    }
  }

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <DraggableImageCarousel
            key={selectedColor}
            images={gallery}
            alt={product.name}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {gallery.length > 1 && (
            <p className="mt-3 text-center text-xs text-yora-muted">
              Arraste para ver as {gallery.length} fotos do produto
            </p>
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

          <div className="mt-8 space-y-3">
            <div className="flex gap-3">
              <Button
                disabled={!canAddToCart || adding || buying}
                className="min-h-12 flex-1"
                onClick={handleBuy}
              >
                {isSoldOut
                  ? "Esgotado"
                  : buying
                    ? "Processando..."
                    : "Comprar"}
              </Button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart || adding || buying}
                aria-label="Adicionar ao carrinho"
                className={cn(
                  "group inline-flex h-12 w-12 shrink-0 items-center justify-center border border-yora-charcoal bg-transparent text-yora-charcoal transition-colors hover:bg-yora-charcoal hover:text-yora-cream active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                <span className="relative flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-yora-charcoal text-yora-cream transition-colors group-hover:bg-yora-cream group-hover:text-yora-charcoal">
                    <Plus className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                </span>
              </button>
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 w-full items-center justify-center gap-2 border border-[#25D366]/30 bg-[#25D366]/5 px-4 text-xs font-medium tracking-widest text-[#1a8f45] uppercase transition-colors hover:border-[#25D366]/50 hover:bg-[#25D366]/10"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                Comprar pelo WhatsApp
              </a>
            )}

            {addError && <p className="text-sm text-red-600">{addError}</p>}
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

      <CheckoutAccessModal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onGuestContinue={() => {
          setCheckoutModalOpen(false);
          router.push("/checkout");
        }}
      />
    </div>
  );
}
