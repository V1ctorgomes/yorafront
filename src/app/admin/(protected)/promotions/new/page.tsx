"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createPromotion } from "@/lib/api/admin";
import {
  initialPromotionForm,
  PromotionForm,
} from "@/components/admin/PromotionForm";
import type { PromotionFormData } from "@/types";

export default function NewPromotionPage() {
  const router = useRouter();
  const [form, setForm] = useState<PromotionFormData>(initialPromotionForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createPromotion(form);
      router.push("/admin/promotions");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar promoção.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-yora-charcoal">Nova promoção</h1>
      <p className="mt-1 text-sm text-yora-muted">
        Configure cupons e campanhas promocionais.
      </p>

      <PromotionForm
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Salvando..." : "Criar promoção"}
        error={error}
        disabled={loading}
      />
    </div>
  );
}
