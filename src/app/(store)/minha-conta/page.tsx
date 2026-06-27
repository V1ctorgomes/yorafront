"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAccountOverview } from "@/lib/api/me";
import { getOrderStatusColor, getOrderStatusLabel } from "@/lib/order-status";
import { formatPrice, cn } from "@/lib/utils";
import type { AccountOverview } from "@/types";

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AccountDashboardPage() {
  const [overview, setOverview] = useState<AccountOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountOverview()
      .then(setOverview)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-yora-muted">Carregando...</p>;
  }

  if (!overview) {
    return <p className="text-sm text-yora-muted">Não foi possível carregar sua conta.</p>;
  }

  const { profile, dashboard } = overview;

  return (
    <div>
      <h2 className="font-display text-2xl text-yora-charcoal">Dashboard</h2>
      <p className="mt-2 text-sm text-yora-muted">
        Olá, {profile.name}. Bem-vinda de volta à YORA.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <InfoCard label="Último acesso" value={formatDateTime(profile.lastLogin)} />
        <InfoCard label="Total de pedidos" value={dashboard.totalOrders} />
        <InfoCard label="Endereços cadastrados" value={dashboard.addressCount} />
        <InfoCard
          label="Status do último pedido"
          value={
            dashboard.lastOrder
              ? getOrderStatusLabel(dashboard.lastOrder.status)
              : "Nenhum pedido"
          }
          valueClassName={
            dashboard.lastOrder
              ? getOrderStatusColor(dashboard.lastOrder.status)
              : undefined
          }
        />
      </div>

      {dashboard.lastOrder && (
        <section className="mt-8 border border-yora-charcoal/10 bg-yora-cream p-6">
          <h3 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
            Último pedido
          </h3>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div>
              <p className="font-medium">{dashboard.lastOrder.orderNumber}</p>
              <p className="text-yora-muted">
                {formatDateTime(dashboard.lastOrder.createdAt)} ·{" "}
                {dashboard.lastOrder.itemCount}{" "}
                {dashboard.lastOrder.itemCount === 1 ? "item" : "itens"}
              </p>
            </div>
            <div className="text-right">
              <p>{formatPrice(dashboard.lastOrder.total)}</p>
              <Link
                href={`/minha-conta/pedidos/${encodeURIComponent(dashboard.lastOrder.orderNumber)}`}
                className="text-yora-taupe hover:text-yora-charcoal"
              >
                Ver detalhes
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="border border-yora-charcoal/10 bg-yora-cream p-5">
      <p className="text-xs tracking-widest text-yora-muted uppercase">
        {label}
      </p>
      <p className={cn("mt-2 font-display text-2xl text-yora-charcoal", valueClassName)}>
        {value}
      </p>
    </div>
  );
}
