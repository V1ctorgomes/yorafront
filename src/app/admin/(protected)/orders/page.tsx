"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { OrdersKanbanBoard } from "@/components/admin/orders/OrdersKanbanBoard";
import { OrdersListTable } from "@/components/admin/orders/OrdersListTable";
import {
  OrdersViewToggle,
  type OrdersViewMode,
} from "@/components/admin/orders/OrdersViewToggle";
import {
  fetchAdminOrders,
  fetchAdminOrdersDashboard,
  updateAdminOrderStatus,
} from "@/lib/api/admin";
import {
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_LABELS,
  SHIPPING_METHOD_OPTIONS,
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

const KANBAN_LIMIT = 100;
const VIEW_MODE_STORAGE_KEY = "yora-admin-orders-view";

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

function readStoredViewMode(): OrdersViewMode {
  if (typeof window === "undefined") return "list";

  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return stored === "kanban" ? "kanban" : "list";
}

export default function AdminOrdersPage() {
  const [viewMode, setViewMode] = useState<OrdersViewMode>("list");
  const [filters, setFilters] = useState<AdminOrdersQuery>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<AdminOrdersQuery>(initialFilters);
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [dashboard, setDashboard] = useState<AdminOrdersDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    setViewMode(readStoredViewMode());
  }, []);

  function handleViewModeChange(mode: OrdersViewMode) {
    setViewMode(mode);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    setAppliedFilters((current) => ({ ...current, page: 1 }));
  }

  const loadData = useCallback(
    async (query: AdminOrdersQuery, mode: OrdersViewMode) => {
      setLoading(true);
      setActionError(null);

      const listQuery: AdminOrdersQuery = {
        ...query,
        page: mode === "kanban" ? 1 : query.page,
        limit: mode === "kanban" ? KANBAN_LIMIT : query.limit,
        status: mode === "kanban" ? undefined : query.status,
      };

      try {
        const [dashboardData, ordersData] = await Promise.all([
          fetchAdminOrdersDashboard(),
          fetchAdminOrders(listQuery),
        ]);
        setDashboard(dashboardData);
        setOrders(ordersData.data);
        setMeta(ordersData.meta);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadData(appliedFilters, viewMode);
  }, [appliedFilters, viewMode, loadData]);

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

  async function handleOrderMove(orderId: string, newStatus: OrderStatusValue) {
    setUpdatingOrderId(orderId);
    setActionError(null);

    try {
      await updateAdminOrderStatus(orderId, newStatus);
      await loadData(appliedFilters, viewMode);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o status do pedido.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">Pedidos</h1>
          <p className="mt-1 text-sm text-yora-muted">
            Acompanhe e gerencie o ciclo de vida das compras.
          </p>
        </div>
        <OrdersViewToggle value={viewMode} onChange={handleViewModeChange} />
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
        {viewMode === "list" && (
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
        )}
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

      {viewMode === "kanban" && (
        <p className="mb-4 text-sm text-yora-muted">
          Arraste os cards entre as colunas para atualizar o status. Exibindo até{" "}
          {KANBAN_LIMIT} pedidos mais recentes.
        </p>
      )}

      {actionError && (
        <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/20 bg-yora-cream p-10 text-center">
          <p className="text-sm text-yora-muted">
            Nenhum pedido encontrado com os filtros atuais.
          </p>
        </div>
      ) : viewMode === "kanban" ? (
        <>
          <OrdersKanbanBoard
            orders={orders}
            updatingOrderId={updatingOrderId}
            onOrderMove={handleOrderMove}
          />
          {meta.total > KANBAN_LIMIT && (
            <p className="mt-4 text-sm text-yora-muted">
              Mostrando {orders.length} de {meta.total} pedidos. Use a
              visualização em lista para ver todos com paginação.
            </p>
          )}
        </>
      ) : (
        <>
          <OrdersListTable orders={orders} />

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
