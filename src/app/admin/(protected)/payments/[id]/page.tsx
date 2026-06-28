"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAdminPayment } from "@/lib/api/admin";
import {
  getPaymentMethodLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from "@/lib/payment-status";
import { formatPrice } from "@/lib/utils";
import type { Payment } from "@/types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export default function AdminPaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const paymentId = params.id;
  const [payment, setPayment] = useState<
    (Payment & { rawResponse?: unknown }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    fetchAdminPayment(paymentId)
      .then(setPayment)
      .catch(() => setError("Pagamento não encontrado."))
      .finally(() => setLoading(false));
  }, [paymentId]);

  if (loading) {
    return <p className="text-sm text-yora-muted">Carregando pagamento...</p>;
  }

  if (error || !payment) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-700">{error}</p>
        <Link href="/admin/payments" className="text-sm text-yora-muted">
          Voltar para pagamentos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/payments"
          className="text-sm text-yora-muted hover:text-yora-charcoal"
        >
          ← Voltar para pagamentos
        </Link>
        <h1 className="mt-4 font-display text-3xl text-yora-charcoal">
          Pagamento {payment.id.slice(0, 8)}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-yora-charcoal/10 bg-white p-5 text-sm">
          <h2 className="text-xs tracking-widest text-yora-muted uppercase">
            Resumo
          </h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Pedido</dt>
              <dd className="font-medium">{payment.orderNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Valor</dt>
              <dd>{formatPrice(payment.amount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Método</dt>
              <dd>{getPaymentMethodLabel(payment.paymentMethod)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Status</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full border px-2 py-1 text-xs ${getPaymentStatusColor(payment.status)}`}
                >
                  {getPaymentStatusLabel(payment.status)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">ID Mercado Pago</dt>
              <dd>{payment.providerPaymentId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Criado em</dt>
              <dd>{formatDateTime(payment.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-yora-muted">Atualizado em</dt>
              <dd>{formatDateTime(payment.updatedAt)}</dd>
            </div>
          </dl>
        </div>

        {payment.pix && (
          <div className="border border-yora-charcoal/10 bg-white p-5 text-sm">
            <h2 className="text-xs tracking-widest text-yora-muted uppercase">
              Dados PIX
            </h2>
            <p className="mt-4 break-all text-xs text-yora-muted">
              {payment.pix.copyPaste}
            </p>
            {payment.pix.expiresAt && (
              <p className="mt-3 text-yora-muted">
                Expira em {formatDateTime(payment.pix.expiresAt)}
              </p>
            )}
          </div>
        )}
      </div>

      {payment.rawResponse !== undefined && (
        <div className="border border-yora-charcoal/10 bg-white p-5">
          <h2 className="text-xs tracking-widest text-yora-muted uppercase">
            Resposta do gateway
          </h2>
          <pre className="mt-4 overflow-x-auto rounded bg-yora-sand/40 p-4 text-xs">
            {JSON.stringify(payment.rawResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
