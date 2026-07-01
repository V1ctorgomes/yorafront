"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  exportAdminCrmCustomers,
  fetchAdminCrmCustomers,
} from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils";
import type {
  AdminCrmCustomerListItem,
  AdminCrmCustomersQuery,
  CrmCustomerSegment,
} from "@/types";

const inputClassName =
  "w-full border border-yora-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-yora-charcoal";

const SEGMENT_LABELS: Record<CrmCustomerSegment, string> = {
  new: "Novo",
  recurring: "Recorrente",
  vip: "VIP",
  inactive: "Inativo",
};

const initialFilters: AdminCrmCustomersQuery = {
  search: "",
  segment: undefined,
  hasOrders: undefined,
  state: "",
  city: "",
  sort: "newest",
  page: 1,
  limit: 20,
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminCrmPage() {
  const [filters, setFilters] = useState<AdminCrmCustomersQuery>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<AdminCrmCustomersQuery>(initialFilters);
  const [customers, setCustomers] = useState<AdminCrmCustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const loadData = useCallback(async (query: AdminCrmCustomersQuery) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminCrmCustomers(query);
      setCustomers(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar clientes.",
      );
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

  async function handleExport(format: "csv" | "xlsx") {
    setExporting(format);
    setError(null);

    try {
      await exportAdminCrmCustomers(appliedFilters, format);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível exportar.",
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">CRM</h1>
          <p className="mt-1 text-sm text-yora-muted">
            Clientes, histórico de compras e segmentação.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exporting !== null}
            onClick={() => handleExport("csv")}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting === "csv" ? "Exportando..." : "CSV"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exporting !== null}
            onClick={() => handleExport("xlsx")}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting === "xlsx" ? "Exportando..." : "XLSX"}
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="mb-6 grid gap-3 border border-yora-charcoal/10 bg-yora-cream p-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <input
          className={inputClassName}
          placeholder="Nome, CPF, e-mail, telefone ou pedido"
          value={filters.search ?? ""}
          onChange={(event) =>
            setFilters((current) => ({ ...current, search: event.target.value }))
          }
        />
        <select
          className={inputClassName}
          value={filters.segment ?? ""}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              segment: (event.target.value || undefined) as
                | CrmCustomerSegment
                | undefined,
            }))
          }
        >
          <option value="">Todos os segmentos</option>
          <option value="new">Novo</option>
          <option value="recurring">Recorrente</option>
          <option value="vip">VIP</option>
          <option value="inactive">Inativo</option>
        </select>
        <select
          className={inputClassName}
          value={
            filters.hasOrders === undefined
              ? ""
              : filters.hasOrders
                ? "with"
                : "without"
          }
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              hasOrders:
                event.target.value === ""
                  ? undefined
                  : event.target.value === "with",
            }))
          }
        >
          <option value="">Com ou sem pedidos</option>
          <option value="with">Com pedidos</option>
          <option value="without">Sem pedidos</option>
        </select>
        <select
          className={inputClassName}
          value={filters.sort ?? "newest"}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              sort: event.target.value as AdminCrmCustomersQuery["sort"],
            }))
          }
        >
          <option value="newest">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
          <option value="highest_spent">Maior gasto</option>
          <option value="lowest_spent">Menor gasto</option>
          <option value="most_orders">Mais pedidos</option>
        </select>
        <input
          className={inputClassName}
          placeholder="Estado (UF)"
          value={filters.state ?? ""}
          onChange={(event) =>
            setFilters((current) => ({ ...current, state: event.target.value }))
          }
        />
        <input
          className={inputClassName}
          placeholder="Cidade"
          value={filters.city ?? ""}
          onChange={(event) =>
            setFilters((current) => ({ ...current, city: event.target.value }))
          }
        />
        <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-2">
          <Button type="submit" size="sm">
            Filtrar
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClearFilters}>
            Limpar
          </Button>
        </div>
      </form>

      {error && (
        <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando clientes...</p>
      ) : (
        <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">CPF</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Local</th>
                <th className="px-4 py-3 font-medium">Total gasto</th>
                <th className="px-4 py-3 font-medium">Pedidos</th>
                <th className="px-4 py-3 font-medium">Última compra</th>
                <th className="px-4 py-3 font-medium">Segmento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-yora-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-yora-charcoal">
                      {customer.name}
                    </div>
                    {customer.isGuest && (
                      <span className="text-xs text-yora-muted">Convidado</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-yora-muted">
                    {customer.cpf ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div>{customer.email}</div>
                    <div className="text-yora-muted">{customer.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-yora-muted">
                    {customer.city && customer.state
                      ? `${customer.city}/${customer.state}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{formatPrice(customer.totalSpent)}</td>
                  <td className="px-4 py-3">{customer.orderCount}</td>
                  <td className="px-4 py-3 text-yora-muted">
                    {formatDate(customer.lastPurchaseAt)}
                  </td>
                  <td className="px-4 py-3">
                    {SEGMENT_LABELS[customer.segment]}
                  </td>
                  <td className="px-4 py-3">{customer.status}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/crm/customers/${customer.id}`}
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
      )}

      {!loading && customers.length === 0 && (
        <p className="mt-4 text-sm text-yora-muted">
          Nenhum cliente encontrado com os filtros atuais.
        </p>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-yora-muted">
            Página {meta.page} de {meta.totalPages} · {meta.total} clientes
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() =>
                setAppliedFilters((current) => ({
                  ...current,
                  page: Math.max(1, (current.page ?? 1) - 1),
                }))
              }
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() =>
                setAppliedFilters((current) => ({
                  ...current,
                  page: (current.page ?? 1) + 1,
                }))
              }
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
