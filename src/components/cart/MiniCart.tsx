"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/cart-context";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMounted } from "@/lib/use-mounted";
import { formatPrice } from "@/lib/utils";

export function MiniCart() {
  const {
    cart,
    miniCartOpen,
    setMiniCartOpen,
    updateItemQuantity,
    removeItem,
  } = useCart();
  const mounted = useMounted();

  useBodyScrollLock(miniCartOpen);

  useEffect(() => {
    if (!miniCartOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMiniCartOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [miniCartOpen, setMiniCartOpen]);

  if (!mounted || !miniCartOpen) return null;

  function closeMiniCart() {
    setMiniCartOpen(false);
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[200] bg-yora-charcoal/50"
        onClick={closeMiniCart}
        aria-hidden="true"
      />

      <aside
        className="fixed top-0 right-0 z-[201] isolate flex h-dvh w-[min(420px,100vw)] flex-col overflow-hidden bg-yora-cream shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Sacola"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative z-10 shrink-0 border-b border-yora-charcoal/10 bg-yora-cream px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-yora-charcoal">Sacola</h2>
            <button
              type="button"
              onClick={closeMiniCart}
              className="p-2 text-yora-muted hover:text-yora-charcoal"
              aria-label="Fechar sacola"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-yora-cream px-5 py-5">
          {cart.items.length === 0 ? (
            <p className="text-sm text-yora-muted">Sua sacola está vazia.</p>
          ) : (
            <div className="space-y-5">
              {cart.items.map((item) => (
                <CartLineItem
                  key={item.productVariantId}
                  item={item}
                  compact
                  onIncrease={() =>
                    updateItemQuantity(
                      item.productVariantId,
                      item.quantity + 1,
                    )
                  }
                  onDecrease={() => {
                    if (item.quantity <= 1) {
                      removeItem(item.productVariantId);
                      return;
                    }

                    updateItemQuantity(
                      item.productVariantId,
                      item.quantity - 1,
                    );
                  }}
                  onRemove={() => removeItem(item.productVariantId)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 shrink-0 border-t border-yora-charcoal/10 bg-yora-cream px-5 py-5">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-yora-muted">Subtotal</span>
            <span className="font-medium text-yora-charcoal">
              {formatPrice(cart.subtotal)}
            </span>
          </div>
          <Button
            href="/carrinho"
            className="w-full"
            onClick={closeMiniCart}
          >
            Ver Carrinho
          </Button>
        </div>
      </aside>
    </>,
    document.body,
  );
}
