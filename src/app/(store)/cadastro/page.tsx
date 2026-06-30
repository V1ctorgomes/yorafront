"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import {
  AuthCard,
  AuthFooterLink,
  AuthForm,
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthCard";
import { registerCustomer } from "@/lib/api/auth";
import { formatCpfInput } from "@/lib/cpf";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/minha-conta";
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await registerCustomer({
        name,
        cpf,
        email,
        phone,
        password,
        confirmPassword,
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
          <label className={authLabelClassName}>Nome completo</label>
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
            className={authInputClassName}
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCpfInput(e.target.value))}
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
            required
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
        <div>
          <label className={authLabelClassName}>Confirmar senha</label>
          <input
            type="password"
            className={authInputClassName}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
      </AuthForm>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16">
          <p className="text-sm text-yora-muted">Carregando...</p>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
