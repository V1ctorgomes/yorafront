"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  fetchAdminShippingProviders,
  syncAdminShippingCarriers,
  updateAdminShippingCarrier,
  updateAdminShippingService,
} from "@/lib/api/admin";
import type { ShippingCarrierConfig, ShippingServiceConfig } from "@/types";

function formatSyncedAt(value: string | null) {
  if (!value) {
    return "Nunca sincronizado";
  }

  return new Date(value).toLocaleString("pt-BR");
}

export default function AdminShippingPage() {
  const [carriers, setCarriers] = useState<ShippingCarrierConfig[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminShippingProviders();
      setCarriers(data.carriers);
      setLastSyncedAt(data.lastSyncedAt);
      setIsConnected(data.melhorEnvio.isConnected);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as transportadoras.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  async function handleSync() {
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await syncAdminShippingCarriers();
      setCarriers(data.carriers);
      setLastSyncedAt(data.lastSyncedAt);
      setIsConnected(data.melhorEnvio.isConnected);
      setSuccess("Transportadoras sincronizadas com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível sincronizar.",
      );
    } finally {
      setSyncing(false);
    }
  }

  async function handleCarrierToggle(carrier: ShippingCarrierConfig) {
    setSavingId(carrier.id);
    setError(null);

    try {
      const updated = await updateAdminShippingCarrier(carrier.id, {
        isActive: !carrier.isActive,
      });
      setCarriers((current) =>
        current.map((item) =>
          item.id === updated.id ? { ...updated, services: item.services } : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a transportadora.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleServiceToggle(service: ShippingServiceConfig) {
    setSavingId(service.id);
    setError(null);

    try {
      const updated = await updateAdminShippingService(service.id, {
        isActive: !service.isActive,
      });
      setCarriers((current) =>
        current.map((carrier) =>
          carrier.id === updated.carrierId
            ? {
                ...carrier,
                services: carrier.services.map((item) =>
                  item.id === updated.id ? updated : item,
                ),
              }
            : carrier,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o serviço.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleServiceOrderChange(
    service: ShippingServiceConfig,
    displayOrder: number,
  ) {
    setSavingId(service.id);
    setError(null);

    try {
      const updated = await updateAdminShippingService(service.id, {
        displayOrder,
      });
      setCarriers((current) =>
        current.map((carrier) =>
          carrier.id === updated.carrierId
            ? {
                ...carrier,
                services: carrier.services
                  .map((item) => (item.id === updated.id ? updated : item))
                  .sort((a, b) => a.displayOrder - b.displayOrder),
              }
            : carrier,
        ),
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

  async function handleServiceMessageChange(
    service: ShippingServiceConfig,
    customMessage: string,
  ) {
    setSavingId(service.id);
    setError(null);

    try {
      const updated = await updateAdminShippingService(service.id, {
        customMessage: customMessage.trim() || null,
      });
      setCarriers((current) =>
        current.map((carrier) =>
          carrier.id === updated.carrierId
            ? {
                ...carrier,
                services: carrier.services.map((item) =>
                  item.id === updated.id ? updated : item,
                ),
              }
            : carrier,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a mensagem.",
      );
    } finally {
      setSavingId(null);
    }
  }

  const rows = carriers.flatMap((carrier) =>
    carrier.services.map((service) => ({ carrier, service })),
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">
            Transportadoras
          </h1>
          <p className="mt-1 text-sm text-yora-muted">
            Gerencie transportadoras e serviços sincronizados do Melhor Envio.
          </p>
          <p className="mt-2 text-xs text-yora-muted">
            Última sincronização: {formatSyncedAt(lastSyncedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSync}
            disabled={syncing || !isConnected}
          >
            {syncing ? "Sincronizando..." : "Sincronizar transportadoras"}
          </Button>
          <Link
            href="/admin/shipping/melhor-envio"
            className="border border-yora-charcoal/15 bg-yora-cream px-4 py-2 text-sm text-yora-charcoal hover:border-yora-charcoal/30"
          >
            Configurar Melhor Envio
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      )}

      {!isConnected && !loading && (
        <p className="mb-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Conecte a conta do Melhor Envio antes de sincronizar transportadoras.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-yora-muted">
          Nenhuma transportadora sincronizada. Conecte o Melhor Envio e clique em
          sincronizar.
        </p>
      ) : (
        <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
              <tr>
                <th className="px-4 py-3 font-medium">Transportadora</th>
                <th className="px-4 py-3 font-medium">Serviço</th>
                <th className="px-4 py-3 font-medium">Ativo</th>
                <th className="px-4 py-3 font-medium">Ordem</th>
                <th className="px-4 py-3 font-medium">Mensagem</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ carrier, service }) => (
                <tr
                  key={service.id}
                  className="border-b border-yora-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{carrier.name}</span>
                      {!carrier.isActive && (
                        <span className="text-xs text-yora-muted">(inativa)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{service.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        service.isActive && carrier.isActive
                          ? "text-green-700"
                          : "text-yora-muted"
                      }
                    >
                      {service.isActive && carrier.isActive ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      className="w-20 border border-yora-charcoal/15 bg-white px-2 py-1"
                      value={service.displayOrder}
                      disabled={savingId === service.id}
                      onChange={(event) =>
                        handleServiceOrderChange(
                          service,
                          Number(event.target.value),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      className="min-w-[180px] border border-yora-charcoal/15 bg-white px-2 py-1"
                      defaultValue={service.customMessage ?? ""}
                      placeholder="Opcional"
                      disabled={savingId === service.id}
                      onBlur={(event) => {
                        const nextValue = event.target.value;
                        if (nextValue !== (service.customMessage ?? "")) {
                          handleServiceMessageChange(service, nextValue);
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="text-sm text-yora-charcoal underline-offset-2 hover:underline disabled:opacity-50"
                        disabled={savingId === service.id}
                        onClick={() => handleServiceToggle(service)}
                      >
                        {service.isActive ? "Desativar serviço" : "Ativar serviço"}
                      </button>
                      <button
                        type="button"
                        className="text-sm text-yora-muted underline-offset-2 hover:underline disabled:opacity-50"
                        disabled={savingId === carrier.id}
                        onClick={() => handleCarrierToggle(carrier)}
                      >
                        {carrier.isActive
                          ? "Desativar transportadora"
                          : "Ativar transportadora"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
