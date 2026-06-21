"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  fetchAdminCategories,
  fetchAdminProduct,
  updateProduct,
} from "@/lib/api/admin";
import type { AdminCategory, ProductFormData } from "@/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchAdminProduct(params.id),
      fetchAdminCategories(),
    ])
      .then(([product, categoryList]) => {
        setCategories(categoryList);
        setForm({
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description ?? "",
          categoryId: product.category.id,
          basePrice: product.basePrice,
          coverImage: product.coverImage,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          isActive: product.isActive,
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
        });
      })
      .catch(() => setError("Produto não encontrado."));
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setLoading(true);
    setError("");

    try {
      await updateProduct(params.id, {
        name: form.name,
        slug: form.slug,
        shortDescription: form.shortDescription,
        description: form.description,
        categoryId: form.categoryId,
        basePrice: form.basePrice,
        coverImage: form.coverImage,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        isActive: form.isActive,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
      });
      router.push("/admin/products");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar produto.",
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
        Editar produto
      </h1>
      <p className="mt-1 text-sm text-yora-muted">
        Atualize as informações do produto selecionado.
      </p>

      <ProductForm
        form={form}
        categories={categories}
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
