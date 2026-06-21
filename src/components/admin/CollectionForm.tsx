"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { slugify } from "@/lib/slug";
import { Button } from "@/components/ui/Button";
import type { CollectionFormData } from "@/types";

interface CollectionFormProps {
  form: CollectionFormData;
  onChange: (form: CollectionFormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  error?: string;
  disabled?: boolean;
  slugEditable?: boolean;
}

export function CollectionForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  error,
  disabled,
  slugEditable = false,
}: CollectionFormProps) {
  const [manualSlug, setManualSlug] = useState(slugEditable);

  useEffect(() => {
    if (slugEditable) {
      setManualSlug(true);
    }
  }, [slugEditable]);

  function updateField<K extends keyof CollectionFormData>(
    key: K,
    value: CollectionFormData[K],
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
          URL do banner *
        </label>
        <input
          type="url"
          value={form.bannerImageUrl}
          onChange={(e) => updateField("bannerImageUrl", e.target.value)}
          required
          placeholder="https://"
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          URL da thumbnail *
        </label>
        <input
          type="url"
          value={form.thumbnailImageUrl}
          onChange={(e) => updateField("thumbnailImageUrl", e.target.value)}
          required
          placeholder="https://"
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Data de lançamento *
          </label>
          <input
            type="datetime-local"
            value={form.launchDate}
            onChange={(e) => updateField("launchDate", e.target.value)}
            required
            className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Data de encerramento
          </label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => updateField("endDate", e.target.value)}
            className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => updateField("isFeatured", e.target.checked)}
            className="h-4 w-4"
          />
          Coleção em destaque
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
            className="h-4 w-4"
          />
          Coleção ativa
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={disabled}>
          {submitLabel}
        </Button>
        <Link
          href="/admin/collections"
          className="text-sm text-yora-muted hover:text-yora-charcoal"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function collectionToFormData(collection: {
  name: string;
  slug: string;
  description: string | null;
  bannerImageUrl: string;
  thumbnailImageUrl: string;
  launchDate: string;
  endDate: string | null;
  isFeatured: boolean;
  isActive: boolean;
}): CollectionFormData {
  return {
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? "",
    bannerImageUrl: collection.bannerImageUrl,
    thumbnailImageUrl: collection.thumbnailImageUrl,
    launchDate: toDateTimeLocalValue(collection.launchDate),
    endDate: collection.endDate ? toDateTimeLocalValue(collection.endDate) : "",
    isFeatured: collection.isFeatured,
    isActive: collection.isActive,
  };
}

export function formDataToCollectionPayload(form: CollectionFormData) {
  return {
    name: form.name,
    slug: form.slug || undefined,
    description: form.description || undefined,
    bannerImageUrl: form.bannerImageUrl,
    thumbnailImageUrl: form.thumbnailImageUrl,
    launchDate: new Date(form.launchDate).toISOString(),
    endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
  };
}

function defaultLaunchDate() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T12:00`;
}

export const initialCollectionFormData: CollectionFormData = {
  name: "",
  slug: "",
  description: "",
  bannerImageUrl: "",
  thumbnailImageUrl: "",
  launchDate: defaultLaunchDate(),
  endDate: "",
  isFeatured: false,
  isActive: true,
};
