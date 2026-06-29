"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchAdminShippingMethods,
  updateAdminShippingMethod,
} from "@/lib/api/admin";
import type { AdminShippingMethod } from "@/types";

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<AdminShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadMethods() {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminShippingMethods();
      setMethods(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as transportadoras.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMethods();
  }, []);

  async function handleToggleActive(method: AdminShippingMethod) {
    setSavingId(method.id);
    setError(null);

    try {
      const updated = await updateAdminShippingMethod(method.id, {
        isActive: !method.isActive,
      });
      setMethods((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o método.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDisplayOrderChange(
    method: AdminShippingMethod,
    displayOrder: number,
  ) {
    setSavingId(method.id);
    setError(null);

    try {
      const updated = await updateAdminShippingMethod(method.id, {
        displayOrder,
      });
      setMethods((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.displayOrder - b.displayOrder),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a ordem.",
      );
    } finally {
      setSavingId(null);
    }
  }

  const providers = Array.from(new Set(methods.map((method) => method.provider)));

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">
            Transportadoras
          </h1>
          <p className="mt-1 text-sm text-yora-muted">
            Gerencie os métodos de entrega disponíveis no checkout.
          </p>
        </div>
        <Link
          href="/admin/shipping/melhor-envio"
          className="border border-yora-charcoal/15 bg-yora-cream px-4 py-2 text-sm text-yora-charcoal hover:border-yora-charcoal/30"
        >
          Configurar Melhor Envio
        </Link>
      </div>

      {error && (
        <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando...</p>
      ) : (
        <div className="space-y-8">
          {providers.map((provider) => (
            <section
              key={provider}
              className="border border-yora-charcoal/10 bg-yora-cream"
            >
              <div className="border-b border-yora-charcoal/10 bg-yora-sand/50 px-4 py-3">
                <h2 className="text-sm font-medium text-yora-charcoal">
                  {provider}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-yora-charcoal/10">
                    <tr>
                      <th className="px-4 py-3 font-medium">Serviço</th>
                      <th className="px-4 py-3 font-medium">Código</th>
                      <th className="px-4 py-3 font-medium">Ordem</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {methods
                      .filter((method) => method.provider === provider)
                      .map((method) => (
                        <tr
                          key={method.id}
                          className="border-b border-yora-charcoal/5 last:border-0"
                        >
                          <td className="px-4 py-3">{method.name}</td>
                          <td className="px-4 py-3 text-yora-muted">
                            {method.serviceCode}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              className="w-20 border border-yora-charcoal/15 bg-white px-2 py-1"
                              value={method.displayOrder}
                              disabled={savingId === method.id}
                              onChange={(event) =>
                                handleDisplayOrderChange(
                                  method,
                                  Number(event.target.value),
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                method.isActive
                                  ? "text-green-700"
                                  : "text-yora-muted"
                              }
                            >
                              {method.isActive ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              className="text-sm text-yora-charcoal underline-offset-2 hover:underline disabled:opacity-50"
                              disabled={savingId === method.id}
                              onClick={() => handleToggleActive(method)}
                            >
                              {method.isActive ? "Desativar" : "Ativar"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
