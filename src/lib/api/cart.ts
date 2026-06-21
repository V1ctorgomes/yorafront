import { getApiUrl } from "@/lib/env";
import {
  getStoredCartToken,
  setStoredCartToken,
} from "@/features/cart/cart-storage";
import type { Cart } from "@/types";

class CartApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

interface CartResponse extends Cart {
  token?: string;
}

function extractToken(response: Response) {
  return response.headers.get("x-cart-token");
}

function storeTokenFromResponse(response: Response, body?: CartResponse) {
  const headerToken = extractToken(response);
  const token = headerToken ?? body?.token;

  if (token) {
    setStoredCartToken(token);
  }
}

async function parseCartResponse(response: Response): Promise<Cart> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(", ")
          : "Erro ao atualizar carrinho";
    throw new CartApiError(message, response.status);
  }

  const data = (await response.json()) as CartResponse;
  storeTokenFromResponse(response, data);

  return {
    items: data.items,
    itemCount: data.itemCount,
    subtotal: data.subtotal,
    total: data.total,
  };
}

function cartHeaders() {
  const token = getStoredCartToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { "X-Cart-Token": token } : {}),
  };
}

export async function fetchCart(): Promise<Cart> {
  const response = await fetch(`${getApiUrl()}/cart`, {
    headers: cartHeaders(),
    cache: "no-store",
  });

  return parseCartResponse(response);
}

export async function addCartItem(
  productVariantId: string,
  quantity = 1,
): Promise<Cart> {
  const response = await fetch(`${getApiUrl()}/cart/items`, {
    method: "POST",
    headers: cartHeaders(),
    body: JSON.stringify({ productVariantId, quantity }),
  });

  return parseCartResponse(response);
}

export async function updateCartItem(
  productVariantId: string,
  quantity: number,
): Promise<Cart> {
  const response = await fetch(`${getApiUrl()}/cart/items/${productVariantId}`, {
    method: "PATCH",
    headers: cartHeaders(),
    body: JSON.stringify({ quantity }),
  });

  return parseCartResponse(response);
}

export async function removeCartItem(productVariantId: string): Promise<Cart> {
  const response = await fetch(`${getApiUrl()}/cart/items/${productVariantId}`, {
    method: "DELETE",
    headers: cartHeaders(),
  });

  return parseCartResponse(response);
}

export async function clearCartRequest(): Promise<Cart> {
  const response = await fetch(`${getApiUrl()}/cart/clear`, {
    method: "DELETE",
    headers: cartHeaders(),
  });

  return parseCartResponse(response);
}

export { CartApiError };
