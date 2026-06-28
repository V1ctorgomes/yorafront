"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  countActiveOrderFilters,
  OrdersFiltersModal,
} from "@/components/admin/orders/OrdersFiltersModal";
import { OrdersKanbanBoard } from "@/components/admin/orders/OrdersKanbanBoard";
import { OrdersListTable } from "@/components/admin/orders/OrdersListTable";
import {
  OrdersViewToggle,
  type OrdersViewMode,
} from "@/components/admin/orders/OrdersViewToggle";
import { useAdminOrdersSync } from "@/hooks/use-admin-orders-sync";
import {
  fetchAdminOrders,
  fetchAdminOrdersDashboard,
  updateAdminOrderStatus,
} from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils";
import type {
  AdminOrderListItem,
  AdminOrdersDashboard,
  AdminOrdersQuery,
  OrderStatusValue,
} from "@/types";

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

function formatSyncTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
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
  const [isDraggingKanban, setIsDraggingKanban] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const appliedFiltersRef = useRef(appliedFilters);
  const viewModeRef = useRef(viewMode);
  appliedFiltersRef.current = appliedFilters;
  viewModeRef.current = viewMode;

  useEffect(() => {
    setViewMode(readStoredViewMode());
  }, []);

  function handleViewModeChange(mode: OrdersViewMode) {
    setViewMode(mode);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    setAppliedFilters((current) => ({ ...current, page: 1 }));
  }

  const loadData = useCallback(
    async (
      query: AdminOrdersQuery,
      mode: OrdersViewMode,
      options?: { silent?: boolean },
    ) => {
      if (!options?.silent) {
        setLoading(true);
      }
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
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const silentSync = useCallback(async () => {
    await loadData(appliedFiltersRef.current, viewModeRef.current, {
      silent: true,
    });
  }, [loadData]);

  const { lastSyncedAt, syncing } = useAdminOrdersSync({
    onSync: silentSync,
    isPaused: () => Boolean(updatingOrderId) || isDraggingKanban,
  });

  useEffect(() => {
    loadData(appliedFilters, viewMode);
  }, [appliedFilters, viewMode, loadData]);

  function handleFilterSubmit() {
    setAppliedFilters({ ...filters, page: 1 });
    setFiltersModalOpen(false);
  }

  function handleClearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setFiltersModalOpen(false);
  }

  function openFiltersModal() {
    setFilters(appliedFilters);
    setFiltersModalOpen(true);
  }

  const activeFilterCount = countActiveOrderFilters(appliedFilters, viewMode);

  function handlePageChange(nextPage: number) {
    setAppliedFilters((current) => ({ ...current, page: nextPage }));
    setFilters((current) => ({ ...current, page: nextPage }));
  }

  async function handleOrderMove(orderId: string, newStatus: OrderStatusValue) {
    const previousOrders = orders;
    setUpdatingOrderId(orderId);
    setActionError(null);

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );

    try {
      await updateAdminOrderStatus(orderId, newStatus);
      await loadData(appliedFilters, viewMode, { silent: true });
    } catch (err) {
      setOrders(previousOrders);
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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-yora-charcoal">Pedidos</h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-yora-charcoal/10 bg-yora-cream px-3 py-1 text-xs text-yora-muted">
              <span
                className={`h-2 w-2 rounded-full ${
                  syncing ? "animate-pulse bg-amber-500" : "bg-green-500"
                }`}
              />
              {syncing
                ? "Atualizando..."
                : lastSyncedAt
                  ? `Ao vivo · ${formatSyncTime(lastSyncedAt)}`
                  : "Ao vivo"}
            </span>
          </div>
          <p className="mt-1 text-sm text-yora-muted">
            Acompanhe e gerencie o ciclo de vida das compras em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFiltersModal}
            className="inline-flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-yora-charcoal px-2 py-0.5 text-xs text-yora-cream">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <OrdersViewToggle value={viewMode} onChange={handleViewModeChange} />
        </div>
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

      <OrdersFiltersModal
        open={filtersModalOpen}
        viewMode={viewMode}
        filters={filters}
        onClose={() => setFiltersModalOpen(false)}
        onChange={setFilters}
        onApply={handleFilterSubmit}
        onClear={handleClearFilters}
      />

      {viewMode === "kanban" && (
        <p className="mb-4 text-sm text-yora-muted">
          Arraste os cards entre colunas para alterar o status no servidor. Clique
          em um card para abrir o pedido.
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
            onDraggingChange={setIsDraggingKanban}
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
