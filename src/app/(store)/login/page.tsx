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
import { loginCustomer } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/minha-conta";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginCustomer(email, password);
      router.push(redirectTo);
    } catch {
      setError("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Entrar"
      subtitle="Acesse sua conta para acompanhar pedidos e preferências."
      footer={
        <>
          <AuthFooterLink href="/cadastro">
            Criar uma conta
          </AuthFooterLink>
          <AuthFooterLink href="/esqueci-senha">
            Esqueci minha senha
          </AuthFooterLink>
        </>
      }
    >
      <AuthForm
        onSubmit={handleSubmit}
        error={error}
        loading={loading}
        submitLabel="Entrar"
      >
        <div>
          <label className={authLabelClassName}>E-mail</label>
          <input
            type="email"
            className={authInputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
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
            autoComplete="current-password"
          />
        </div>
      </AuthForm>
    </AuthCard>
  );
}
