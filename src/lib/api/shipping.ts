import { getApiUrl } from "@/lib/env";
import type { ShippingQuote } from "@/types";

class ShippingApiError extends Error {
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
        : "Erro ao calcular frete";
  throw new ShippingApiError(message, response.status);
}

export async function calculateShipping(
  zipCode: string,
  items: Array<{ productVariantId: string; quantity: number }>,
): Promise<ShippingQuote[]> {
  const response = await fetch(`${getApiUrl()}/shipping/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zipCode, items }),
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<ShippingQuote[]>;
}

export { ShippingApiError };
