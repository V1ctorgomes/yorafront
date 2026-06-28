"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { Button } from "@/components/ui/Button";
import { CheckoutAccessModal } from "@/features/checkout/CheckoutAccessModal";
import { useCart } from "@/features/cart/cart-context";
import { isCustomerAuthenticated } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, updateItemQuantity, removeItem, clearCart } = useCart();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  function handleCheckoutClick() {
    if (isCustomerAuthenticated()) {
      router.push("/checkout");
      return;
    }

    setCheckoutModalOpen(true);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
        <p className="text-sm text-yora-muted">Carregando carrinho...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-yora-charcoal">Carrinho</h1>
          <p className="mt-2 text-sm text-yora-muted">
            {cart.itemCount}{" "}
            {cart.itemCount === 1 ? "item" : "itens"} na sacola
          </p>
        </div>
        {cart.items.length > 0 && (
          <button
            type="button"
            onClick={() => clearCart()}
            className="text-sm text-yora-muted transition-colors hover:text-red-600"
          >
            Limpar carrinho
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-16 text-center">
          <p className="font-display text-2xl text-yora-charcoal">
            Sua sacola está vazia
          </p>
          <p className="mt-3 text-sm text-yora-muted">
            Explore a loja e adicione produtos ao carrinho.
          </p>
          <Button href="/" className="mt-6">
            Continuar comprando
          </Button>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {cart.items.map((item) => (
              <CartLineItem
                key={item.productVariantId}
                item={item}
                onIncrease={() =>
                  updateItemQuantity(item.productVariantId, item.quantity + 1)
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

          <aside className="h-fit border border-yora-charcoal/10 bg-yora-cream p-6">
            <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
              Resumo
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-yora-muted">Itens</span>
                <span>{cart.itemCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yora-muted">Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-yora-charcoal/10 pt-3 text-base font-medium">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
            <Button
              type="button"
              className="mt-6 w-full"
              onClick={handleCheckoutClick}
            >
              Continuar para Checkout
            </Button>
            <Link
              href="/"
              className="mt-4 block text-center text-sm text-yora-muted hover:text-yora-charcoal"
            >
              Continuar comprando
            </Link>
          </aside>
        </div>
      )}

      <CheckoutAccessModal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
      />
    </div>
  );
}
