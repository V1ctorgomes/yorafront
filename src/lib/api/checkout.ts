import { getApiUrl } from "@/lib/env";
import { getStoredCartToken } from "@/features/cart/cart-storage";
import type { CheckoutPayload, Order } from "@/types";

class CheckoutApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function checkoutHeaders() {
  const token = getStoredCartToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { "X-Cart-Token": token } : {}),
  };
}

async function parseError(response: Response) {
  const body = await response.json().catch(() => ({}));
  const message =
    typeof body.message === "string"
      ? body.message
      : Array.isArray(body.message)
        ? body.message.join(", ")
        : "Erro ao processar checkout";
  throw new CheckoutApiError(message, response.status);
}

export async function submitCheckout(payload: CheckoutPayload): Promise<Order> {
  const response = await fetch(`${getApiUrl()}/checkout`, {
    method: "POST",
    headers: checkoutHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<Order>;
}

export async function fetchOrder(orderNumber: string): Promise<Order> {
  const response = await fetch(`${getApiUrl()}/orders/${orderNumber}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<Order>;
}

export { CheckoutApiError };
