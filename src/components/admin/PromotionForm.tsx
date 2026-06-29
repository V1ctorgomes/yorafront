"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { PromotionFormData } from "@/types";

interface PromotionFormProps {
  form: PromotionFormData;
  onChange: (form: PromotionFormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  error?: string;
  disabled?: boolean;
}

const inputClassName =
  "w-full border border-yora-charcoal/20 bg-yora-cream px-3 py-2.5 text-sm focus:border-yora-charcoal focus:outline-none";

const labelClassName =
  "mb-1 block text-xs tracking-widest text-yora-muted uppercase";

export function PromotionForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  error,
  disabled,
}: PromotionFormProps) {
  function updateField<K extends keyof PromotionFormData>(
    key: K,
    value: PromotionFormData[K],
  ) {
    onChange({ ...form, [key]: value });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-5">
      <div>
        <label className={labelClassName}>Nome *</label>
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
          className={inputClassName}
        />
      </div>

      <div>
        <label className={labelClassName}>Descrição</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>Tipo de aplicação *</label>
          <select
            value={form.applicationType}
            onChange={(e) =>
              updateField(
                "applicationType",
                e.target.value as PromotionFormData["applicationType"],
              )
            }
            className={inputClassName}
          >
            <option value="COUPON">Cupom (código)</option>
            <option value="AUTOMATIC">Automática</option>
          </select>
        </div>

        <div>
          <label className={labelClassName}>Tipo de desconto *</label>
          <select
            value={form.type}
            onChange={(e) =>
              updateField("type", e.target.value as PromotionFormData["type"])
            }
            className={inputClassName}
          >
            <option value="PERCENTAGE">Percentual</option>
            <option value="FIXED">Valor fixo</option>
            <option value="FREE_SHIPPING">Frete grátis</option>
          </select>
        </div>
      </div>

      {form.applicationType === "COUPON" && (
        <div>
          <label className={labelClassName}>Código do cupom *</label>
          <input
            value={form.code}
            onChange={(e) =>
              updateField("code", e.target.value.toUpperCase())
            }
            required
            className={inputClassName}
          />
        </div>
      )}

      {form.type !== "FREE_SHIPPING" && (
        <div>
          <label className={labelClassName}>
            Valor {form.type === "PERCENTAGE" ? "(%)" : "(R$)"} *
          </label>
          <input
            type="number"
            min={0}
            step={form.type === "PERCENTAGE" ? "0.01" : "0.01"}
            value={form.value}
            onChange={(e) => updateField("value", Number(e.target.value))}
            required
            className={inputClassName}
          />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>Pedido mínimo (R$)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.minimumOrderValue}
            onChange={(e) => updateField("minimumOrderValue", e.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>Desconto máximo (R$)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.maximumDiscount}
            onChange={(e) => updateField("maximumDiscount", e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>Data inicial *</label>
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => updateField("startDate", e.target.value)}
            required
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>Data final</label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => updateField("endDate", e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>Limite total de usos</label>
          <input
            type="number"
            min={1}
            value={form.usageLimit}
            onChange={(e) => updateField("usageLimit", e.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>Limite por cliente</label>
          <input
            type="number"
            min={1}
            value={form.usageLimitPerCustomer}
            onChange={(e) =>
              updateField("usageLimitPerCustomer", e.target.value)
            }
            className={inputClassName}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.firstPurchaseOnly}
            onChange={(e) =>
              updateField("firstPurchaseOnly", e.target.checked)
            }
          />
          Apenas primeira compra
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
          />
          Promoção ativa
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.storeWide}
            onChange={(e) => updateField("storeWide", e.target.checked)}
          />
          Toda a loja
        </label>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={disabled}>
          {submitLabel}
        </Button>
        <Link
          href="/admin/promotions"
          className="inline-flex items-center px-4 text-sm text-yora-muted hover:text-yora-charcoal"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function toLocalInputValue(date: string) {
  const value = new Date(date);
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function promotionToFormData(
  promotion: import("@/types").AdminPromotion,
): PromotionFormData {
  return {
    name: promotion.name,
    description: promotion.description ?? "",
    code: promotion.code ?? "",
    applicationType: promotion.applicationType,
    type: promotion.type,
    value: Number(promotion.value),
    minimumOrderValue: promotion.minimumOrderValue
      ? String(promotion.minimumOrderValue)
      : "",
    maximumDiscount: promotion.maximumDiscount
      ? String(promotion.maximumDiscount)
      : "",
    startDate: toLocalInputValue(promotion.startDate),
    endDate: promotion.endDate ? toLocalInputValue(promotion.endDate) : "",
    usageLimit: promotion.usageLimit ? String(promotion.usageLimit) : "",
    usageLimitPerCustomer: promotion.usageLimitPerCustomer
      ? String(promotion.usageLimitPerCustomer)
      : "",
    firstPurchaseOnly: promotion.firstPurchaseOnly,
    isActive: promotion.isActive,
    storeWide:
      promotion.targets.length === 0 ||
      promotion.targets.some((target) => target.targetType === "STORE"),
  };
}

export const initialPromotionForm: PromotionFormData = {
  name: "",
  description: "",
  code: "",
  applicationType: "COUPON",
  type: "PERCENTAGE",
  value: 10,
  minimumOrderValue: "",
  maximumDiscount: "",
  startDate: new Date().toISOString().slice(0, 16),
  endDate: "",
  usageLimit: "",
  usageLimitPerCustomer: "",
  firstPurchaseOnly: false,
  isActive: true,
  storeWide: true,
};
