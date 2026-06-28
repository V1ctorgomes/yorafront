import { getApiUrl } from "@/lib/env";
import type {
  CreatePaymentPayload,
  Payment,
  PaymentConfig,
  PaymentMethodType,
} from "@/types";

class PaymentsApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function parseError(response: Response) {
  const body = await response.json().catch(() => ({}));
  const message =
    typeof body.message === "string"
      ? body.message
      : Array.isArray(body.message)
        ? body.message.join(", ")
        : "Erro ao processar pagamento";
  throw new PaymentsApiError(message, response.status);
}

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  const response = await fetch(`${getApiUrl()}/payments/config`, {
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<PaymentConfig>;
}

export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const response = await fetch(`${getApiUrl()}/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<Payment>;
}

export async function fetchPayment(id: string): Promise<Payment> {
  const response = await fetch(`${getApiUrl()}/payments/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<Payment>;
}

export async function fetchPaymentByOrder(
  orderNumber: string,
): Promise<Payment | null> {
  const response = await fetch(
    `${getApiUrl()}/payments/order/${encodeURIComponent(orderNumber)}`,
    { cache: "no-store" },
  );

  if (response.status === 404 || response.status === 204) {
    return null;
  }

  if (!response.ok) {
    await parseError(response);
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text) as Payment;
}

export async function simulatePayment(
  paymentId: string,
  status: "APPROVED" | "REJECTED",
): Promise<Payment> {
  const response = await fetch(`${getApiUrl()}/payments/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId, status }),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<Payment>;
}

export { PaymentsApiError };

export type { PaymentMethodType };
