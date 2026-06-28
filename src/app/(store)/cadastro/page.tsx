"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AuthCard,
  AuthFooterLink,
  AuthForm,
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthCard";
import { registerCustomer } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/minha-conta";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerCustomer({
        name,
        email,
        phone: phone || undefined,
        password,
      });
      router.push(redirectTo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível criar a conta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Cadastre-se para acompanhar seus pedidos."
      footer={
        <AuthFooterLink href="/login">Já tenho uma conta</AuthFooterLink>
      }
    >
      <AuthForm
        onSubmit={handleSubmit}
        error={error}
        loading={loading}
        submitLabel="Cadastrar"
      >
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
            type="tel"
            className={authInputClassName}
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className={authLabelClassName}>Senha</label>
          <input
            type="password"
            className={authInputClassName}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
      </AuthForm>
    </AuthCard>
  );
}
