"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearCachedCart,
  createEmptyCart,
  getCachedCart,
  setCachedCart,
} from "@/features/cart/cart-storage";
import { useToast } from "@/features/toast/toast-context";
import {
  addCartItem,
  clearCartRequest,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api/cart";
import type { Cart } from "@/types";

interface CartContextValue {
  cart: Cart;
  loading: boolean;
  miniCartOpen: boolean;
  setMiniCartOpen: (open: boolean) => void;
  refreshCart: () => Promise<void>;
  addItem: (
    productVariantId: string,
    quantity?: number,
    options?: { showToast?: boolean },
  ) => Promise<void>;
  updateItemQuantity: (
    productVariantId: string,
    quantity: number,
  ) => Promise<void>;
  removeItem: (productVariantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(() => getCachedCart() ?? createEmptyCart());
  const [loading, setLoading] = useState(true);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const { showCartAddedToast } = useToast();

  const applyCart = useCallback((nextCart: Cart) => {
    setCart(nextCart);
    setCachedCart(nextCart);
  }, []);

  const refreshCart = useCallback(async () => {
    const nextCart = await fetchCart();
    applyCart(nextCart);
  }, [applyCart]);

  useEffect(() => {
    refreshCart()
      .catch(() => applyCart(getCachedCart() ?? createEmptyCart()))
      .finally(() => setLoading(false));
  }, [applyCart, refreshCart]);

  const addItem = useCallback(
    async (
      productVariantId: string,
      quantity = 1,
      options?: { showToast?: boolean },
    ) => {
      const nextCart = await addCartItem(productVariantId, quantity);
      applyCart(nextCart);

      if (options?.showToast === false) {
        return;
      }

      const addedItem = nextCart.items.find(
        (item) => item.productVariantId === productVariantId,
      );

      if (addedItem) {
        showCartAddedToast(addedItem, () => setMiniCartOpen(true));
      }
    },
    [applyCart, showCartAddedToast],
  );

  const updateItemQuantity = useCallback(
    async (productVariantId: string, quantity: number) => {
      const nextCart = await updateCartItem(productVariantId, quantity);
      applyCart(nextCart);
    },
    [applyCart],
  );

  const removeItem = useCallback(
    async (productVariantId: string) => {
      const nextCart = await removeCartItem(productVariantId);
      applyCart(nextCart);
    },
    [applyCart],
  );

  const clearCart = useCallback(async () => {
    const nextCart = await clearCartRequest();
    applyCart(nextCart);
    clearCachedCart();
  }, [applyCart]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      miniCartOpen,
      setMiniCartOpen,
      refreshCart,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
    }),
    [
      cart,
      loading,
      miniCartOpen,
      refreshCart,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }

  return context;
}
