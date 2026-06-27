"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthCard";
import { fetchAccountOverview, updateAccountProfile } from "@/lib/api/me";
import type { UserProfile } from "@/types";

export default function AccountProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccountOverview()
      .then((data) => {
        setProfile(data.profile);
        setName(data.profile.name);
        setPhone(data.profile.phone ?? "");
        setAvatarUrl(data.profile.avatarUrl ?? "");
        setBirthDate(data.profile.birthDate ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateAccountProfile({
        name,
        phone: phone || undefined,
        avatarUrl: avatarUrl || undefined,
        birthDate: birthDate || undefined,
      });
      setProfile(updated);
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
        Atualize suas informações pessoais.
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
          <label className={authLabelClassName}>E-mail</label>
          <input
            className={`${authInputClassName} bg-yora-sand/50`}
            value={profile?.email ?? ""}
            disabled
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
