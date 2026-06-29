"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckoutApiError, fetchOrder } from "@/lib/api/checkout";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("pedido");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      setError("Pedido não informado.");
      return;
    }

    fetchOrder(orderNumber)
      .then(setOrder)
      .catch((err) => {
        const message =
          err instanceof CheckoutApiError
            ? err.message
            : "Não foi possível carregar os detalhes do pedido.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <p className="text-sm text-yora-muted">Carregando confirmação...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
        <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-12 text-center">
          <p className="font-display text-2xl text-yora-charcoal">
            Pedido não encontrado
          </p>
          <p className="mt-3 text-sm text-yora-muted">{error}</p>
          <Button href="/" className="mt-6">
            Voltar à loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-yora-taupe uppercase">
          Pedido confirmado
        </p>
        <h1 className="mt-4 font-display text-4xl text-yora-charcoal">
          Obrigado pela sua compra!
        </h1>
        <p className="mt-4 text-sm text-yora-muted">
          Seu pedido foi registrado e em breve você receberá mais informações
          por e-mail.
        </p>
        <p className="mt-6 text-sm">
          Número do pedido:{" "}
          <span className="font-medium text-yora-charcoal">
            {order.orderNumber}
          </span>
        </p>
      </div>

      <div className="mt-10 border border-yora-charcoal/10 bg-yora-cream p-6">
        <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
          Resumo da compra
        </h2>
        <div className="mt-5 space-y-4">
          {order.items.map((item) => (
            <div
              key={item.productVariantId}
              className="flex items-start justify-between gap-4 text-sm"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-yora-muted">
                  {item.quantity}x {formatPrice(item.unitPrice)}
                </p>
              </div>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t border-yora-charcoal/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-yora-muted">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yora-muted">Frete ({order.shippingLabel})</span>
            <span>
              {order.shippingPrice === 0
                ? "Grátis"
                : formatPrice(order.shippingPrice)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-yora-muted">
                Desconto
                {order.promotionCode ? ` (${order.promotionCode})` : ""}
              </span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-yora-charcoal/10 pt-3 text-base font-medium">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {order.address && (
        <div className="mt-6 border border-yora-charcoal/10 bg-yora-cream p-6 text-sm">
          <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
            Endereço de entrega
          </h2>
          <p className="mt-3">{order.address.recipient}</p>
          <p>
            {order.address.street}, {order.address.number}
            {order.address.complement
              ? ` - ${order.address.complement}`
              : ""}
          </p>
          <p className="text-yora-muted">
            {order.address.district}, {order.address.city} -{" "}
            {order.address.state}
          </p>
          <p className="text-yora-muted">CEP {order.address.zipCode}</p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button href="/">Continuar comprando</Button>
        <Link
          href="/novidades"
          className="inline-flex items-center px-4 text-sm text-yora-muted hover:text-yora-charcoal"
        >
          Ver novidades
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
          <p className="text-sm text-yora-muted">Carregando confirmação...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
