"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { fetchAdminPayments } from "@/lib/api/admin";
import {
  getPaymentMethodLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from "@/lib/payment-status";
import { formatPrice } from "@/lib/utils";
import type { AdminPaymentsQuery, Payment, PaymentStatusValue } from "@/types";

const inputClassName =
  "w-full border border-yora-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-yora-charcoal";

const STATUS_OPTIONS: Array<{ value: PaymentStatusValue | ""; label: string }> =
  [
    { value: "", label: "Todos os status" },
    { value: "PENDING", label: "Aguardando" },
    { value: "APPROVED", label: "Aprovado" },
    { value: "REJECTED", label: "Recusado" },
    { value: "CANCELLED", label: "Cancelado" },
    { value: "REFUNDED", label: "Reembolsado" },
  ];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const initialFilters: AdminPaymentsQuery = {
  search: "",
  status: undefined,
  page: 1,
  limit: 20,
};

export default function AdminPaymentsPage() {
  const [filters, setFilters] = useState<AdminPaymentsQuery>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<AdminPaymentsQuery>(initialFilters);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const loadData = useCallback(async (query: AdminPaymentsQuery) => {
    setLoading(true);
    try {
      const response = await fetchAdminPayments(query);
      setPayments(response.data);
      setMeta(response.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(appliedFilters);
  }, [appliedFilters, loadData]);

  function handleFilterSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAppliedFilters({ ...filters, page: 1 });
  }

  function handleClearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }

  function handlePageChange(nextPage: number) {
    setAppliedFilters((current) => ({ ...current, page: nextPage }));
    setFilters((current) => ({ ...current, page: nextPage }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-yora-charcoal">Pagamentos</h1>
        <p className="mt-2 text-sm text-yora-muted">
          Histórico de transações processadas via Mercado Pago.
        </p>
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="grid gap-4 border border-yora-charcoal/10 bg-white p-4 md:grid-cols-4"
      >
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Busca
          </label>
          <input
            className={inputClassName}
            placeholder="Pedido, e-mail ou ID Mercado Pago"
            value={filters.search ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Status
          </label>
          <select
            className={inputClassName}
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: (event.target.value || undefined) as
                  | PaymentStatusValue
                  | undefined,
              }))
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="bg-yora-charcoal px-4 py-2 text-sm text-yora-cream"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="border border-yora-charcoal/15 px-4 py-2 text-sm"
          >
            Limpar
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border border-yora-charcoal/10 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-yora-charcoal/10 bg-yora-sand/40 text-left text-xs tracking-widest text-yora-muted uppercase">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">ID Mercado Pago</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-yora-muted">
                  Carregando pagamentos...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-yora-muted">
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-yora-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{payment.orderNumber}</td>
                  <td className="px-4 py-3">{formatPrice(payment.amount)}</td>
                  <td className="px-4 py-3">
                    {getPaymentMethodLabel(payment.paymentMethod)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs ${getPaymentStatusColor(payment.status)}`}
                    >
                      {getPaymentStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-yora-muted">
                    {payment.providerPaymentId ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-yora-muted">
                    {formatDateTime(payment.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="inline-flex items-center gap-1 text-yora-muted hover:text-yora-charcoal"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-yora-muted">
            Página {meta.page} de {meta.totalPages} ({meta.total} pagamentos)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => handlePageChange(meta.page - 1)}
              className="border border-yora-charcoal/15 px-3 py-1 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => handlePageChange(meta.page + 1)}
              className="border border-yora-charcoal/15 px-3 py-1 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
