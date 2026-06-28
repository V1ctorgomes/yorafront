import Link from "next/link";
import { Eye } from "lucide-react";
import { getOrderStatusColor, getOrderStatusLabel } from "@/lib/order-status";
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

interface OrdersListTableProps {
  orders: AdminOrderListItem[];
}

export function OrdersListTable({ orders }: OrdersListTableProps) {
  return (
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
  );
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
  return (
    <article
      draggable={!isUpdating}
      onDragStart={() => onDragStart(order.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab border border-yora-charcoal/10 bg-white p-3 shadow-sm transition-opacity active:cursor-grabbing",
        isDragging && "opacity-40",
        isUpdating && "cursor-wait opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-yora-charcoal">
          {order.orderNumber}
        </p>
        <Link
          href={`/admin/orders/${order.id}`}
          className="shrink-0 text-yora-muted hover:text-yora-charcoal"
          onClick={(event) => event.stopPropagation()}
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-2 truncate text-sm">{order.customerName}</p>
      <p className="truncate text-xs text-yora-muted">{order.customerEmail}</p>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-yora-muted">
        <span>{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</span>
        <span className="font-medium text-yora-charcoal">
          {formatPrice(order.total)}
        </span>
      </div>
      <p className="mt-2 text-xs text-yora-muted">
        {formatDateTime(order.createdAt)}
      </p>
      {isUpdating && (
        <p className="mt-2 text-xs text-yora-muted">Atualizando...</p>
      )}
    </article>
  );
}
