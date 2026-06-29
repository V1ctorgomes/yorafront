"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductGalleryManager } from "@/components/admin/ProductGalleryManager";
import { ProductVariantsManager } from "@/components/admin/ProductVariantsManager";
import {
  fetchAdminCategories,
  fetchAdminCollections,
  fetchAdminProduct,
  updateProduct,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import type { AdminCategory, AdminCollection, ProductFormData } from "@/types";

type ProductTab = "general" | "variants" | "gallery";

const tabs: { id: ProductTab; label: string }[] = [
  { id: "general", label: "Geral" },
  { id: "variants", label: "Variantes" },
  { id: "gallery", label: "Galeria" },
];

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProductTab>("general");
  const [form, setForm] = useState<ProductFormData | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchAdminProduct(params.id),
      fetchAdminCategories(),
      fetchAdminCollections(),
    ])
      .then(([product, categoryList, collectionList]) => {
        setCategories(categoryList);
        setCollections(collectionList);
        setForm({
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description ?? "",
          categoryId: product.category.id,
          collectionId: product.collection?.id ?? "",
          basePrice: product.basePrice,
          coverImage: product.coverImage,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          isOnSale: product.isOnSale,
          compareAtPrice: product.compareAtPrice
            ? String(product.compareAtPrice)
            : "",
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
        Gerencie informações, variantes e galeria do produto.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-yora-charcoal/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm tracking-wide transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-yora-charcoal text-yora-charcoal"
                : "text-yora-muted hover:text-yora-charcoal",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <ProductForm
          form={form}
          categories={categories}
          collections={collections}
          onChange={setForm}
          onSubmit={handleSubmit}
          submitLabel={loading ? "Salvando..." : "Salvar alterações"}
          error={error}
          disabled={loading}
          slugEditable
        />
      )}

      {activeTab === "variants" && (
        <ProductVariantsManager productId={params.id} />
      )}

      {activeTab === "gallery" && (
        <ProductGalleryManager productId={params.id} />
      )}
    </div>
  );
}
