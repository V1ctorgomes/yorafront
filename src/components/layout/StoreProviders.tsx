"use client";

import { CartProvider } from "@/features/cart/cart-context";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
