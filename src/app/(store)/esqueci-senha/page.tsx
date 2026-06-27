"use client";

import { useState, type FormEvent } from "react";
import {
  AuthCard,
  AuthFooterLink,
  AuthForm,
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthCard";
import { forgotCustomerPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await forgotCustomerPassword({ email });
      setSuccess(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível solicitar a recuperação.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber instruções de redefinição."
      footer={<AuthFooterLink href="/login">Voltar ao login</AuthFooterLink>}
    >
      <AuthForm
        onSubmit={handleSubmit}
        error={error}
        success={success}
        loading={loading}
        submitLabel="Enviar instruções"
      >
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
      </AuthForm>
    </AuthCard>
  );
}
