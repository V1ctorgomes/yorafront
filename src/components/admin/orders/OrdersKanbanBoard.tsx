"use client";

import { useMemo, useState } from "react";
import {
  canTransitionOrderStatus,
  getOrderStatusLabel,
  KANBAN_COLUMNS,
  KANBAN_COLUMN_STYLES,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { AdminOrderListItem, OrderStatusValue } from "@/types";
import { OrderKanbanCard } from "./OrdersListTable";

interface OrdersKanbanBoardProps {
  orders: AdminOrderListItem[];
  updatingOrderId: string | null;
  onOrderMove: (orderId: string, newStatus: OrderStatusValue) => Promise<void>;
}

export function OrdersKanbanBoard({
  orders,
  updatingOrderId,
  onOrderMove,
}: OrdersKanbanBoardProps) {
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dropTargetStatus, setDropTargetStatus] =
    useState<OrderStatusValue | null>(null);

  const draggedOrder = useMemo(
    () => orders.find((order) => order.id === draggedOrderId) ?? null,
    [orders, draggedOrderId],
  );

  const ordersByStatus = useMemo(() => {
    const grouped = Object.fromEntries(
      KANBAN_COLUMNS.map((status) => [status, [] as AdminOrderListItem[]]),
    ) as Record<OrderStatusValue, AdminOrderListItem[]>;

    for (const order of orders) {
      const status = order.status as OrderStatusValue;

      if (grouped[status]) {
        grouped[status].push(order);
      } else if (status === "PENDING") {
        grouped.WAITING_PAYMENT.push(order);
      }
    }

    return grouped;
  }, [orders]);

  function isValidDropTarget(status: OrderStatusValue) {
    if (!draggedOrder) return false;
    return canTransitionOrderStatus(draggedOrder.status, status);
  }

  async function handleDrop(status: OrderStatusValue) {
    if (!draggedOrder || !isValidDropTarget(status)) {
      setDropTargetStatus(null);
      setDraggedOrderId(null);
      return;
    }

    await onOrderMove(draggedOrder.id, status);
    setDropTargetStatus(null);
    setDraggedOrderId(null);
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-4">
        {KANBAN_COLUMNS.map((status) => {
          const columnOrders = ordersByStatus[status] ?? [];
          const isTarget = dropTargetStatus === status;
          const canDrop = isValidDropTarget(status);

          return (
            <section
              key={status}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-sm border",
                KANBAN_COLUMN_STYLES[status],
                isTarget && canDrop && "ring-2 ring-yora-charcoal/30",
                isTarget && !canDrop && Boolean(draggedOrderId) && "ring-2 ring-red-300",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                setDropTargetStatus(status);
              }}
              onDragLeave={() => {
                setDropTargetStatus((current) =>
                  current === status ? null : current,
                );
              }}
              onDrop={(event) => {
                event.preventDefault();
                void handleDrop(status);
              }}
            >
              <header className="border-b border-inherit px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-medium tracking-wide text-yora-charcoal uppercase">
                    {getOrderStatusLabel(status)}
                  </h2>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-yora-muted">
                    {columnOrders.length}
                  </span>
                </div>
              </header>

              <div className="flex max-h-[calc(100vh-22rem)] flex-col gap-3 overflow-y-auto p-3">
                {columnOrders.length === 0 ? (
                  <p className="py-6 text-center text-xs text-yora-muted">
                    Nenhum pedido
                  </p>
                ) : (
                  columnOrders.map((order) => (
                    <OrderKanbanCard
                      key={order.id}
                      order={order}
                      isDragging={draggedOrderId === order.id}
                      isUpdating={updatingOrderId === order.id}
                      onDragStart={setDraggedOrderId}
                      onDragEnd={() => {
                        setDraggedOrderId(null);
                        setDropTargetStatus(null);
                      }}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
