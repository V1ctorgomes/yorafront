"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { slugify } from "@/lib/slug";
import { Button } from "@/components/ui/Button";
import type { CategoryFormData } from "@/types";

interface CategoryFormProps {
  form: CategoryFormData;
  onChange: (form: CategoryFormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  error?: string;
  disabled?: boolean;
  slugEditable?: boolean;
}

export function CategoryForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  error,
  disabled,
  slugEditable = false,
}: CategoryFormProps) {
  const [manualSlug, setManualSlug] = useState(slugEditable);

  useEffect(() => {
    if (slugEditable) {
      setManualSlug(true);
    }
  }, [slugEditable]);

  function updateField<K extends keyof CategoryFormData>(
    key: K,
    value: CategoryFormData[K],
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
          Descrição
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={4}
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          URL da imagem
        </label>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => updateField("imageUrl", e.target.value)}
          placeholder="https://"
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Ordem de exibição
          </label>
          <input
            type="number"
            min={0}
            value={form.displayOrder}
            onChange={(e) =>
              updateField("displayOrder", Number(e.target.value))
            }
            className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
              className="h-4 w-4"
            />
            Categoria ativa
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={disabled}>
          {submitLabel}
        </Button>
        <Link
          href="/admin/categories"
          className="text-sm text-yora-muted hover:text-yora-charcoal"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
