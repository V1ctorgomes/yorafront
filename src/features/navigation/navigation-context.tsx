"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Category } from "@/types";

export type NavTransitionDirection = "forward" | "backward" | "neutral";

interface NavigationContextValue {
  getTransitionDirection: (from: string, to: string) => NavTransitionDirection;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

function buildRouteOrder(categories: Category[]): string[] {
  return [
    "/",
    "/novidades",
    ...categories.map((category) => `/categoria/${category.slug}`),
    "/sale",
  ];
}

function resolveRouteIndex(
  pathname: string,
  routeOrder: string[],
): number | null {
  const exactIndex = routeOrder.indexOf(pathname);
  if (exactIndex !== -1) return exactIndex;

  if (pathname.startsWith("/categoria/")) {
    const categoryPath = pathname.split("/").slice(0, 3).join("/");
    const categoryIndex = routeOrder.indexOf(categoryPath);
    if (categoryIndex !== -1) return categoryIndex;
  }

  if (pathname.startsWith("/colecao/")) {
    return routeOrder.indexOf("/novidades");
  }

  if (pathname.startsWith("/produto/")) {
    return null;
  }

  if (pathname === "/carrinho" || pathname === "/checkout") {
    return null;
  }

  return null;
}

interface NavigationProviderProps {
  categories: Category[];
  children: ReactNode;
}

export function NavigationProvider({
  categories,
  children,
}: NavigationProviderProps) {
  const routeOrder = useMemo(
    () => buildRouteOrder(categories),
    [categories],
  );

  const getTransitionDirection = useCallback(
    (from: string, to: string): NavTransitionDirection => {
      const fromIndex = resolveRouteIndex(from, routeOrder);
      const toIndex = resolveRouteIndex(to, routeOrder);

      if (fromIndex === null || toIndex === null || fromIndex === toIndex) {
        return "neutral";
      }

      return toIndex > fromIndex ? "forward" : "backward";
    },
    [routeOrder],
  );

  const value = useMemo(
    () => ({ getTransitionDirection }),
    [getTransitionDirection],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }

  return context;
}
