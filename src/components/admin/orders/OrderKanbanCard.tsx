"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { cn, formatPrice } from "@/lib/utils";
import type { AdminOrderListItem } from "@/types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

interface OrderKanbanCardProps {
  order: AdminOrderListItem;
  isDragging?: boolean;
  isUpdating?: boolean;
  onDragStart: (orderId: string) => void;
  onDragEnd: () => void;
}

export function OrderKanbanCard({
  order,
  isDragging,
  isUpdating,
  onDragStart,
  onDragEnd,
}: OrderKanbanCardProps) {
  const router = useRouter();
  const didDragRef = useRef(false);

  function handleDragStart() {
    didDragRef.current = false;
    onDragStart(order.id);
  }

  function handleDrag() {
    didDragRef.current = true;
  }

  function handleDragEnd() {
    onDragEnd();
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  }

  function handleOpenOrder() {
    if (didDragRef.current || isUpdating) return;
    router.push(`/admin/orders/${order.id}`);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenOrder();
    }
  }

  return (
    <article
      draggable={!isUpdating}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleOpenOrder}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Abrir pedido ${order.orderNumber}`}
      className={cn(
        "cursor-grab border border-yora-charcoal/10 bg-white p-3 text-left shadow-sm transition-opacity active:cursor-grabbing hover:border-yora-charcoal/30",
        isDragging && "opacity-40",
        isUpdating && "cursor-wait opacity-60",
      )}
    >
      <p className="text-sm font-medium text-yora-charcoal">{order.orderNumber}</p>
      <p className="mt-2 truncate text-sm">{order.customerName}</p>
      <p className="truncate text-xs text-yora-muted">{order.customerEmail}</p>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-yora-muted">
        <span>
          {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
        </span>
        <span className="font-medium text-yora-charcoal">
          {formatPrice(order.total)}
        </span>
      </div>
      <p className="mt-2 text-xs text-yora-muted">
        {formatDateTime(order.createdAt)}
      </p>
      {isUpdating && (
        <p className="mt-2 text-xs text-yora-muted">Salvando no servidor...</p>
      )}
    </article>
  );
}
