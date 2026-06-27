"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  fetchAdminOrders,
  fetchAdminOrdersDashboard,
} from "@/lib/api/admin";
import {
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_LABELS,
  SHIPPING_METHOD_OPTIONS,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import type {
  AdminOrderListItem,
  AdminOrdersDashboard,
  AdminOrdersQuery,
  OrderStatusValue,
} from "@/types";

const inputClassName =
  "w-full border border-yora-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-yora-charcoal";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const initialFilters: AdminOrdersQuery = {
  search: "",
  status: undefined,
  dateFrom: "",
  dateTo: "",
  minTotal: "",
  maxTotal: "",
  shippingMethod: undefined,
  sort: "newest",
  page: 1,
  limit: 20,
};

export default function AdminOrdersPage() {
  const [filters, setFilters] = useState<AdminOrdersQuery>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<AdminOrdersQuery>(initialFilters);
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [dashboard, setDashboard] = useState<AdminOrdersDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const loadData = useCallback(async (query: AdminOrdersQuery) => {
    setLoading(true);
    try {
      const [dashboardData, ordersData] = await Promise.all([
        fetchAdminOrdersDashboard(),
        fetchAdminOrders(query),
      ]);
      setDashboard(dashboardData);
      setOrders(ordersData.data);
      setMeta(ordersData.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(appliedFilters);
  }, [appliedFilters, loadData]);

  function handleFilterSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAppliedFilters({ ...filters, page: 1 });
  }

  function handleClearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }

  function handlePageChange(nextPage: number) {
    setAppliedFilters((current) => ({ ...current, page: nextPage }));
    setFilters((current) => ({ ...current, page: nextPage }));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-yora-charcoal">Pedidos</h1>
        <p className="mt-1 text-sm text-yora-muted">
          Acompanhe e gerencie o ciclo de vida das compras.
        </p>
      </div>

      {dashboard && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            label="Aguardando pagamento"
            value={dashboard.counts.waitingPayment}
          />
          <DashboardCard
            label="Em separação"
            value={dashboard.counts.processing}
          />
          <DashboardCard label="Enviados" value={dashboard.counts.shipped} />
          <DashboardCard label="Entregues" value={dashboard.counts.delivered} />
          <DashboardCard label="Cancelados" value={dashboard.counts.cancelled} />
          <DashboardCard
            label="Total de pedidos"
            value={dashboard.summary.totalOrders}
          />
          <DashboardCard
            label="Valor vendido"
            value={formatPrice(dashboard.summary.totalRevenue)}
          />
          <DashboardCard
            label="Ticket médio"
            value={formatPrice(dashboard.summary.averageTicket)}
          />
        </div>
      )}

      <form
        onSubmit={handleFilterSubmit}
        className="mb-6 grid gap-4 border border-yora-charcoal/10 bg-yora-cream p-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <div className="xl:col-span-2">
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Buscar
          </label>
          <input
            className={inputClassName}
            placeholder="Nº pedido, nome ou e-mail"
            value={filters.search ?? ""}
            onChange={(e) =>
              setFilters((current) => ({ ...current, search: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Status
          </label>
          <select
            className={inputClassName}
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                status: (e.target.value || undefined) as OrderStatusValue,
              }))
            }
          >
            <option value="">Todos</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Entrega
          </label>
          <select
            className={inputClassName}
            value={filters.shippingMethod ?? ""}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                shippingMethod: (e.target.value || undefined) as
                  | "pac"
                  | "sedex"
                  | "pickup"
                  | undefined,
              }))
            }
          >
            <option value="">Todas</option>
            {SHIPPING_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Data inicial
          </label>
          <input
            type="date"
            className={inputClassName}
            value={filters.dateFrom ?? ""}
            onChange={(e) =>
              setFilters((current) => ({ ...current, dateFrom: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Data final
          </label>
          <input
            type="date"
            className={inputClassName}
            value={filters.dateTo ?? ""}
            onChange={(e) =>
              setFilters((current) => ({ ...current, dateTo: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Valor mínimo
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClassName}
            value={filters.minTotal ?? ""}
            onChange={(e) =>
              setFilters((current) => ({ ...current, minTotal: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Valor máximo
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClassName}
            value={filters.maxTotal ?? ""}
            onChange={(e) =>
              setFilters((current) => ({ ...current, maxTotal: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Ordenação
          </label>
          <select
            className={inputClassName}
            value={filters.sort ?? "newest"}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                sort: e.target.value as AdminOrdersQuery["sort"],
              }))
            }
          >
            {ORDER_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 xl:col-span-4">
          <Button type="submit" size="sm">
            Aplicar filtros
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
          >
            Limpar
          </Button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/20 bg-yora-cream p-10 text-center">
          <p className="text-sm text-yora-muted">
            Nenhum pedido encontrado com os filtros atuais.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Nº Pedido</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Itens</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-yora-charcoal/5 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p>{order.customerName}</p>
                      <p className="text-yora-muted">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-yora-muted">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getOrderStatusColor(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.itemCount}</td>
                    <td className="px-4 py-3">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-yora-charcoal hover:text-yora-taupe"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 text-sm">
            <p className="text-yora-muted">
              Página {meta.page} de {meta.totalPages} — {meta.total} pedidos
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => handlePageChange(meta.page - 1)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-yora-charcoal/10 bg-yora-cream p-4">
      <p className="text-xs tracking-widest text-yora-muted uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-yora-charcoal">{value}</p>
    </div>
  );
}
