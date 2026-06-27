"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthCard";
import { changeAccountPassword, fetchAccountOverview } from "@/lib/api/me";

export default function AccountSecurityPage() {
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccountOverview()
      .then((data) => setLastLogin(data.profile.lastLogin))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await changeAccountPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setMessage(response.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível alterar a senha.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-yora-muted">Carregando...</p>;
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-yora-charcoal">Segurança</h2>
      <p className="mt-2 text-sm text-yora-muted">
        Proteja sua conta e acompanhe o último acesso.
      </p>

      <section className="mt-8 border border-yora-charcoal/10 bg-yora-cream p-5 text-sm">
        <p className="text-xs tracking-[0.35em] text-yora-muted uppercase">
          Último login
        </p>
        <p className="mt-2">
          {lastLogin
            ? new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(lastLogin))
            : "—"}
        </p>
        <p className="mt-4 text-yora-muted">
          Encerrar sessões futuras: em breve você poderá revogar todos os
          dispositivos conectados.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-4">
        <h3 className="text-sm font-medium text-yora-charcoal">
          Alterar senha
        </h3>
        <div>
          <label className={authLabelClassName}>Senha atual</label>
          <input
            type="password"
            className={authInputClassName}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={authLabelClassName}>Nova senha</label>
          <input
            type="password"
            className={authInputClassName}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className={authLabelClassName}>Confirmar nova senha</label>
          <input
            type="password"
            className={authInputClassName}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Salvando..." : "Atualizar senha"}
        </Button>
      </form>
    </div>
  );
}
