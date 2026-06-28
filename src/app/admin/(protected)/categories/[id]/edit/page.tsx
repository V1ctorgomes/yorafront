"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAdminCategory, updateCategory } from "@/lib/api/admin";
import { CategoryForm } from "@/components/admin/CategoryForm";
import type { CategoryFormData } from "@/types";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<CategoryFormData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminCategory(params.id)
      .then((category) => {
        setForm({
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          bannerImageUrl: category.bannerImageUrl ?? "",
          displayOrder: category.displayOrder,
          isActive: category.isActive,
        });
      })
      .catch(() => setError("Categoria não encontrada."));
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setError("");
    setLoading(true);

    try {
      await updateCategory(params.id, {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        bannerImageUrl: form.bannerImageUrl || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      });
      router.push("/admin/categories");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar categoria.",
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
      <h1 className="font-display text-3xl text-yora-charcoal">
        Editar categoria
      </h1>
      <p className="mt-1 text-sm text-yora-muted">
        Atualize as informações da categoria selecionada.
      </p>

      <CategoryForm
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Salvando..." : "Salvar alterações"}
        error={error}
        disabled={loading}
        slugEditable
      />
    </div>
  );
}
