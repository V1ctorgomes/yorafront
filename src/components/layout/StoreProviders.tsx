"use client";

import { CartProvider } from "@/features/cart/cart-context";
import { NavigationProvider } from "@/features/navigation/navigation-context";
import type { Category } from "@/types";

interface StoreProvidersProps {
  categories: Category[];
  children: React.ReactNode;
}

export function StoreProviders({ categories, children }: StoreProvidersProps) {
  return (
    <NavigationProvider categories={categories}>
      <CartProvider>{children}</CartProvider>
    </NavigationProvider>
  );
}
