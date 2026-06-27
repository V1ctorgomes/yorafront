"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthCard";
import {
  changeCustomerPassword,
  fetchCustomerProfile,
  logoutCustomer,
} from "@/lib/api/auth";
import {
  clearCustomerTokens,
  isCustomerAuthenticated,
} from "@/lib/auth";
import type { UserProfile } from "@/types";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.replace("/login");
      return;
    }

    fetchCustomerProfile()
      .then(setProfile)
      .catch(() => {
        clearCustomerTokens();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await logoutCustomer();
    router.push("/login");
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await changeCustomerPassword({
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
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <p className="text-sm text-yora-muted">Carregando conta...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-yora-charcoal">
            Minha conta
          </h1>
          <p className="mt-2 text-sm text-yora-muted">
            Olá, {profile.name}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-yora-muted hover:text-yora-charcoal"
        >
          Sair
        </button>
      </div>

      <div className="grid gap-6">
        <section className="border border-yora-charcoal/10 bg-yora-cream p-6">
          <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
            Perfil
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-yora-muted">Nome</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt className="text-yora-muted">E-mail</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt className="text-yora-muted">Telefone</dt>
              <dd>{profile.phone ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="border border-yora-charcoal/10 bg-yora-cream p-6">
          <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
            Área do cliente
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <AccountLink href="/conta" label="Meus pedidos" note="Em breve" />
            <AccountLink href="/conta" label="Favoritos" note="Em breve" />
            <AccountLink href="/conta" label="Endereços" note="Em breve" />
            <AccountLink href="/conta" label="Perfil" note="Ativo" />
          </div>
        </section>

        <section className="border border-yora-charcoal/10 bg-yora-cream p-6">
          <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
            Alterar senha
          </h2>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
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
        </section>
      </div>
    </div>
  );
}

function AccountLink({
  href,
  label,
  note,
}: {
  href: string;
  label: string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="border border-yora-charcoal/10 px-4 py-4 text-sm transition-colors hover:border-yora-charcoal/30"
    >
      <span className="block font-medium text-yora-charcoal">{label}</span>
      <span className="mt-1 block text-yora-muted">{note}</span>
    </Link>
  );
}
