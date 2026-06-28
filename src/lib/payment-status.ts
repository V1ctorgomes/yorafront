export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de crédito",
};

export function getPaymentStatusLabel(status: string) {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function getPaymentMethodLabel(method: string) {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export function getPaymentStatusColor(status: string) {
  switch (status) {
    case "APPROVED":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "PENDING":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "REJECTED":
    case "CANCELLED":
      return "text-red-700 bg-red-50 border-red-200";
    case "REFUNDED":
      return "text-violet-700 bg-violet-50 border-violet-200";
    default:
      return "text-yora-muted bg-yora-sand border-yora-charcoal/10";
  }
}
