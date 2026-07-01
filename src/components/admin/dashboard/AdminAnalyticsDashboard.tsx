"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { fetchAnalyticsDashboard } from "@/lib/api/analytics";
import { getOrderStatusLabel } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import type {
  AnalyticsDashboard,
  AnalyticsPeriodPreset,
} from "@/types/analytics";
import { ANALYTICS_PERIOD_OPTIONS } from "@/types/analytics";

const PIE_COLORS = [
  "#1A1A1A",
  "#C8B6A2",
  "#CFA88A",
  "#8C8C8C",
  "#D4A5A5",
  "#2D5016",
  "#1E3A5F",
];

function formatChartDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function AdminAnalyticsDashboard() {
  const [period, setPeriod] = useState<AnalyticsPeriodPreset>("30d");
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await fetchAnalyticsDashboard({ period });
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar o dashboard.",
      );
      setDashboard(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">Dashboard</h1>
          <p className="mt-1 text-sm text-yora-muted">
            Indicadores comerciais, financeiros e operacionais da loja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value as AnalyticsPeriodPreset)
            }
            className="border border-yora-charcoal/20 bg-yora-cream px-3 py-2 text-sm"
          >
            {ANALYTICS_PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 border border-yora-charcoal/20 bg-yora-cream px-3 py-2 text-sm text-yora-charcoal hover:border-yora-charcoal/40 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-yora-muted">Carregando indicadores...</p>
      )}

      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {dashboard && (
        <div className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Receita total (loja)"
              value={formatPrice(dashboard.kpis.totalRevenue)}
              hint="Produtos vendidos, sem frete"
            />
            <MetricCard
              label="Receita do período (loja)"
              value={formatPrice(dashboard.kpis.periodRevenue)}
              hint="Produtos − descontos, sem frete"
            />
            <MetricCard
              label="Receita bruta (produtos)"
              value={formatPrice(dashboard.kpis.grossRevenue)}
              hint="Antes de cupons no período"
            />
            <MetricCard
              label="Total cobrado"
              value={formatPrice(dashboard.kpis.collectedRevenue)}
              hint="Inclui frete repassado à transportadora"
            />
            <MetricCard
              label="Ticket médio (loja)"
              value={formatPrice(dashboard.kpis.averageTicket)}
            />
            <MetricCard
              label="Ticket médio cobrado"
              value={formatPrice(dashboard.kpis.averageCollectedTicket)}
            />
            <MetricCard
              label="Total de pedidos"
              value={dashboard.kpis.totalOrders}
            />
            <MetricCard
              label="Pedidos no período"
              value={dashboard.kpis.periodOrders}
            />
            <MetricCard
              label="Novos clientes"
              value={dashboard.kpis.newCustomers}
            />
            <MetricCard
              label="Produtos vendidos"
              value={dashboard.kpis.productsSold}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Receita">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dashboard.revenueSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => formatPrice(value)}
                    labelFormatter={formatChartDate}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="gross"
                    name="Bruta (produtos)"
                    stroke="#C8B6A2"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    name="Líquida (loja)"
                    stroke="#1A1A1A"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="collected"
                    name="Total cobrado"
                    stroke="#8C8C8C"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Pedidos por dia">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dashboard.ordersSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={formatChartDate} />
                  <Bar dataKey="count" name="Pedidos" fill="#1A1A1A" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Participação por categoria">
              {dashboard.categories.length === 0 ? (
                <EmptyState message="Sem vendas por categoria no período." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={dashboard.categories}
                      dataKey="revenue"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ categoryName, percentage }) =>
                        `${categoryName} (${formatPercent(percentage)})`
                      }
                    >
                      {dashboard.categories.map((entry, index) => (
                        <Cell
                          key={entry.categoryId}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Métodos de pagamento">
              {dashboard.paymentMethods.length === 0 ? (
                <EmptyState message="Sem pagamentos aprovados no período." />
              ) : (
                <BreakdownList items={dashboard.paymentMethods} />
              )}
            </ChartCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Métodos de entrega">
              {dashboard.shippingMethods.length === 0 ? (
                <EmptyState message="Sem entregas no período." />
              ) : (
                <BreakdownList items={dashboard.shippingMethods} />
              )}
            </ChartCard>

            <ChartCard title="Ranking de coleções">
              {dashboard.collections.length === 0 ? (
                <EmptyState message="Sem vendas por coleção no período." />
              ) : (
                <ul className="space-y-3 text-sm">
                  {dashboard.collections.map((item) => (
                    <li
                      key={item.collectionId}
                      className="flex items-center justify-between gap-4 border-b border-yora-charcoal/5 pb-3 last:border-0"
                    >
                      <span>{item.collectionName}</span>
                      <span className="text-yora-muted">
                        {formatPrice(item.revenue)} · {item.orderCount} itens
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </ChartCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Produtos mais vendidos">
              {dashboard.topProducts.length === 0 ? (
                <EmptyState message="Sem produtos vendidos no período." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-yora-charcoal/10 text-yora-muted">
                        <th className="py-2 font-medium">Produto</th>
                        <th className="py-2 font-medium">Qtd</th>
                        <th className="py-2 font-medium">Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.topProducts.map((product) => (
                        <tr
                          key={product.productId}
                          className="border-b border-yora-charcoal/5 last:border-0"
                        >
                          <td className="py-3">{product.productName}</td>
                          <td className="py-3">{product.quantity}</td>
                          <td className="py-3">{formatPrice(product.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Estoque baixo">
              {dashboard.lowStock.length === 0 ? (
                <EmptyState message="Nenhum produto com estoque baixo." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-yora-charcoal/10 text-yora-muted">
                        <th className="py-2 font-medium">Produto</th>
                        <th className="py-2 font-medium">Variante</th>
                        <th className="py-2 font-medium">Qtd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.lowStock.map((item) => (
                        <tr
                          key={`${item.sku}-${item.color}-${item.size}`}
                          className="border-b border-yora-charcoal/5 last:border-0"
                        >
                          <td className="py-3">{item.productName}</td>
                          <td className="py-3 text-yora-muted">
                            {item.color} / {item.size}
                          </td>
                          <td className="py-3">{item.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <ChartCard title="Últimos pedidos">
              {dashboard.recentOrders.length === 0 ? (
                <EmptyState message="Nenhum pedido registrado." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-yora-charcoal/10 text-yora-muted">
                        <th className="py-2 font-medium">Pedido</th>
                        <th className="py-2 font-medium">Cliente</th>
                        <th className="py-2 font-medium">Valor</th>
                        <th className="py-2 font-medium">Status</th>
                        <th className="py-2 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentOrders.map((order) => (
                        <tr
                          key={order.orderNumber}
                          className="border-b border-yora-charcoal/5 last:border-0"
                        >
                          <td className="py-3">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="hover:text-yora-taupe"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="py-3">{order.customerName}</td>
                          <td className="py-3">{formatPrice(order.total)}</td>
                          <td className="py-3">
                            {getOrderStatusLabel(order.status)}
                          </td>
                          <td className="py-3 text-yora-muted">
                            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Promoções">
              <div className="space-y-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniStat
                    label="Descontos concedidos"
                    value={formatPrice(dashboard.promotions.totalDiscountGranted)}
                  />
                  <MiniStat
                    label="Pedidos com promoção"
                    value={dashboard.promotions.ordersWithPromotion}
                  />
                </div>
                {dashboard.promotions.topPromotions.length > 0 && (
                  <ul className="space-y-2 text-yora-muted">
                    {dashboard.promotions.topPromotions.map((item) => (
                      <li
                        key={item.promotionId}
                        className="flex justify-between gap-3"
                      >
                        <span>
                          {item.name}
                          {item.code ? ` (${item.code})` : ""}
                        </span>
                        <span>{item.usageCount} usos</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </ChartCard>
          </section>

          <section>
            <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
              Atalhos
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Pedidos", href: "/admin/orders" },
                { label: "Promoções", href: "/admin/promotions" },
                { label: "Produtos", href: "/admin/products" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-yora-charcoal/10 bg-yora-cream px-5 py-4 text-sm transition-colors hover:border-yora-charcoal/30"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-yora-charcoal/10 bg-yora-cream p-5">
      <p className="text-xs tracking-widest text-yora-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-2xl text-yora-charcoal">{value}</p>
      {hint && <p className="mt-1 text-xs text-yora-muted">{hint}</p>}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-yora-charcoal/10 bg-yora-cream p-5">
      <h2 className="mb-4 text-sm font-medium text-yora-charcoal">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-10 text-center text-sm text-yora-muted">{message}</p>
  );
}

function BreakdownList({
  items,
}: {
  items: Array<{ method: string; count: number; percentage: number }>;
}) {
  return (
    <ul className="space-y-3 text-sm">
      {items.map((item) => (
        <li
          key={item.method}
          className="flex items-center justify-between gap-4 border-b border-yora-charcoal/5 pb-3 last:border-0"
        >
          <span>{item.method}</span>
          <span className="text-yora-muted">
            {item.count} · {formatPercent(item.percentage)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-yora-charcoal/10 bg-yora-sand/40 p-3">
      <p className="text-xs text-yora-muted">{label}</p>
      <p className="mt-1 font-medium text-yora-charcoal">{value}</p>
    </div>
  );
}
