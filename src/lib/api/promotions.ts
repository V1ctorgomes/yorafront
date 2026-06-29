import { getApiUrl } from "@/lib/env";
import { getCustomerAccessToken } from "@/lib/auth";
import type { PromotionValidationResult } from "@/types";

class PromotionsApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function validatePromotion(payload: {
  code?: string;
  customerId?: string;
  cartItems: Array<{ productVariantId: string; quantity: number }>;
  shippingPrice?: number;
}): Promise<PromotionValidationResult> {
  const customerToken = getCustomerAccessToken();

  const response = await fetch(`${getApiUrl()}/promotions/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(", ")
          : "Não foi possível validar o cupom";
    throw new PromotionsApiError(message, response.status);
  }

  return response.json() as Promise<PromotionValidationResult>;
}

export { PromotionsApiError };
