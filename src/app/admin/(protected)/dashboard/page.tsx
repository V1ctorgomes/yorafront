"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminOrdersDashboard, fetchAdminPromotionsDashboard } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils";
import type { AdminOrdersDashboard, PromotionsDashboard } from "@/types";

const shortcuts = [
  { label: "Pedidos", href: "/admin/orders" },
  { label: "Promoções", href: "/admin/promotions" },
  { label: "Produtos", href: "/admin/products" },
  { label: "Categorias", href: "/admin/categories" },
  { label: "Coleções", href: "/admin/collections" },
  { label: "Banners", href: "/admin/banners" },
];

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminOrdersDashboard | null>(null);
  const [promotions, setPromotions] = useState<PromotionsDashboard | null>(null);

  useEffect(() => {
    fetchAdminOrdersDashboard()
      .then(setDashboard)
      .catch(() => setDashboard(null));
    fetchAdminPromotionsDashboard()
      .then(setPromotions)
      .catch(() => setPromotions(null));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-yora-charcoal">Dashboard</h1>
        <p className="mt-1 text-sm text-yora-muted">
          Visão geral da operação da loja.
        </p>
      </div>

      {dashboard && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Aguardando pagamento"
            value={dashboard.counts.waitingPayment}
          />
          <MetricCard label="Em separação" value={dashboard.counts.processing} />
          <MetricCard label="Valor vendido" value={formatPrice(dashboard.summary.totalRevenue)} />
          <MetricCard
            label="Ticket médio"
            value={formatPrice(dashboard.summary.averageTicket)}
          />
        </div>
      )}

      {promotions && (
        <div className="mb-8">
          <h2 className="mb-4 text-xs tracking-[0.35em] text-yora-muted uppercase">
            Promoções
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Descontos concedidos"
              value={formatPrice(promotions.totalDiscountGranted)}
            />
            <MetricCard
              label="Pedidos com promoção"
              value={promotions.ordersWithPromotion}
            />
            <MetricCard
              label="Receita com promoção"
              value={formatPrice(promotions.promotionRevenue)}
            />
            <MetricCard
              label="Conversão promocional"
              value={`${(promotions.conversionRate * 100).toFixed(1)}%`}
            />
          </div>
          {promotions.topPromotions.length > 0 && (
            <div className="mt-4 border border-yora-charcoal/10 bg-yora-cream p-5">
              <h3 className="text-sm font-medium text-yora-charcoal">
                Promoções mais utilizadas
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-yora-muted">
                {promotions.topPromotions.map((item) => (
                  <li
                    key={item.promotionId}
                    className="flex justify-between gap-4"
                  >
                    <span>
                      {item.name}
                      {item.code ? ` (${item.code})` : ""}
                    </span>
                    <span>{item.usageCount} usos</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <section>
        <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
          Atalhos
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-yora-charcoal/10 bg-yora-cream px-5 py-4 text-sm transition-colors hover:border-yora-charcoal/30"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-yora-charcoal/10 bg-yora-cream p-5">
      <p className="text-xs tracking-widest text-yora-muted uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-yora-charcoal">{value}</p>
    </div>
  );
}
