"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthCard";
import {
  fetchAccountOverview,
  fetchCustomerProfile,
  updateAccountProfile,
  updateCustomerProfile,
} from "@/lib/api/me";
import { formatCpfInput } from "@/lib/cpf";
import type { CustomerProfile, UserProfile } from "@/types";

export default function AccountProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchAccountOverview(), fetchCustomerProfile()])
      .then(([overview, customerProfile]) => {
        setProfile(overview.profile);
        setCustomer(customerProfile);
        setName(overview.profile.name);
        setPhone(overview.profile.phone ?? customerProfile.phone ?? "");
        setEmail(customerProfile.email);
        setCpf(customerProfile.cpf ?? "");
        setAvatarUrl(overview.profile.avatarUrl ?? "");
        setBirthDate(
          overview.profile.birthDate ?? customerProfile.birthDate ?? "",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const [updatedProfile, updatedCustomer] = await Promise.all([
        updateAccountProfile({
          name,
          phone: phone || undefined,
          avatarUrl: avatarUrl || undefined,
          birthDate: birthDate || undefined,
        }),
        updateCustomerProfile({
          name,
          email,
          phone: phone || undefined,
          ...(customer?.cpfPending && cpf ? { cpf } : {}),
          birthDate: birthDate || undefined,
        }),
      ]);

      setProfile(updatedProfile);
      setCustomer(updatedCustomer);
      setMessage("Perfil atualizado com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-yora-muted">Carregando perfil...</p>;
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-yora-charcoal">Perfil</h2>
      <p className="mt-2 text-sm text-yora-muted">
        Atualize suas informações pessoais e comerciais.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-4">
        <div>
          <label className={authLabelClassName}>Nome</label>
          <input
            className={authInputClassName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={authLabelClassName}>CPF</label>
          <input
            className={`${authInputClassName} ${!customer?.cpfPending ? "bg-yora-sand/50" : ""}`}
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCpfInput(e.target.value))}
            disabled={!customer?.cpfPending}
            required={Boolean(customer?.cpfPending)}
          />
          {customer?.cpfPending && (
            <p className="mt-1 text-xs text-yora-muted">
              Informe seu CPF para concluir o cadastro comercial.
            </p>
          )}
        </div>
        <div>
          <label className={authLabelClassName}>E-mail</label>
          <input
            type="email"
            className={authInputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={authLabelClassName}>Telefone</label>
          <input
            className={authInputClassName}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className={authLabelClassName}>Foto (URL)</label>
          <input
            className={authInputClassName}
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className={authLabelClassName}>Data de nascimento</label>
          <input
            type="date"
            className={authInputClassName}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
}
