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
