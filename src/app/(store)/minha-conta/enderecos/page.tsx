"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthCard";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  updateCustomerAddress,
} from "@/lib/api/me";
import type { CustomerAddress, CustomerAddressPayload } from "@/types";

const emptyForm: CustomerAddressPayload = {
  recipient: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  country: "BR",
  reference: "",
  isPrimary: false,
};

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [form, setForm] = useState<CustomerAddressPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadAddresses() {
    setLoading(true);
    try {
      const data = await fetchCustomerAddresses();
      setAddresses(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function startEdit(address: CustomerAddress) {
    setEditingId(address.id);
    setForm({
      recipient: address.recipient,
      zipCode: address.zipCode,
      street: address.street,
      number: address.number,
      complement: address.complement ?? "",
      district: address.district,
      city: address.city,
      state: address.state,
      country: address.country,
      reference: address.reference ?? "",
      isPrimary: address.isPrimary,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await updateCustomerAddress(editingId, form);
      } else {
        await createCustomerAddress(form);
      }
      resetForm();
      await loadAddresses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar o endereço.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deseja remover este endereço?")) return;
    await deleteCustomerAddress(id);
    if (editingId === id) resetForm();
    await loadAddresses();
  }

  async function handleSetPrimary(id: string) {
    await updateCustomerAddress(id, { isPrimary: true });
    await loadAddresses();
  }

  if (loading) {
    return <p className="text-sm text-yora-muted">Carregando endereços...</p>;
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-yora-charcoal">Endereços</h2>
      <p className="mt-2 text-sm text-yora-muted">
        Cadastre e gerencie seus endereços de entrega.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream p-8 text-center text-sm text-yora-muted">
              Nenhum endereço cadastrado.
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="border border-yora-charcoal/10 bg-yora-cream p-5 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {address.isPrimary && (
                      <span className="mb-2 inline-block text-xs tracking-widest text-yora-taupe uppercase">
                        Principal
                      </span>
                    )}
                    <p className="font-medium">{address.recipient}</p>
                    <p>
                      {address.street}, {address.number}
                      {address.complement ? ` - ${address.complement}` : ""}
                    </p>
                    <p className="text-yora-muted">
                      {address.district}, {address.city} - {address.state}
                    </p>
                    <p className="text-yora-muted">
                      CEP {address.zipCode} · {address.country}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!address.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(address.id)}
                        className="text-yora-charcoal hover:text-yora-taupe"
                      >
                        Tornar principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(address)}
                      className="text-yora-charcoal hover:text-yora-taupe"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="h-fit border border-yora-charcoal/10 bg-yora-cream p-5"
        >
          <h3 className="text-sm font-medium text-yora-charcoal">
            {editingId ? "Editar endereço" : "Novo endereço"}
          </h3>
          <div className="mt-4 space-y-3">
            <Field label="Destinatário" value={form.recipient} onChange={(v) => setForm({ ...form, recipient: v })} />
            <Field label="CEP" value={form.zipCode} onChange={(v) => setForm({ ...form, zipCode: v })} />
            <Field label="Rua" value={form.street} onChange={(v) => setForm({ ...form, street: v })} />
            <Field label="Número" value={form.number} onChange={(v) => setForm({ ...form, number: v })} />
            <Field label="Complemento" value={form.complement ?? ""} onChange={(v) => setForm({ ...form, complement: v })} />
            <Field label="Bairro" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
            <Field label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="Estado" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
            <Field label="País" value={form.country ?? "BR"} onChange={(v) => setForm({ ...form, country: v })} />
            <Field label="Referência" value={form.reference ?? ""} onChange={(v) => setForm({ ...form, reference: v })} optional />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.isPrimary)}
                onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
              />
              Definir como endereço principal
            </label>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Salvando..." : editingId ? "Salvar" : "Adicionar"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <div>
      <label className={authLabelClassName}>{label}</label>
      <input
        className={authInputClassName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={!optional && label !== "Complemento"}
      />
    </div>
  );
}
