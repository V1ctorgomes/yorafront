"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export const authInputClassName =
  "w-full border border-yora-charcoal/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-yora-charcoal";

export const authLabelClassName =
  "mb-1 block text-xs tracking-widest text-yora-muted uppercase";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <div className="w-full border border-yora-charcoal/10 bg-yora-cream p-8">
        <p className="font-display text-2xl tracking-[0.25em] text-yora-charcoal">
          YORA
        </p>
        <h1 className="mt-4 font-display text-3xl text-yora-charcoal">{title}</h1>
        <p className="mt-2 text-sm text-yora-muted">{subtitle}</p>
        {children}
        {footer}
      </div>
    </div>
  );
}

interface AuthFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  error?: string;
  success?: string;
  loading?: boolean;
  submitLabel: string;
  children: ReactNode;
}

export function AuthForm({
  onSubmit,
  error,
  success,
  loading,
  submitLabel,
  children,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Aguarde..." : submitLabel}
      </Button>
    </form>
  );
}

export function AuthFooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <p className="mt-6 text-center text-sm text-yora-muted">
      <Link href={href} className="text-yora-charcoal hover:text-yora-taupe">
        {children}
      </Link>
    </p>
  );
}
