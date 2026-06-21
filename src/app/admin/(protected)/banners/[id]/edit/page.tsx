"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAdminBanner, updateBanner } from "@/lib/api/admin";
import { BannerForm } from "@/components/admin/BannerForm";
import type { BannerFormData } from "@/types";

export default function EditBannerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<BannerFormData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminBanner(params.id)
      .then((banner) => {
        setForm({
          title: banner.title,
          subtitle: banner.subtitle ?? "",
          imageUrl: banner.imageUrl,
          mobileImageUrl: banner.mobileImageUrl ?? "",
          buttonText: banner.buttonText ?? "",
          buttonLink: banner.buttonLink ?? "",
          displayOrder: banner.displayOrder,
          isActive: banner.isActive,
        });
      })
      .catch(() => setError("Banner não encontrado."));
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setError("");
    setLoading(true);

    try {
      await updateBanner(params.id, {
        ...form,
        subtitle: form.subtitle || undefined,
        mobileImageUrl: form.mobileImageUrl || undefined,
        buttonText: form.buttonText || undefined,
        buttonLink: form.buttonLink || undefined,
      });
      router.push("/admin/banners");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar banner.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!form && !error) {
    return <p className="text-sm text-yora-muted">Carregando...</p>;
  }

  if (!form) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-yora-charcoal">Editar banner</h1>
      <p className="mt-1 text-sm text-yora-muted">
        Atualize as informações do banner selecionado.
      </p>

      <BannerForm
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
