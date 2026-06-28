"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchOrder } from "@/lib/api/checkout";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMounted } from "@/lib/use-mounted";
import {
  buildAuthRedirect,
  clearPendingPaymentOrder,
  getPendingPaymentOrders,
  setCheckoutGuestMode,
} from "@/features/checkout/checkout-session";

interface CheckoutAccessModalProps {
  open: boolean;
  onClose?: () => void;
  allowClose?: boolean;
  onGuestContinue?: () => void;
}

export function CheckoutAccessModal({
  open,
  onClose,
  allowClose = true,
  onGuestContinue,
}: CheckoutAccessModalProps) {
  const router = useRouter();
  const mounted = useMounted();
  const [recentOrders, setRecentOrders] = useState<string[]>([]);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(false);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadRecentOrders() {
      const stored = getPendingPaymentOrders();
      if (stored.length === 0) {
        setRecentOrders([]);
        return;
      }

      setLoadingRecentOrders(true);

      const validOrders = await Promise.all(
        stored.map(async (orderNumber) => {
          try {
            const order = await fetchOrder(orderNumber);

            if (order.status === "WAITING_PAYMENT") {
              return orderNumber;
            }

            if (order.status === "PAID" || order.status === "CANCELLED") {
              clearPendingPaymentOrder(orderNumber);
            }

            return null;
          } catch {
            return null;
          }
        }),
      );

      if (!cancelled) {
        setRecentOrders(
          validOrders.filter((orderNumber): orderNumber is string =>
            Boolean(orderNumber),
          ),
        );
        setLoadingRecentOrders(false);
      }
    }

    void loadRecentOrders();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!mounted || !open) return null;

  function handleGuestContinue() {
    if (onGuestContinue) {
      onGuestContinue();
      return;
    }

    setCheckoutGuestMode();
    router.push("/checkout");
  }

  function handleCreateAccount() {
    router.push(buildAuthRedirect("/checkout", "cadastro"));
  }

  function handleOpenPayment(orderNumber: string) {
    onClose?.();
    router.push(`/pagamento/${encodeURIComponent(orderNumber)}`);
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[200] bg-yora-charcoal/50"
        onClick={allowClose ? onClose : undefined}
        aria-hidden={false}
      />

      <div
        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-access-title"
      >
        <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto border border-yora-charcoal/10 bg-yora-cream p-6 shadow-2xl md:p-8">
          {allowClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-yora-muted hover:text-yora-charcoal"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <h2
            id="checkout-access-title"
            className="font-display text-2xl text-yora-charcoal"
          >
            Como deseja continuar?
          </h2>
          <p className="mt-3 text-sm text-yora-muted">
            Escolha continuar como convidado ou crie uma conta para agilizar
            suas próximas compras.
          </p>

          <div className="mt-8 space-y-3">
            <Button
              type="button"
              className="w-full"
              onClick={handleGuestContinue}
            >
              Continuar como convidado
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCreateAccount}
            >
              Criar conta
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-yora-muted">
            Já tem conta?{" "}
            <Link
              href={buildAuthRedirect("/checkout", "login")}
              className="text-yora-charcoal underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>

          {(loadingRecentOrders || recentOrders.length > 0) && (
            <div className="mt-8 border-t border-yora-charcoal/10 pt-6">
              <h3 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
                Pedidos recentes aguardando pagamento
              </h3>
              <p className="mt-2 text-sm text-yora-muted">
                Retome o pagamento de compras feitas como convidado neste
                navegador.
              </p>

              {loadingRecentOrders ? (
                <p className="mt-4 text-sm text-yora-muted">Carregando...</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {recentOrders.map((orderNumber) => (
                    <li key={orderNumber}>
                      <button
                        type="button"
                        onClick={() => handleOpenPayment(orderNumber)}
                        className="flex w-full items-center justify-between border border-yora-charcoal/10 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-yora-charcoal/30"
                      >
                        <span className="font-medium text-yora-charcoal">
                          {orderNumber}
                        </span>
                        <span className="text-yora-taupe">Pagar →</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
