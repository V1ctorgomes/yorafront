"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createShippingPackage,
  createShippingSender,
  deleteShippingPackage,
  deleteShippingSender,
  fetchMelhorEnvioConfig,
  fetchMelhorEnvioOAuthUrl,
  fetchShippingPackages,
  fetchShippingSenders,
  updateMelhorEnvioConfig,
} from "@/lib/api/logistics";
import type {
  MelhorEnvioConfig,
  MelhorEnvioEnvironment,
  ShippingPackage,
  ShippingSender,
} from "@/types/logistics";

type Tab = "config" | "senders" | "packages";

const inputClassName =
  "w-full border border-yora-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-yora-charcoal";

export default function MelhorEnvioConfigPage() {
  const [tab, setTab] = useState<Tab>("config");
  const [config, setConfig] = useState<MelhorEnvioConfig | null>(null);
  const [senders, setSenders] = useState<ShippingSender[]>([]);
  const [packages, setPackages] = useState<ShippingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [environment, setEnvironment] = useState<MelhorEnvioEnvironment>("SANDBOX");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [configData, sendersData, packagesData] = await Promise.all([
        fetchMelhorEnvioConfig(),
        fetchShippingSenders(),
        fetchShippingPackages(),
      ]);
      setConfig(configData);
      setClientId(configData.clientId ?? "");
      setEnvironment(configData.environment);
      setSenders(sendersData);
      setPackages(packagesData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar a configuração.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (window.location.search.includes("connected=1")) {
      setSuccess("Melhor Envio conectado com sucesso.");
    }
  }, []);

  async function handleSaveConfig(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateMelhorEnvioConfig({
        clientId,
        clientSecret: clientSecret || undefined,
        environment,
      });
      setConfig(updated);
      setClientSecret("");
      setSuccess("Configuração salva.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar configuração.");
    }
  }

  async function handleConnect() {
    setError(null);

    try {
      const { url } = await fetchMelhorEnvioOAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar autenticação.");
    }
  }

  async function handleCreateSender(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const sender = await createShippingSender({
        name: String(form.get("name")),
        company: String(form.get("company") || "") || null,
        document: String(form.get("document")),
        phone: String(form.get("phone")),
        zipCode: String(form.get("zipCode")),
        address: String(form.get("address")),
        number: String(form.get("number")),
        complement: String(form.get("complement") || "") || null,
        district: String(form.get("district")),
        city: String(form.get("city")),
        state: String(form.get("state")),
        isDefault: form.get("isDefault") === "on",
        isActive: true,
      });
      setSenders((current) => [...current, sender]);
      event.currentTarget.reset();
      setSuccess("Remetente cadastrado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar remetente.");
    }
  }

  async function handleCreatePackage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const pkg = await createShippingPackage({
        name: String(form.get("name")),
        lengthCm: Number(form.get("lengthCm")),
        widthCm: Number(form.get("widthCm")),
        heightCm: Number(form.get("heightCm")),
        maxWeightKg: Number(form.get("maxWeightKg")),
        packageWeightKg: Number(form.get("packageWeightKg")),
        isActive: true,
      });
      setPackages((current) => [...current, pkg]);
      event.currentTarget.reset();
      setSuccess("Embalagem cadastrada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar embalagem.");
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/shipping"
            className="mb-2 inline-block text-sm text-yora-muted hover:text-yora-charcoal"
          >
            ← Transportadoras
          </Link>
          <h1 className="font-display text-3xl text-yora-charcoal">Melhor Envio</h1>
          <p className="mt-1 text-sm text-yora-muted">
            Configure credenciais, remetentes e embalagens padrão.
          </p>
        </div>
        {config && (
          <span
            className={
              config.isConnected
                ? "border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700"
                : "border border-yora-charcoal/15 bg-yora-cream px-3 py-1 text-sm text-yora-muted"
            }
          >
            {config.isConnected ? "Conectado" : "Não conectado"}
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {([
          ["config", "Configuração"],
          ["senders", "Remetentes"],
          ["packages", "Embalagens"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={
              tab === value
                ? "border border-yora-charcoal bg-yora-charcoal px-4 py-2 text-sm text-yora-cream"
                : "border border-yora-charcoal/15 bg-yora-cream px-4 py-2 text-sm text-yora-charcoal"
            }
          >
            {label}
          </button>
        ))}
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

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando...</p>
      ) : tab === "config" ? (
        <form
          onSubmit={handleSaveConfig}
          className="max-w-2xl space-y-4 border border-yora-charcoal/10 bg-yora-cream p-6"
        >
          <div>
            <label className="mb-1 block text-sm text-yora-muted">Client ID</label>
            <input
              className={inputClassName}
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-yora-muted">Client Secret</label>
            <input
              type="password"
              className={inputClassName}
              value={clientSecret}
              onChange={(event) => setClientSecret(event.target.value)}
              placeholder={config?.hasClientSecret ? "••••••••" : ""}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-yora-muted">Ambiente</label>
            <select
              className={inputClassName}
              value={environment}
              onChange={(event) =>
                setEnvironment(event.target.value as MelhorEnvioEnvironment)
              }
            >
              <option value="SANDBOX">Sandbox</option>
              <option value="PRODUCTION">Produção</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="sm">
              Salvar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleConnect}>
              Conectar com Melhor Envio
            </Button>
          </div>
        </form>
      ) : tab === "senders" ? (
        <div className="grid gap-8 xl:grid-cols-2">
          <form
            onSubmit={handleCreateSender}
            className="space-y-3 border border-yora-charcoal/10 bg-yora-cream p-6"
          >
            <h2 className="font-medium text-yora-charcoal">Novo remetente</h2>
            {[
              ["name", "Nome"],
              ["company", "Empresa"],
              ["document", "Documento"],
              ["phone", "Telefone"],
              ["zipCode", "CEP"],
              ["address", "Endereço"],
              ["number", "Número"],
              ["complement", "Complemento"],
              ["district", "Bairro"],
              ["city", "Cidade"],
              ["state", "Estado"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="mb-1 block text-sm text-yora-muted">{label}</label>
                <input name={name} className={inputClassName} required={name !== "company" && name !== "complement"} />
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isDefault" />
              Remetente padrão
            </label>
            <Button type="submit" size="sm">
              Cadastrar remetente
            </Button>
          </form>

          <div className="space-y-4">
            {senders.map((sender) => (
              <div
                key={sender.id}
                className="border border-yora-charcoal/10 bg-yora-cream p-4 text-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{sender.name}</p>
                    <p className="text-yora-muted">
                      {sender.address}, {sender.number} — {sender.city}/{sender.state}
                    </p>
                    {sender.isDefault && (
                      <p className="mt-1 text-xs text-green-700">Padrão</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-yora-muted hover:text-red-700"
                    onClick={async () => {
                      await deleteShippingSender(sender.id);
                      setSenders((current) =>
                        current.filter((item) => item.id !== sender.id),
                      );
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-2">
          <form
            onSubmit={handleCreatePackage}
            className="space-y-3 border border-yora-charcoal/10 bg-yora-cream p-6"
          >
            <h2 className="font-medium text-yora-charcoal">Nova embalagem</h2>
            {[
              ["name", "Nome"],
              ["lengthCm", "Comprimento (cm)"],
              ["widthCm", "Largura (cm)"],
              ["heightCm", "Altura (cm)"],
              ["maxWeightKg", "Peso máximo (kg)"],
              ["packageWeightKg", "Peso da embalagem (kg)"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="mb-1 block text-sm text-yora-muted">{label}</label>
                <input
                  name={name}
                  type={name === "name" ? "text" : "number"}
                  step="0.01"
                  className={inputClassName}
                  required
                />
              </div>
            ))}
            <Button type="submit" size="sm">
              Cadastrar embalagem
            </Button>
          </form>

          <div className="space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="border border-yora-charcoal/10 bg-yora-cream p-4 text-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-yora-muted">
                      {Number(pkg.lengthCm)} x {Number(pkg.widthCm)} x{" "}
                      {Number(pkg.heightCm)} cm — até {Number(pkg.maxWeightKg)} kg
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-yora-muted hover:text-red-700"
                    onClick={async () => {
                      await deleteShippingPackage(pkg.id);
                      setPackages((current) =>
                        current.filter((item) => item.id !== pkg.id),
                      );
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
