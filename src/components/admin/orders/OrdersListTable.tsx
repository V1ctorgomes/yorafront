import Link from "next/link";
import { Eye } from "lucide-react";
import { getOrderStatusColor, getOrderStatusLabel } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
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
