"use client";

import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types";

const TOAST_DURATION_MS = 4500;

interface CartAddedToastData {
  type: "cart-added";
  item: CartItem;
  onViewCart?: () => void;
}

type ToastData = CartAddedToastData;

interface ToastContextValue {
  showCartAddedToast: (item: CartItem, onViewCart?: () => void) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setIsVisible(false);

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    setTimeout(() => setToast(null), 280);
  }, []);

  const showCartAddedToast = useCallback(
    (item: CartItem, onViewCart?: () => void) => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      setToast({ type: "cart-added", item, onViewCart });
      setIsVisible(true);

      dismissTimerRef.current = setTimeout(() => {
        dismiss();
      }, TOAST_DURATION_MS);
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({ showCartAddedToast }),
    [showCartAddedToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toast?.type === "cart-added" && (
        <div
          className={cn(
            "toast-viewport pointer-events-none fixed inset-x-0 top-0 z-[300] flex justify-center p-4 sm:inset-x-auto sm:right-4 sm:top-4 sm:justify-end sm:p-0",
          )}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className={cn(
              "toast-panel pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-yora-charcoal/10 bg-yora-cream/95 p-4 shadow-[0_12px_40px_rgb(0,0,0,0.12)] backdrop-blur-xl sm:max-w-sm",
              isVisible ? "toast-panel-open" : "toast-panel-closed",
            )}
          >
            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-yora-sand">
              {toast.item.imageUrl ? (
                <Image
                  src={toast.item.imageUrl}
                  alt={toast.item.productName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="absolute inset-0 bg-yora-sand" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-yora-taupe">
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                <p className="text-xs font-medium tracking-wide uppercase">
                  Adicionado à sacola
                </p>
              </div>

              <p className="mt-1 truncate text-sm font-medium text-yora-charcoal">
                {toast.item.productName}
              </p>

              <p className="mt-0.5 text-xs text-yora-muted">
                {toast.item.color} · {toast.item.size}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {toast.onViewCart && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.onViewCart?.();
                      dismiss();
                    }}
                    className="text-xs font-medium tracking-wide text-yora-charcoal underline underline-offset-4 transition-colors hover:text-yora-taupe"
                  >
                    Ver sacola
                  </button>
                )}
                <Link
                  href="/checkout"
                  onClick={dismiss}
                  className="text-xs font-medium tracking-wide text-yora-taupe transition-colors hover:text-yora-charcoal"
                >
                  Finalizar compra
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 p-1 text-yora-muted transition-colors hover:text-yora-charcoal"
              aria-label="Fechar aviso"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }

  return context;
}
