export type OrderStatusValue =
  | "PENDING"
  | "WAITING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Pendente",
  WAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Em separação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatusValue, string> = {
  PENDING: "text-yora-muted",
  WAITING_PAYMENT: "text-amber-700",
  PAID: "text-blue-700",
  PROCESSING: "text-indigo-700",
  SHIPPED: "text-purple-700",
  DELIVERED: "text-green-700",
  CANCELLED: "text-red-700",
  REFUNDED: "text-orange-700",
};

export function getOrderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status as OrderStatusValue] ?? status;
}

export function getOrderStatusColor(status: string) {
  return ORDER_STATUS_COLORS[status as OrderStatusValue] ?? "text-yora-charcoal";
}

export const SHIPPING_METHOD_OPTIONS = [
  { value: "pac", label: "PAC" },
  { value: "sedex", label: "SEDEX" },
  { value: "pickup", label: "Retirada na Loja" },
] as const;

export const ORDER_SORT_OPTIONS = [
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "highest", label: "Maior valor" },
  { value: "lowest", label: "Menor valor" },
] as const;
