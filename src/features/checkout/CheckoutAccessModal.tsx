"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { useMounted } from "@/lib/use-mounted";
import {
  buildAuthRedirect,
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

  useBodyScrollLock(open);

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
        <div className="relative w-full max-w-md border border-yora-charcoal/10 bg-yora-cream p-6 shadow-2xl md:p-8">
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
        </div>
      </div>
    </>,
    document.body,
  );
}
