"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/cart-context";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMounted } from "@/lib/use-mounted";
import { cn, formatPrice } from "@/lib/utils";

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

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-yora-charcoal/40 transition-opacity duration-300",
          miniCartOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setMiniCartOpen(false)}
        aria-hidden={!miniCartOpen}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 z-[61] flex h-dvh w-[min(420px,100vw)] flex-col bg-yora-cream shadow-2xl transition-transform duration-300 ease-out",
          miniCartOpen ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
        aria-hidden={!miniCartOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Sacola"
      >
        <div className="flex items-center justify-between border-b border-yora-charcoal/10 px-5 py-4">
          <h2 className="font-display text-xl text-yora-charcoal">Sacola</h2>
          <button
            type="button"
            onClick={() => setMiniCartOpen(false)}
            className="p-2 text-yora-muted hover:text-yora-charcoal"
            aria-label="Fechar sacola"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
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

        <div className="border-t border-yora-charcoal/10 px-5 py-5">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-yora-muted">Subtotal</span>
            <span className="font-medium text-yora-charcoal">
              {formatPrice(cart.subtotal)}
            </span>
          </div>
          <Button
            href="/carrinho"
            className="w-full"
            onClick={() => setMiniCartOpen(false)}
          >
            Ver Carrinho
          </Button>
        </div>
      </aside>
    </>,
    document.body,
  );
}
