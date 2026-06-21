"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  createProductVariant,
  deleteProductVariant,
  fetchAdminProductVariants,
  updateProductVariant,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { ProductVariant, VariantFormData } from "@/types";

const emptyForm: VariantFormData = {
  color: "",
  size: "",
  sku: "",
  priceOverride: "",
  stock: 0,
  isActive: true,
};

interface ProductVariantsManagerProps {
  productId: string;
}

export function ProductVariantsManager({
  productId,
}: ProductVariantsManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [form, setForm] = useState<VariantFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadVariants() {
    setLoading(true);
    try {
      const data = await fetchAdminProductVariants(productId);
      setVariants(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVariants();
  }, [productId]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function startEdit(variant: ProductVariant) {
    setEditingId(variant.id);
    setForm({
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      priceOverride:
        variant.priceOverride !== null ? String(variant.priceOverride) : "",
      stock: variant.stock,
      isActive: variant.isActive ?? true,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      color: form.color,
      size: form.size,
      sku: form.sku,
      stock: form.stock,
      isActive: form.isActive,
      priceOverride: form.priceOverride
        ? Number(form.priceOverride)
        : undefined,
    };

    try {
      if (editingId) {
        await updateProductVariant(editingId, payload);
      } else {
        await createProductVariant(productId, payload);
      }

      resetForm();
      await loadVariants();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar variante.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(variant: ProductVariant) {
    const confirmed = window.confirm(
      `Deseja excluir a variante ${variant.color} / ${variant.size}?`,
    );

    if (!confirmed) return;

    await deleteProductVariant(variant.id);
    if (editingId === variant.id) {
      resetForm();
    }
    await loadVariants();
  }

  return (
    <div className="mt-8 space-y-8">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4 border border-yora-charcoal/10 bg-yora-cream p-5">
        <h2 className="text-sm font-medium tracking-wide text-yora-charcoal">
          {editingId ? "Editar variante" : "Nova variante"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
              Cor *
            </label>
            <input
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              required
              className="w-full border border-yora-charcoal/20 bg-white px-3 py-2 text-sm focus:border-yora-charcoal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
              Tamanho *
            </label>
            <input
              value={form.size}
              onChange={(e) =>
                setForm({ ...form, size: e.target.value.toUpperCase() })
              }
              required
              className="w-full border border-yora-charcoal/20 bg-white px-3 py-2 text-sm focus:border-yora-charcoal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
              SKU *
            </label>
            <input
              value={form.sku}
              onChange={(e) =>
                setForm({ ...form, sku: e.target.value.toUpperCase() })
              }
              required
              className="w-full border border-yora-charcoal/20 bg-white px-3 py-2 text-sm focus:border-yora-charcoal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
              Estoque *
            </label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Number(e.target.value) })
              }
              required
              className="w-full border border-yora-charcoal/20 bg-white px-3 py-2 text-sm focus:border-yora-charcoal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs tracking-widest text-yora-muted uppercase">
              Preço personalizado (R$)
            </label>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={form.priceOverride}
              onChange={(e) =>
                setForm({ ...form, priceOverride: e.target.value })
              }
              placeholder="Usar preço base"
              className="w-full border border-yora-charcoal/20 bg-white px-3 py-2 text-sm focus:border-yora-charcoal focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="h-4 w-4"
              />
              Variante ativa
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} size="sm">
            {saving
              ? "Salvando..."
              : editingId
                ? "Salvar variante"
                : "Adicionar variante"}
          </Button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-yora-muted hover:text-yora-charcoal"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando variantes...</p>
      ) : variants.length === 0 ? (
        <p className="text-sm text-yora-muted">
          Nenhuma variante cadastrada para este produto.
        </p>
      ) : (
        <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
              <tr>
                <th className="px-4 py-3 font-medium">Cor</th>
                <th className="px-4 py-3 font-medium">Tamanho</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr
                  key={variant.id}
                  className="border-b border-yora-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3">{variant.color}</td>
                  <td className="px-4 py-3">{variant.size}</td>
                  <td className="px-4 py-3 text-yora-muted">{variant.sku}</td>
                  <td className="px-4 py-3">{formatPrice(variant.price)}</td>
                  <td className="px-4 py-3">{variant.stock}</td>
                  <td className="px-4 py-3">
                    {variant.isActive ? "Ativo" : "Inativo"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(variant)}
                        className="inline-flex items-center gap-1 text-yora-charcoal hover:text-yora-taupe"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(variant)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
