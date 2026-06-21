"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  createProduct,
  fetchAdminCategories,
} from "@/lib/api/admin";
import type { AdminCategory, ProductFormData } from "@/types";

const initialData: ProductFormData = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  basePrice: 0,
  coverImage: "",
  isFeatured: false,
  isNew: false,
  isActive: true,
  seoTitle: "",
  seoDescription: "",
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initialData);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminCategories()
      .then(setCategories)
      .catch(() => setError("Não foi possível carregar as categorias."));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createProduct({
        name: form.name,
        slug: form.slug || undefined,
        shortDescription: form.shortDescription,
        description: form.description,
        categoryId: form.categoryId,
        basePrice: form.basePrice,
        coverImage: form.coverImage,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        isActive: form.isActive,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
      });
      router.push("/admin/products");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar produto.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-yora-charcoal">
        Novo produto
      </h1>
      <p className="mt-1 text-sm text-yora-muted">
        Cadastre um novo produto no catálogo da loja.
      </p>

      <ProductForm
        form={form}
        categories={categories}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Salvando..." : "Criar produto"}
        error={error}
        disabled={loading}
      />
    </div>
  );
}
