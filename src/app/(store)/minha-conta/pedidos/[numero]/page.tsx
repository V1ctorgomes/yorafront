"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchCustomerOrder } from "@/lib/api/me";
import { getOrderStatusColor, getOrderStatusLabel } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import type { CustomerOrderDetail } from "@/types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AccountOrderDetailPage() {
  const params = useParams<{ numero: string }>();
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomerOrder(decodeURIComponent(params.numero))
      .then(setOrder)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Pedido não encontrado.",
        );
      })
      .finally(() => setLoading(false));
  }, [params.numero]);

  if (loading) {
    return <p className="text-sm text-yora-muted">Carregando pedido...</p>;
  }

  if (!order) {
    return (
      <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream p-8 text-center text-sm text-yora-muted">
        {error || "Pedido não encontrado."}
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/minha-conta/pedidos"
        className="mb-6 inline-flex items-center gap-2 text-sm text-yora-muted hover:text-yora-charcoal"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para pedidos
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-yora-charcoal">
            {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-yora-muted">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <p className={`text-lg ${getOrderStatusColor(order.status)}`}>
          {getOrderStatusLabel(order.status)}
        </p>
        {order.status === "WAITING_PAYMENT" && (
          <Button
            href={`/pagamento/${encodeURIComponent(order.orderNumber)}`}
            size="sm"
          >
            Continuar pagamento
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
          <h3 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
            Produtos
          </h3>
          <div className="mt-4 space-y-4">
            {order.items.map((item, index) => (
              <div key={`${item.sku}-${index}`} className="flex gap-4 border-b border-yora-charcoal/5 pb-4 last:border-0 last:pb-0">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-yora-sand">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-yora-muted">
                      Sem foto
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-yora-muted">
                    {item.color ?? "—"} / {item.size ?? "—"}
                  </p>
                  <p className="text-yora-muted">
                    {item.quantity}x {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {formatPrice(item.subtotal)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          {order.address && (
            <section className="border border-yora-charcoal/10 bg-yora-cream p-5 text-sm">
              <h3 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
                Endereço
              </h3>
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
            </section>
          )}

          <section className="border border-yora-charcoal/10 bg-yora-cream p-5 text-sm">
            <h3 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
              Resumo
            </h3>
            <div className="mt-4 space-y-3">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row
                label={`Frete (${order.shippingLabel})`}
                value={
                  order.shippingPrice === 0
                    ? "Grátis"
                    : formatPrice(order.shippingPrice)
                }
              />
              {order.discount > 0 && (
                <Row label="Desconto" value={`-${formatPrice(order.discount)}`} />
              )}
              <Row label="Total" value={formatPrice(order.total)} strong />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${strong ? "border-t border-yora-charcoal/10 pt-3 font-medium" : ""}`}
    >
      <span className="text-yora-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
