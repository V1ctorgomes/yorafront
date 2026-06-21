"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { BannerFormData } from "@/types";

interface BannerFormProps {
  form: BannerFormData;
  onChange: (form: BannerFormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  error?: string;
  disabled?: boolean;
}

export function BannerForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  error,
  disabled,
}: BannerFormProps) {
  function updateField<K extends keyof BannerFormData>(
    key: K,
    value: BannerFormData[K],
  ) {
    onChange({ ...form, [key]: value });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-5">
      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          Título *
        </label>
        <input
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          Subtítulo
        </label>
        <textarea
          value={form.subtitle}
          onChange={(e) => updateField("subtitle", e.target.value)}
          rows={3}
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          URL da imagem *
        </label>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => updateField("imageUrl", e.target.value)}
          required
          placeholder="https://"
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
          URL da imagem mobile
        </label>
        <input
          type="url"
          value={form.mobileImageUrl}
          onChange={(e) => updateField("mobileImageUrl", e.target.value)}
          placeholder="https://"
          className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Texto do botão
          </label>
          <input
            value={form.buttonText}
            onChange={(e) => updateField("buttonText", e.target.value)}
            className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Link do botão
          </label>
          <input
            value={form.buttonLink}
            onChange={(e) => updateField("buttonLink", e.target.value)}
            placeholder="/colecoes/exemplo"
            className="w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none"
          />
        </div>
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
            Banner ativo
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={disabled}>
          {submitLabel}
        </Button>
        <Link
          href="/admin/banners"
          className="text-sm text-yora-muted hover:text-yora-charcoal"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
