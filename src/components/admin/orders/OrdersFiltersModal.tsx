"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_LABELS,
  SHIPPING_METHOD_OPTIONS,
} from "@/lib/order-status";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMounted } from "@/lib/use-mounted";
import type { AdminOrdersQuery, OrderStatusValue } from "@/types";
import type { OrdersViewMode } from "./OrdersViewToggle";

const inputClassName =
  "w-full border border-yora-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-yora-charcoal";

interface OrdersFiltersModalProps {
  open: boolean;
  viewMode: OrdersViewMode;
  filters: AdminOrdersQuery;
  onClose: () => void;
  onChange: (filters: AdminOrdersQuery) => void;
  onApply: () => void;
  onClear: () => void;
}

export function OrdersFiltersModal({
  open,
  viewMode,
  filters,
  onClose,
  onChange,
  onApply,
  onClear,
}: OrdersFiltersModalProps) {
  const mounted = useMounted();
  useBodyScrollLock(open);

  if (!open || !mounted) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onApply();
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[200] bg-yora-charcoal/50"
        onClick={onClose}
        aria-hidden={false}
      />

      <div
        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="orders-filters-title"
      >
        <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-yora-charcoal/10 bg-yora-cream p-6 shadow-2xl md:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-yora-muted hover:text-yora-charcoal"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          <h2
            id="orders-filters-title"
            className="font-display text-2xl text-yora-charcoal"
          >
            Filtrar pedidos
          </h2>
          <p className="mt-2 text-sm text-yora-muted">
            Refine a busca por status, período, valor e entrega.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
                Buscar
              </label>
              <input
                className={inputClassName}
                placeholder="Nº pedido, nome ou e-mail"
                value={filters.search ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, search: e.target.value })
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
                    onChange({
                      ...filters,
                      status: (e.target.value || undefined) as OrderStatusValue,
                    })
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
                  onChange({
                    ...filters,
                    shippingMethod: (e.target.value || undefined) as
                      | "pac"
                      | "sedex"
                      | "pickup"
                      | undefined,
                  })
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
                  onChange({ ...filters, dateFrom: e.target.value })
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
                  onChange({ ...filters, dateTo: e.target.value })
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
                  onChange({ ...filters, minTotal: e.target.value })
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
                  onChange({ ...filters, maxTotal: e.target.value })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
                Ordenação
              </label>
              <select
                className={inputClassName}
                value={filters.sort ?? "newest"}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    sort: e.target.value as AdminOrdersQuery["sort"],
                  })
                }
              >
                {ORDER_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit" size="sm">
                Aplicar filtros
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onClear}>
                Limpar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body,
  );
}

export function countActiveOrderFilters(
  filters: AdminOrdersQuery,
  viewMode: OrdersViewMode,
): number {
  let count = 0;

  if (filters.search?.trim()) count += 1;
  if (viewMode === "list" && filters.status) count += 1;
  if (filters.shippingMethod) count += 1;
  if (filters.dateFrom) count += 1;
  if (filters.dateTo) count += 1;
  if (filters.minTotal) count += 1;
  if (filters.maxTotal) count += 1;
  if (filters.sort && filters.sort !== "newest") count += 1;

  return count;
}
