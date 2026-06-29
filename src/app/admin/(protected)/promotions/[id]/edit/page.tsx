"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchAdminPromotion,
  updatePromotion,
} from "@/lib/api/admin";
import {
  initialPromotionForm,
  promotionToFormData,
  PromotionForm,
} from "@/components/admin/PromotionForm";
import type { PromotionFormData } from "@/types";

export default function EditPromotionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<PromotionFormData>(initialPromotionForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchAdminPromotion(params.id)
      .then((promotion) => setForm(promotionToFormData(promotion)))
      .catch(() => setError("Não foi possível carregar a promoção."))
      .finally(() => setPageLoading(false));
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updatePromotion(params.id, form);
      router.push("/admin/promotions");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar promoção.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return <p className="text-sm text-yora-muted">Carregando...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-yora-charcoal">
        Editar promoção
      </h1>
      <p className="mt-1 text-sm text-yora-muted">
        Atualize as regras e a validade da campanha.
      </p>

      <PromotionForm
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Salvando..." : "Salvar alterações"}
        error={error}
        disabled={loading}
      />
    </div>
  );
}
