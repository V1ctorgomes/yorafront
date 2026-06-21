"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/lib/api/admin";
import { CategoryForm } from "@/components/admin/CategoryForm";
import type { CategoryFormData } from "@/types";

const initialData: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  displayOrder: 0,
  isActive: true,
};

export default function NewCategoryPage() {
  const router = useRouter();
  const [form, setForm] = useState<CategoryFormData>(initialData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createCategory({
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      });
      router.push("/admin/categories");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar categoria.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-yora-charcoal">
        Nova categoria
      </h1>
      <p className="mt-1 text-sm text-yora-muted">
        Cadastre uma nova categoria para organizar os produtos.
      </p>

      <CategoryForm
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Salvando..." : "Criar categoria"}
        error={error}
        disabled={loading}
      />
    </div>
  );
}
