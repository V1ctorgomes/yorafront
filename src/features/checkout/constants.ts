import type { ShippingMethod, ShippingOption } from "@/types";

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    method: "pac",
    label: "PAC",
    price: 15.9,
    estimatedDays: "8 a 12 dias úteis",
  },
  {
    method: "sedex",
    label: "SEDEX",
    price: 29.9,
    estimatedDays: "2 a 4 dias úteis",
  },
  {
    method: "pickup",
    label: "Retirada na Loja",
    price: 0,
    estimatedDays: "Disponível em 1 dia útil",
  },
];

export function getShippingOption(method: ShippingMethod) {
  return SHIPPING_OPTIONS.find((option) => option.method === method);
}

export const CHECKOUT_STEPS = [
  { id: 1, label: "Identificação" },
  { id: 2, label: "Endereço" },
  { id: 3, label: "Entrega" },
  { id: 4, label: "Resumo" },
] as const;

export const inputClassName =
  "w-full border border-yora-charcoal/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-yora-charcoal";

export const labelClassName =
  "mb-1 block text-xs tracking-widest text-yora-muted uppercase";
