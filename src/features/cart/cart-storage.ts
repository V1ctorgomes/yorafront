import type { Cart, CartItem } from "@/types";

export const CART_TOKEN_KEY = "yora-cart-token";
export const CART_CACHE_KEY = "yora-cart-cache";

export function getStoredCartToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(CART_TOKEN_KEY);
}

export function setStoredCartToken(token: string) {
  localStorage.setItem(CART_TOKEN_KEY, token);
}

export function getCachedCart(): Cart | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(CART_CACHE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Cart;
  } catch {
    return null;
  }
}

export function setCachedCart(cart: Cart) {
  localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cart));
}

export function clearCachedCart() {
  localStorage.removeItem(CART_CACHE_KEY);
}

export function createEmptyCart(): Cart {
  return {
    items: [],
    itemCount: 0,
    subtotal: 0,
    total: 0,
  };
}

export function isSameCartItem(a: CartItem, b: CartItem) {
  return a.productVariantId === b.productVariantId;
}
