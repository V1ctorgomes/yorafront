"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import {
  AuthCard,
  AuthForm,
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthCard";
import { resetCustomerPassword } from "@/lib/api/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    if (!token) {
      setError("Token inválido ou ausente.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetCustomerPassword({
        token,
        password,
        confirmPassword,
      });
      setSuccess(response.message);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível redefinir a senha.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Redefinir senha"
      subtitle="Escolha uma nova senha para sua conta."
      footer={
        <p className="mt-6 text-center text-sm text-yora-muted">
          <Link href="/login" className="text-yora-charcoal hover:text-yora-taupe">
            Voltar ao login
          </Link>
        </p>
      }
    >
      <AuthForm
        onSubmit={handleSubmit}
        error={error}
        success={success}
        loading={loading}
        submitLabel="Salvar nova senha"
      >
        <div>
          <label className={authLabelClassName}>Nova senha</label>
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
      </AuthForm>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-yora-muted">Carregando...</p>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
