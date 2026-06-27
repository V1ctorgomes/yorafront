"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { authInputClassName } from "@/components/auth/AuthCard";
import { fetchCustomerOrders } from "@/lib/api/me";
import { getOrderStatusColor, getOrderStatusLabel } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import type { CustomerOrderListItem } from "@/types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrderListItem[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  async function loadOrders(page = 1, nextSearch = appliedSearch, nextSort = sort) {
    setLoading(true);
    try {
      const response = await fetchCustomerOrders({
        search: nextSearch || undefined,
        sort: nextSort,
        page,
      });
      setOrders(response.data);
      setMeta(response.meta);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [appliedSearch, sort]);

  function handleFilterSubmit(event: FormEvent) {
    event.preventDefault();
    setAppliedSearch(search);
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-yora-charcoal">Pedidos</h2>
      <p className="mt-2 text-sm text-yora-muted">
        Acompanhe o status e o histórico das suas compras.
      </p>

      <form
        onSubmit={handleFilterSubmit}
        className="mt-6 flex flex-wrap gap-3 border border-yora-charcoal/10 bg-yora-cream p-4"
      >
        <input
          className={`${authInputClassName} min-w-[220px] flex-1`}
          placeholder="Buscar por número do pedido"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={authInputClassName}
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
        >
          <option value="newest">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
        </select>
        <Button type="submit" size="sm">
          Buscar
        </Button>
      </form>

      {loading ? (
        <p className="mt-6 text-sm text-yora-muted">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 border border-dashed border-yora-charcoal/15 bg-yora-cream p-8 text-center text-sm text-yora-muted">
          Nenhum pedido encontrado.
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Número</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Itens</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderNumber} className="border-b border-yora-charcoal/5 last:border-0">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-yora-muted">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className={`px-4 py-3 ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </td>
                    <td className="px-4 py-3">{order.itemCount}</td>
                    <td className="px-4 py-3">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/minha-conta/pedidos/${encodeURIComponent(order.orderNumber)}`}
                        className="text-yora-charcoal hover:text-yora-taupe"
                      >
                        Ver detalhes
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
                onClick={() => loadOrders(meta.page - 1)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => loadOrders(meta.page + 1)}
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
