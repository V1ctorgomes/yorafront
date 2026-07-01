"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAdminCrmCustomer } from "@/lib/api/admin";
import { getOrderStatusLabel } from "@/lib/order-status";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "@/lib/payment-status";
import { formatPrice } from "@/lib/utils";
import type { AdminCrmCustomerDetail, CrmCustomerSegment } from "@/types";

const SEGMENT_LABELS: Record<CrmCustomerSegment, string> = {
  new: "Novo",
  recurring: "Recorrente",
  vip: "VIP",
  inactive: "Inativo",
};

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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-yora-charcoal/10 bg-yora-cream p-4">
      <p className="text-xs tracking-widest text-yora-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-xl text-yora-charcoal">{value}</p>
    </div>
  );
}

export default function AdminCrmCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<AdminCrmCustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    fetchAdminCrmCustomer(params.id)
      .then(setCustomer)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Não foi possível carregar o cliente.",
        ),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-yora-muted">Carregando perfil...</p>;
  }

  if (error || !customer) {
    return (
      <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Cliente não encontrado."}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/crm"
          className="mb-3 inline-block text-sm text-yora-muted hover:text-yora-charcoal"
        >
          ← Voltar para CRM
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-yora-charcoal">
              {customer.profile.name}
            </h1>
            <p className="mt-1 text-sm text-yora-muted">
              {customer.profile.email} · {customer.profile.phone}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="border border-yora-charcoal/15 px-3 py-1">
              {SEGMENT_LABELS[customer.segment]}
            </span>
            <span className="border border-yora-charcoal/15 px-3 py-1">
              {customer.status}
            </span>
            {customer.profile.isGuest && (
              <span className="border border-yora-charcoal/15 px-3 py-1">
                Convidado
              </span>
            )}
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total gasto"
          value={formatPrice(customer.stats.totalSpent)}
        />
        <MetricCard
          label="Ticket médio"
          value={formatPrice(customer.stats.averageTicket)}
        />
        <MetricCard
          label="Pedidos pagos"
          value={String(customer.stats.totalOrders)}
        />
        <MetricCard
          label="Produtos comprados"
          value={String(customer.stats.productsPurchased)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="border border-yora-charcoal/10 bg-yora-cream p-5">
          <h2 className="mb-4 text-sm font-medium text-yora-charcoal">
            Dados cadastrais
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">CPF</dt>
              <dd>{customer.profile.cpf ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Nascimento</dt>
              <dd>{customer.profile.birthDate ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Cadastro</dt>
              <dd>{formatDateTime(customer.profile.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Último login</dt>
              <dd>{formatDateTime(customer.profile.lastLogin)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Primeiro pedido</dt>
              <dd>{formatDateTime(customer.stats.firstPurchaseAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Último pedido</dt>
              <dd>{formatDateTime(customer.stats.lastPurchaseAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Último envio</dt>
              <dd>{formatDateTime(customer.stats.lastShipmentAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="border border-yora-charcoal/10 bg-yora-cream p-5">
          <h2 className="mb-4 text-sm font-medium text-yora-charcoal">
            Preferências de compra
          </h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-yora-muted">Produto favorito</dt>
              <dd className="mt-1">
                {customer.stats.favoriteProduct
                  ? `${customer.stats.favoriteProduct.name} (${customer.stats.favoriteProduct.quantity})`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-yora-muted">Categoria favorita</dt>
              <dd className="mt-1">
                {customer.stats.favoriteCategory
                  ? `${customer.stats.favoriteCategory.name} (${customer.stats.favoriteCategory.quantity})`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-yora-muted">Categorias mais compradas</dt>
              <dd className="mt-1 text-yora-muted">
                {customer.stats.topCategories.length > 0
                  ? customer.stats.topCategories
                      .map((item) => `${item.name} (${item.quantity})`)
                      .join(" · ")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-yora-muted">Coleções mais compradas</dt>
              <dd className="mt-1 text-yora-muted">
                {customer.stats.topCollections.length > 0
                  ? customer.stats.topCollections
                      .map((item) => `${item.name} (${item.quantity})`)
                      .join(" · ")
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
        <h2 className="mb-4 text-sm font-medium text-yora-charcoal">Timeline</h2>
        <div className="space-y-4">
          {customer.timeline.map((event, index) => (
            <div
              key={`${event.type}-${event.date}-${index}`}
              className="border-l-2 border-yora-charcoal/15 pl-4"
            >
              <p className="text-sm font-medium text-yora-charcoal">
                {event.title}
              </p>
              <p className="text-sm text-yora-muted">{event.description}</p>
              <p className="mt-1 text-xs text-yora-muted">
                {formatDateTime(event.date)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
        <h2 className="mb-4 text-sm font-medium text-yora-charcoal">Pedidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10">
              <tr>
                <th className="px-3 py-2 font-medium">Número</th>
                <th className="px-3 py-2 font-medium">Data</th>
                <th className="px-3 py-2 font-medium">Valor</th>
                <th className="px-3 py-2 font-medium">Pagamento</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Transportadora</th>
                <th className="px-3 py-2 font-medium">Rastreio</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map((order) => (
                <tr key={order.id} className="border-b border-yora-charcoal/5">
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-yora-charcoal hover:text-yora-taupe"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-yora-muted">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-3 py-3">{formatPrice(order.total)}</td>
                  <td className="px-3 py-3 text-yora-muted">
                    {order.paymentMethod
                      ? getPaymentMethodLabel(order.paymentMethod)
                      : "—"}
                    {order.paymentStatus
                      ? ` · ${getPaymentStatusLabel(order.paymentStatus)}`
                      : ""}
                  </td>
                  <td className="px-3 py-3">
                    {getOrderStatusLabel(order.status)}
                  </td>
                  <td className="px-3 py-3 text-yora-muted">
                    {order.shippingService ?? order.shippingProvider ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-yora-muted">
                    {order.trackingCode ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
        <h2 className="mb-4 text-sm font-medium text-yora-charcoal">Endereços</h2>
        {customer.addresses.length === 0 ? (
          <p className="text-sm text-yora-muted">Nenhum endereço cadastrado.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {customer.addresses.map((address) => (
              <div
                key={address.id}
                className="border border-yora-charcoal/10 p-4 text-sm"
              >
                <p className="font-medium">{address.recipient}</p>
                <p className="mt-1 text-yora-muted">
                  {address.street}, {address.number}
                  {address.complement ? ` - ${address.complement}` : ""}
                </p>
                <p className="text-yora-muted">
                  {address.district} · {address.city}/{address.state}
                </p>
                <p className="text-yora-muted">CEP {address.zipCode}</p>
                {address.isPrimary && (
                  <p className="mt-2 text-xs text-green-700">Principal</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
