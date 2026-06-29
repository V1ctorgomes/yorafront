"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { slugify } from "@/lib/slug";
import { Button } from "@/components/ui/Button";
import type { AdminCategory, AdminCollection, ProductFormData } from "@/types";

interface ProductFormProps {
  form: ProductFormData;
  categories: AdminCategory[];
  collections: AdminCollection[];
  onChange: (form: ProductFormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  error?: string;
  disabled?: boolean;
  slugEditable?: boolean;
}

export function ProductForm({
  form,
  categories,
  collections,
  onChange,
  onSubmit,
  submitLabel,
  error,
  disabled,
  slugEditable = false,
}: ProductFormProps) {
  const [manualSlug, setManualSlug] = useState(slugEditable);

  useEffect(() => {
    if (slugEditable) {
      setManualSlug(true);
    }
  }, [slugEditable]);

  function updateField<K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) {
    onChange({ ...form, [key]: value });
  }

  function handleNameChange(name: string) {
    if (!manualSlug) {
      onChange({ ...form, name, slug: slugify(name) });
      return;
    }
    updateField("name", name);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-5">
      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          Nome *
        </label>
        <input
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs tracking-widest text-yora-muted uppercase">
            Slug *
          </label>
          {!slugEditable && (
            <button
              type="button"
              onClick={() => setManualSlug((current) => !current)}
              className="text-xs text-yora-taupe hover:text-yora-charcoal"
            >
              {manualSlug ? "Gerar automaticamente" : "Editar slug"}
            </button>
          )}
        </div>
        <input
          value={form.slug}
          onChange={(e) => updateField("slug", slugify(e.target.value))}
          required
          disabled={!manualSlug && !slugEditable}
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none disabled:bg-yora-sand/50"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          Descrição curta *
        </label>
        <textarea
          value={form.shortDescription}
          onChange={(e) => updateField("shortDescription", e.target.value)}
          required
          rows={2}
          minLength={10}
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          Descrição completa *
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          required
          rows={6}
          minLength={20}
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Categoria *
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            required
            className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
          >
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Coleção
          </label>
          <select
            value={form.collectionId}
            onChange={(e) => updateField("collectionId", e.target.value)}
            className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
          >
            <option value="">Nenhuma</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Preço base (R$) *
          </label>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={form.basePrice || ""}
            onChange={(e) =>
              updateField("basePrice", Number(e.target.value))
            }
            required
            className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
          />
        </div>

        {form.isOnSale && (
          <div>
            <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
              Preço original (R$)
            </label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={form.compareAtPrice}
              onChange={(e) => updateField("compareAtPrice", e.target.value)}
              placeholder="Preço antes do desconto"
              className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
            />
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          URL da imagem principal *
        </label>
        <input
          type="url"
          value={form.coverImage}
          onChange={(e) => updateField("coverImage", e.target.value)}
          required
          placeholder="https://"
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => updateField("isFeatured", e.target.checked)}
            className="h-4 w-4"
          />
          Em destaque
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => updateField("isNew", e.target.checked)}
            className="h-4 w-4"
          />
          Novidade
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.isOnSale}
            onChange={(e) => updateField("isOnSale", e.target.checked)}
            className="h-4 w-4"
          />
          Em promoção (Sale)
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
            className="h-4 w-4"
          />
          Produto ativo
        </label>
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          SEO Title
        </label>
        <input
          value={form.seoTitle}
          onChange={(e) => updateField("seoTitle", e.target.value)}
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          SEO Description
        </label>
        <textarea
          value={form.seoDescription}
          onChange={(e) => updateField("seoDescription", e.target.value)}
          rows={3}
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={disabled}>
          {submitLabel}
        </Button>
        <Link
          href="/admin/products"
          className="text-sm text-yora-muted hover:text-yora-charcoal"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
