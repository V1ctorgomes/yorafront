"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  createProduct,
  fetchAdminCategories,
  fetchAdminCollections,
} from "@/lib/api/admin";
import type { AdminCategory, AdminCollection, ProductFormData } from "@/types";

const initialData: ProductFormData = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  collectionId: "",
  basePrice: 0,
  coverImage: "",
  isFeatured: false,
  isNew: false,
  isOnSale: false,
  compareAtPrice: "",
  isActive: true,
  seoTitle: "",
  seoDescription: "",
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initialData);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchAdminCategories(), fetchAdminCollections()])
      .then(([categoryList, collectionList]) => {
        setCategories(categoryList);
        setCollections(collectionList);
      })
      .catch(() => setError("Não foi possível carregar os dados do formulário."));
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
        collectionId: form.collectionId || null,
        basePrice: form.basePrice,
        coverImage: form.coverImage,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        isOnSale: form.isOnSale,
        compareAtPrice:
          form.isOnSale && form.compareAtPrice
            ? Number(form.compareAtPrice)
            : null,
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
        collections={collections}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Salvando..." : "Criar produto"}
        error={error}
        disabled={loading}
      />
    </div>
  );
}
