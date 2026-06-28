"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import {
  createProductImage,
  deleteProductImage,
  fetchAdminProductImages,
  fetchAdminProductVariants,
  updateProductImage,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/Button";
import type { ImageFormData, ProductImage } from "@/types";

const emptyForm: ImageFormData = {
  imageUrl: "",
  altText: "",
  displayOrder: 0,
  color: "",
};

interface ProductGalleryManagerProps {
  productId: string;
}

export function ProductGalleryManager({
  productId,
}: ProductGalleryManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [form, setForm] = useState<ImageFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.displayOrder - b.displayOrder),
    [images],
  );

  async function loadImages() {
    setLoading(true);
    try {
      const [imageData, variantData] = await Promise.all([
        fetchAdminProductImages(productId),
        fetchAdminProductVariants(productId),
      ]);
      setImages(imageData);
      setColorOptions([
        ...new Set(variantData.map((variant) => variant.color).filter(Boolean)),
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, [productId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createProductImage(productId, {
        imageUrl: form.imageUrl,
        altText: form.altText || undefined,
        color: form.color || null,
      });
      setForm(emptyForm);
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar imagem.");
    } finally {
      setSaving(false);
    }
  }

  async function handleColorChange(image: ProductImage, color: string) {
    await updateProductImage(image.id, { color: color || null });
    await loadImages();
  }

  async function handleDelete(image: ProductImage) {
    const confirmed = window.confirm("Deseja excluir esta imagem?");
    if (!confirmed) return;

    await deleteProductImage(image.id);
    await loadImages();
  }

  async function moveImage(image: ProductImage, direction: "up" | "down") {
    const index = sortedImages.findIndex((item) => item.id === image.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sortedImages.length) {
      return;
    }

    const target = sortedImages[targetIndex];

    await Promise.all([
      updateProductImage(image.id, { displayOrder: target.displayOrder }),
      updateProductImage(target.id, { displayOrder: image.displayOrder }),
    ]);

    await loadImages();
  }

  return (
    <div className="mt-8 space-y-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-4 border border-yora-charcoal/10 bg-yora-cream p-5"
      >
        <h2 className="text-sm font-medium tracking-wide text-yora-charcoal">
          Adicionar imagem
        </h2>

        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            URL da imagem *
          </label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            required
            placeholder="https://"
            className="w-full border border-yora-charcoal/20 bg-white px-3 py-2 text-sm focus:border-yora-charcoal focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Texto alternativo
          </label>
          <input
            value={form.altText}
            onChange={(e) => setForm({ ...form, altText: e.target.value })}
            className="w-full border border-yora-charcoal/20 bg-white px-3 py-2 text-sm focus:border-yora-charcoal focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
            Cor (opcional)
          </label>
          <select
            value={form.color ?? ""}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full border border-yora-charcoal/20 bg-white px-3 py-2 text-sm focus:border-yora-charcoal focus:outline-none"
          >
            <option value="">Todas as cores (geral)</option>
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
          {colorOptions.length === 0 && (
            <p className="mt-1 text-xs text-yora-muted">
              Cadastre variantes com cor para associar fotos a uma cor específica.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={saving} size="sm">
          {saving ? "Salvando..." : "Adicionar à galeria"}
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando galeria...</p>
      ) : sortedImages.length === 0 ? (
        <p className="text-sm text-yora-muted">
          Nenhuma imagem na galeria deste produto.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedImages.map((image, index) => (
            <div
              key={image.id}
              className="flex items-center gap-4 border border-yora-charcoal/10 bg-yora-cream p-4"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-yora-sand">
                <Image
                  src={image.imageUrl}
                  alt={image.altText ?? "Imagem do produto"}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-yora-charcoal">
                  {image.imageUrl}
                </p>
                {image.altText && (
                  <p className="mt-1 text-xs text-yora-muted">{image.altText}</p>
                )}
                <p className="mt-1 text-xs text-yora-muted">
                  Ordem: {image.displayOrder + 1}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-yora-muted">Cor:</label>
                  <select
                    value={image.color ?? ""}
                    onChange={(e) => handleColorChange(image, e.target.value)}
                    className="border border-yora-charcoal/20 bg-white px-2 py-1 text-xs focus:border-yora-charcoal focus:outline-none"
                  >
                    <option value="">Geral</option>
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveImage(image, "up")}
                  disabled={index === 0}
                  className="rounded border border-yora-charcoal/15 p-2 disabled:opacity-40"
                  aria-label="Mover para cima"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(image, "down")}
                  disabled={index === sortedImages.length - 1}
                  className="rounded border border-yora-charcoal/15 p-2 disabled:opacity-40"
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(image)}
                  className="rounded border border-red-200 p-2 text-red-600 hover:bg-red-50"
                  aria-label="Excluir imagem"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
