"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchAdminOrder, updateAdminOrderStatus, updateAdminOrderTracking } from "@/lib/api/admin";
import {
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import type { AdminOrderDetail, AdminOrderStatus } from "@/types";

const inputClassName =
  "border border-yora-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-yora-charcoal";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AdminOrderStatus | "">("");
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOrder() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrder(params.id);
      setOrder(data);
      setTrackingCode(data.trackingCode ?? "");
      setSelectedStatus("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar o pedido.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  async function handleStatusUpdate() {
    if (!order || !selectedStatus) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await updateAdminOrderStatus(order.id, selectedStatus);
      setOrder(updated);
      setSelectedStatus("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível atualizar o status.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleTrackingUpdate() {
    if (!order) return;

    setSavingTracking(true);
    setError(null);

    try {
      const updated = await updateAdminOrderTracking(
        order.id,
        trackingCode.trim() || null,
      );
      setOrder(updated);
      setTrackingCode(updated.trackingCode ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o rastreio.",
      );
    } finally {
      setSavingTracking(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-yora-muted">Carregando pedido...</p>;
  }

  if (!order) {
    return (
      <div className="border border-dashed border-yora-charcoal/20 bg-yora-cream p-10 text-center">
        <p className="text-sm text-yora-muted">{error ?? "Pedido não encontrado."}</p>
        <Button href="/admin/orders" className="mt-4" size="sm">
          Voltar para pedidos
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-yora-muted hover:text-yora-charcoal"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para pedidos
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-yora-muted">
            Criado em {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-widest text-yora-muted uppercase">
            Status atual
          </p>
          <p className={`mt-1 text-lg ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
            <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
              Informações gerais
            </h2>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <InfoItem label="Número" value={order.orderNumber} />
              <InfoItem
                label="Data"
                value={formatDateTime(order.createdAt)}
              />
              <InfoItem label="Cliente" value={order.customer.name} />
              <InfoItem label="E-mail" value={order.customer.email} />
              <InfoItem label="Telefone" value={order.customer.phone} />
              <InfoItem label="Entrega" value={order.shippingLabel} />
            </div>
          </section>

          <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
            <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
              Informações de entrega
            </h2>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <InfoItem
                label="Transportadora"
                value={order.shippingProvider ?? "—"}
              />
              <InfoItem label="Serviço" value={order.shippingService ?? "—"} />
              <InfoItem
                label="Valor do frete"
                value={
                  order.shippingPrice === 0
                    ? "Grátis"
                    : formatPrice(order.shippingPrice)
                }
              />
              <InfoItem
                label="Prazo estimado"
                value={
                  order.shippingDeadlineDays
                    ? `${order.shippingDeadlineDays} dia${
                        order.shippingDeadlineDays > 1 ? "s" : ""
                      } útei${order.shippingDeadlineDays > 1 ? "s" : "l"}`
                    : "—"
                }
              />
            </div>
            <div className="mt-5 space-y-3">
              <label className="block text-xs tracking-widest text-yora-muted uppercase">
                Código de rastreio
              </label>
              <input
                className={`${inputClassName} w-full`}
                value={trackingCode}
                onChange={(event) => setTrackingCode(event.target.value)}
                placeholder="Ex: BR123456789BR"
              />
              <Button
                type="button"
                size="sm"
                disabled={savingTracking}
                onClick={handleTrackingUpdate}
              >
                {savingTracking ? "Salvando..." : "Salvar rastreio"}
              </Button>
            </div>
          </section>

          <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
            <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
              Produtos
            </h2>
            <div className="mt-4 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-yora-charcoal/5 pb-4 last:border-0 last:pb-0"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-yora-sand">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-yora-muted">
                        Sem foto
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-yora-muted">SKU: {item.sku}</p>
                    <p className="text-yora-muted">
                      {item.color ?? "—"} / {item.size ?? "—"}
                    </p>
                    <p className="text-yora-muted">
                      {item.quantity}x {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {order.address && (
            <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
              <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
                Endereço
              </h2>
              <div className="mt-4 space-y-1 text-sm">
                <p>{order.address.recipient}</p>
                <p>
                  {order.address.street}, {order.address.number}
                  {order.address.complement
                    ? ` - ${order.address.complement}`
                    : ""}
                </p>
                <p className="text-yora-muted">
                  {order.address.district}, {order.address.city} -{" "}
                  {order.address.state}
                </p>
                <p className="text-yora-muted">
                  CEP {order.address.zipCode} — {order.address.country}
                </p>
              </div>
            </section>
          )}

          <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
            <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
              Histórico de alterações
            </h2>
            {order.statusHistory.length === 0 ? (
              <p className="mt-4 text-sm text-yora-muted">
                Nenhuma alteração de status registrada ainda.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {order.statusHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="border-l-2 border-yora-charcoal/10 pl-4 text-sm"
                  >
                    <p className="text-yora-muted">{formatTime(entry.createdAt)}</p>
                    <p className="mt-1">
                      {entry.previousStatus
                        ? getOrderStatusLabel(entry.previousStatus)
                        : "—"}
                    </p>
                    <p className="text-yora-muted">↓</p>
                    <p className={getOrderStatusColor(entry.newStatus)}>
                      {getOrderStatusLabel(entry.newStatus)}
                    </p>
                    <p className="mt-1 text-yora-muted">
                      por {entry.adminEmail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
            <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
              Resumo financeiro
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Subtotal" value={formatPrice(order.subtotal)} />
              <SummaryRow
                label="Frete"
                value={
                  order.shippingPrice === 0
                    ? "Grátis"
                    : formatPrice(order.shippingPrice)
                }
              />
              <SummaryRow
                label="Desconto"
                value={formatPrice(order.discount)}
              />
              <SummaryRow
                label="Total"
                value={formatPrice(order.total)}
                strong
              />
            </div>
          </section>

          <section className="border border-yora-charcoal/10 bg-yora-cream p-5">
            <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
              Atualizar status
            </h2>
            {order.allowedStatuses.length === 0 ? (
              <p className="mt-4 text-sm text-yora-muted">
                Este pedido não permite novas alterações de status.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <select
                  className={`${inputClassName} w-full`}
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as AdminOrderStatus)
                  }
                >
                  <option value="">Selecione o novo status</option>
                  {order.allowedStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getOrderStatusLabel(status)}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  className="w-full"
                  size="sm"
                  disabled={!selectedStatus || saving}
                  onClick={handleStatusUpdate}
                >
                  {saving ? "Salvando..." : "Atualizar status"}
                </Button>
              </div>
            )}
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs tracking-widest text-yora-muted uppercase">
        {label}
      </p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${strong ? "border-t border-yora-charcoal/10 pt-3 font-medium" : ""}`}
    >
      <span className="text-yora-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
