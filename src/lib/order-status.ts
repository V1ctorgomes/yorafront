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

export const KANBAN_COLUMNS: OrderStatusValue[] = [
  "WAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export const KANBAN_COLUMN_STYLES: Record<OrderStatusValue, string> = {
  PENDING: "border-yora-charcoal/15 bg-yora-sand/30",
  WAITING_PAYMENT: "border-amber-200 bg-amber-50/50",
  PAID: "border-blue-200 bg-blue-50/50",
  PROCESSING: "border-indigo-200 bg-indigo-50/50",
  SHIPPED: "border-purple-200 bg-purple-50/50",
  DELIVERED: "border-green-200 bg-green-50/50",
  CANCELLED: "border-red-200 bg-red-50/50",
  REFUNDED: "border-orange-200 bg-orange-50/50",
};

const ALLOWED_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["WAITING_PAYMENT", "PAID", "CANCELLED"],
  WAITING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransitionOrderStatus(
  current: OrderStatusValue,
  next: OrderStatusValue,
): boolean {
  if (current === next) return false;
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

export function getAllowedNextOrderStatuses(
  current: OrderStatusValue,
): OrderStatusValue[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}
