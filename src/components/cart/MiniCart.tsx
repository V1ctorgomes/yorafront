"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/cart-context";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMounted } from "@/lib/use-mounted";
import { cn, formatPrice } from "@/lib/utils";

const MINI_CART_TRANSITION_MS = 380;

export function MiniCart() {
  const {
    cart,
    miniCartOpen,
    setMiniCartOpen,
    updateItemQuantity,
    removeItem,
  } = useCart();
  const mounted = useMounted();
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useBodyScrollLock(isRendered);

  useEffect(() => {
    if (!miniCartOpen) {
      setIsVisible(false);
      const timer = window.setTimeout(() => {
        setIsRendered(false);
      }, MINI_CART_TRANSITION_MS);

      return () => window.clearTimeout(timer);
    }

    setIsRendered(true);
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsVisible(true));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [miniCartOpen]);

  useEffect(() => {
    if (!isRendered) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMiniCartOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isRendered, setMiniCartOpen]);

  if (!mounted || !isRendered) return null;

  function closeMiniCart() {
    setMiniCartOpen(false);
  }

  return createPortal(
    <>
      <div
        className={cn(
          "mini-cart-backdrop fixed inset-0 z-[200] bg-yora-charcoal/50 backdrop-blur-[2px]",
          isVisible ? "mini-cart-backdrop-open" : "mini-cart-backdrop-closed",
        )}
        onClick={closeMiniCart}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "mini-cart-panel fixed top-0 right-0 z-[201] isolate flex h-dvh w-[min(420px,100vw)] flex-col overflow-hidden bg-yora-cream/90 backdrop-blur-2xl shadow-2xl",
          isVisible ? "mini-cart-panel-open" : "mini-cart-panel-closed",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Sacola"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative z-10 shrink-0 border-b border-yora-charcoal/10 bg-transparent px-5 py-4">
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

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-transparent px-5 py-5">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-yora-charcoal/5 p-4 text-yora-charcoal/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <p className="text-base text-yora-charcoal font-medium">Sua sacola está vazia</p>
              <p className="text-sm text-yora-muted mt-2 max-w-[250px]">Explore nossas coleções e encontre peças incríveis para você.</p>
              <Button href="/colecoes" className="mt-8" onClick={closeMiniCart}>Explorar Coleções</Button>
            </div>
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

        {cart.items.length > 0 && (
          <div className="relative z-10 shrink-0 border-t border-yora-charcoal/10 bg-transparent px-5 py-5">
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
        )}
      </aside>
    </>,
    document.body,
  );
}
