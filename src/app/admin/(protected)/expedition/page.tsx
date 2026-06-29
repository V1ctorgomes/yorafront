"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  cancelShippingLabel,
  fetchExpeditionHistory,
  fetchExpeditionOrders,
  printShippingLabel,
  purchaseShippingLabel,
  syncExpeditionTracking,
} from "@/lib/api/logistics";
import { formatPrice } from "@/lib/utils";
import type { ExpeditionOrder, ShippingEvent } from "@/types/logistics";
import { LOGISTIC_STATUS_LABELS, type LogisticStatus } from "@/types/logistics";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminExpeditionPage() {
  const [orders, setOrders] = useState<ExpeditionOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyOrderId, setHistoryOrderId] = useState<string | null>(null);
  const [history, setHistory] = useState<ShippingEvent[]>([]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchExpeditionOrders({ search: search || undefined });
      setOrders(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar a expedição.",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function runAction(orderId: string, action: () => Promise<unknown>) {
    setActionId(orderId);
    setError(null);

    try {
      await action();
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na operação.");
    } finally {
      setActionId(null);
    }
  }

  async function openHistory(orderId: string) {
    setHistoryOrderId(orderId);
    const events = await fetchExpeditionHistory(orderId);
    setHistory(events);
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">Expedição</h1>
          <p className="mt-1 text-sm text-yora-muted">
            Compre, imprima e acompanhe etiquetas de envio.
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar pedido, cliente ou rastreio"
          className="border border-yora-charcoal/15 bg-white px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/20 bg-yora-cream p-10 text-center text-sm text-yora-muted">
          Nenhum pedido disponível para expedição.
        </div>
      ) : (
        <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Transportadora</th>
                <th className="px-4 py-3 font-medium">Status logístico</th>
                <th className="px-4 py-3 font-medium">Rastreio</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-yora-charcoal/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium hover:text-yora-taupe"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3 text-yora-muted">
                    {order.shippingProvider ?? "—"}
                    {order.shippingService ? ` / ${order.shippingService}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {order.logisticStatus
                      ? LOGISTIC_STATUS_LABELS[order.logisticStatus as LogisticStatus]
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{order.trackingCode ?? "—"}</td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {!order.shippingLabelId ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={actionId === order.id}
                          onClick={() =>
                            runAction(order.id, () => purchaseShippingLabel(order.id))
                          }
                        >
                          Comprar etiqueta
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={actionId === order.id}
                            onClick={() =>
                              runAction(order.id, async () => {
                                const result = await printShippingLabel(order.id);
                                window.open(result.url, "_blank");
                              })
                            }
                          >
                            Imprimir
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={actionId === order.id}
                            onClick={() =>
                              runAction(order.id, () => cancelShippingLabel(order.id))
                            }
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={actionId === order.id}
                        onClick={() =>
                          runAction(order.id, () => syncExpeditionTracking(order.id))
                        }
                      >
                        Atualizar rastreio
                      </Button>
                      <button
                        type="button"
                        className="text-sm underline"
                        onClick={() => openHistory(order.id)}
                      >
                        Histórico
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {historyOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-yora-charcoal/40 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto border border-yora-charcoal/10 bg-yora-cream p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">Histórico logístico</h2>
              <button type="button" onClick={() => setHistoryOrderId(null)}>
                Fechar
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-yora-muted">Nenhum evento registrado.</p>
            ) : (
              <ul className="space-y-4">
                {history.map((event) => (
                  <li key={`${event.eventDate}-${event.description}`} className="border-l-2 border-yora-taupe pl-4">
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-yora-muted">
                      {formatDateTime(event.eventDate)}
                      {event.location ? ` — ${event.location}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
