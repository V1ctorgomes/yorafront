"use client";

import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckoutApiError, fetchOrder } from "@/lib/api/checkout";
import { rememberPendingPaymentOrder, clearPendingPaymentOrder } from "@/features/checkout/checkout-session";
import {
  PaymentsApiError,
  createPayment,
  fetchPayment,
  fetchPaymentByOrder,
  fetchPaymentConfig,
  simulatePayment,
} from "@/lib/api/payments";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "@/lib/payment-status";
import { cn, formatPrice } from "@/lib/utils";
import type { Order, Payment, PaymentConfig, PaymentMethodType } from "@/types";

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale: string }) => {
      bricks: () => {
        create: (
          brickType: string,
          containerId: string,
          settings: Record<string, unknown>,
        ) => Promise<{ unmount: () => void }>;
      };
    };
    cardPaymentBrickController?: { unmount: () => void };
  }
}

function PaymentCountdown({ expiresAt, label }: { expiresAt: string; label: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function tick() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Expirado");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <p className="text-sm text-yora-muted">
      {label}:{" "}
      <span className="font-medium text-yora-charcoal">{remaining}</span>
    </p>
  );
}

interface PaymentFlowProps {
  orderNumber: string;
}

export function PaymentFlow({ orderNumber }: PaymentFlowProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [method, setMethod] = useState<PaymentMethodType>("PIX");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [cardFormReady, setCardFormReady] = useState(false);

  const publicKey =
    config?.publicKey ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ||
    "";

  const canSimulate =
    config !== null &&
    (!config.enabled || config.environment === "sandbox");

  const paymentWindowOpen = useMemo(
    () =>
      order?.paymentExpiresAt
        ? new Date(order.paymentExpiresAt).getTime() > Date.now()
        : true,
    [order?.paymentExpiresAt],
  );

  const isPixExpired = useMemo(
    () =>
      Boolean(
        payment?.pix?.expiresAt &&
          new Date(payment.pix.expiresAt).getTime() <= Date.now(),
      ),
    [payment?.pix?.expiresAt],
  );

  const canRetryPayment = useMemo(
    () =>
      order?.status === "WAITING_PAYMENT" &&
      paymentWindowOpen &&
      (!payment ||
        payment.status === "REJECTED" ||
        (payment.status === "PENDING" && isPixExpired)),
    [order?.status, paymentWindowOpen, payment, isPixExpired],
  );

  const showMethodSelection = useMemo(
    () =>
      canRetryPayment &&
      !(
        payment?.status === "PENDING" &&
        payment.paymentMethod === "PIX" &&
        !isPixExpired
      ),
    [canRetryPayment, payment, isPixExpired],
  );

  const canShowCardForm = useMemo(
    () => method === "CREDIT_CARD" && canRetryPayment,
    [method, canRetryPayment],
  );

  const showActivePix = useMemo(
    () =>
      payment?.paymentMethod === "PIX" &&
      payment.status === "PENDING" &&
      Boolean(payment.pix) &&
      !isPixExpired,
    [payment, isPixExpired],
  );

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [orderData, configData] = await Promise.all([
        fetchOrder(orderNumber),
        fetchPaymentConfig(),
      ]);

      setOrder(orderData);
      setConfig(configData);
      rememberPendingPaymentOrder(orderNumber);

      if (orderData.status === "PAID") {
        clearPendingPaymentOrder(orderNumber);
        router.replace(
          `/pedido/sucesso?pedido=${encodeURIComponent(orderNumber)}`,
        );
        return;
      }

      try {
        const existingPayment = await fetchPaymentByOrder(orderNumber);
        if (existingPayment) {
          setPayment(existingPayment);
          setMethod(existingPayment.paymentMethod);
        }
      } catch {
        // Pagamento anterior opcional — não bloqueia a tela
      }
    } catch (err) {
      const message =
        err instanceof CheckoutApiError || err instanceof PaymentsApiError
          ? err.message
          : "Não foi possível carregar o pagamento.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [orderNumber, router]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!payment || payment.status !== "PENDING") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await fetchPayment(payment.id);
        setPayment(updated);

        if (updated.status === "APPROVED") {
          clearPendingPaymentOrder(orderNumber);
          router.push(
            `/pedido/sucesso?pedido=${encodeURIComponent(orderNumber)}`,
          );
        }
      } catch {
        // Ignora falhas temporárias de polling
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [payment, orderNumber, router]);

  useEffect(() => {
    if (!order?.paymentExpiresAt || order.status !== "WAITING_PAYMENT") {
      return;
    }

    const interval = setInterval(async () => {
      if (new Date(order.paymentExpiresAt).getTime() > Date.now()) {
        return;
      }

      try {
        const refreshed = await fetchOrder(orderNumber);
        setOrder(refreshed);
        setPayment(null);
        clearPendingPaymentOrder(orderNumber);
      } catch {
        // Ignora falhas temporárias
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [order, orderNumber]);

  useEffect(() => {
    if (
      method !== "CREDIT_CARD" ||
      !sdkReady ||
      !publicKey ||
      !order ||
      !canShowCardForm
    ) {
      setCardFormReady(false);
      return;
    }

    const currentOrder = order;
    let cancelled = false;

    async function mountCardBrick() {
      if (!window.MercadoPago) {
        return;
      }

      const container = document.getElementById("cardPaymentBrick_container");
      if (!container) {
        return;
      }

      window.cardPaymentBrickController?.unmount();
      window.cardPaymentBrickController = undefined;

      const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
      const bricksBuilder = mp.bricks();

      try {
        window.cardPaymentBrickController = await bricksBuilder.create(
          "cardPayment",
          "cardPaymentBrick_container",
          {
            initialization: {
              amount: Number(currentOrder.total.toFixed(2)),
              payer: {
                email: currentOrder.customer.email,
              },
            },
            callbacks: {
              onReady: () => {
                if (!cancelled) {
                  setCardFormReady(true);
                  setError(null);
                }
              },
              onError: (brickError: { message?: string }) => {
                if (!cancelled) {
                  setCardFormReady(false);
                  setError(
                    brickError.message ||
                      "Não foi possível carregar o formulário de cartão.",
                  );
                }
              },
              onSubmit: async (cardFormData: {
                token: string;
                payment_method_id: string;
                issuer_id?: string;
                installments?: number;
              }) => {
                setSubmitting(true);
                setError(null);

                try {
                  const created = await createPayment({
                    orderNumber,
                    paymentMethod: "CREDIT_CARD",
                    token: cardFormData.token,
                    paymentMethodId: cardFormData.payment_method_id,
                    installments: cardFormData.installments ?? 1,
                    issuerId: cardFormData.issuer_id,
                  });

                  setPayment(created);

                  if (created.status === "APPROVED") {
                    clearPendingPaymentOrder(orderNumber);
                    router.push(
                      `/pedido/sucesso?pedido=${encodeURIComponent(orderNumber)}`,
                    );
                  }
                } catch (err) {
                  const message =
                    err instanceof PaymentsApiError
                      ? err.message
                      : "Não foi possível processar o cartão.";
                  setError(message);
                  throw err;
                } finally {
                  setSubmitting(false);
                }
              },
            },
          },
        );
      } catch {
        if (!cancelled) {
          setCardFormReady(false);
          setError("Não foi possível carregar o formulário de cartão.");
        }
      }
    }

    setCardFormReady(false);
    const timer = window.setTimeout(() => {
      void mountCardBrick();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.cardPaymentBrickController?.unmount();
      window.cardPaymentBrickController = undefined;
      setCardFormReady(false);
    };
  }, [method, sdkReady, publicKey, order, canShowCardForm, orderNumber, router]);

  async function handleCreatePixPayment() {
    setSubmitting(true);
    setError(null);

    try {
      const created = await createPayment({
        orderNumber,
        paymentMethod: "PIX",
      });
      setPayment(created);
    } catch (err) {
      const message =
        err instanceof PaymentsApiError
          ? err.message
          : "Não foi possível gerar o PIX.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSimulate(status: "APPROVED" | "REJECTED") {
    if (!payment) return;

    setSubmitting(true);
    setError(null);

    try {
      const updated = await simulatePayment(payment.id, status);
      setPayment(updated);

      if (updated.status === "APPROVED") {
        clearPendingPaymentOrder(orderNumber);
        router.push(
          `/pedido/sucesso?pedido=${encodeURIComponent(orderNumber)}`,
        );
      }
    } catch (err) {
      const message =
        err instanceof PaymentsApiError
          ? err.message
          : "Não foi possível simular o pagamento.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyPix() {
    if (!payment?.pix?.copyPaste) return;

    await navigator.clipboard.writeText(payment.pix.copyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <p className="text-sm text-yora-muted">Carregando pagamento...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
        <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-12 text-center">
          <p className="font-display text-2xl text-yora-charcoal">
            Pagamento indisponível
          </p>
          <p className="mt-3 text-sm text-yora-muted">{error}</p>
          <Button href="/" className="mt-6">
            Voltar à loja
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  if (order.status === "CANCELLED") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <div className="border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-display text-2xl text-red-800">
            Pedido cancelado
          </p>
          <p className="mt-2 text-sm text-red-700">
            O prazo de 10 minutos para pagamento expirou e o pedido foi
            cancelado. O estoque foi liberado novamente.
          </p>
          <Button href="/" className="mt-6">
            Voltar à loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {publicKey ? (
        <Script
          src="https://sdk.mercadopago.com/js/v2"
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
        />
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <div className="mb-8">
          <p className="text-xs tracking-[0.35em] text-yora-taupe uppercase">
            Pagamento
          </p>
          <h1 className="mt-3 font-display text-4xl text-yora-charcoal">
            Finalize seu pedido
          </h1>
          <p className="mt-2 text-sm text-yora-muted">
            Pedido {order.orderNumber}
          </p>
          {order.status === "WAITING_PAYMENT" && order.paymentExpiresAt && (
            <div className="mt-4">
              <PaymentCountdown
                expiresAt={order.paymentExpiresAt}
                label="Tempo restante para pagar"
              />
            </div>
          )}
          <p className="mt-3 text-xs text-yora-muted">
            Você pode sair desta página e retornar pelo mesmo link ou pelo
            número do pedido em Minha Conta.
          </p>
        </div>

        <div className="mb-8 border border-yora-charcoal/10 bg-yora-cream p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.35em] text-yora-muted uppercase">
                Total a pagar
              </p>
              <p className="mt-2 font-display text-3xl text-yora-charcoal">
                {formatPrice(order.total)}
              </p>
            </div>
            {payment && (
              <div className="text-right text-sm">
                <p className="text-yora-muted">Status</p>
                <p className="font-medium">
                  {getPaymentStatusLabel(payment.status)}
                </p>
                <p className="text-yora-muted">
                  {getPaymentMethodLabel(payment.paymentMethod)}
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {showMethodSelection && (
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            {(["PIX", "CREDIT_CARD"] as PaymentMethodType[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMethod(item);
                  setPayment(null);
                  setError(null);
                }}
                className={cn(
                  "border p-4 text-left transition-colors",
                  method === item
                    ? "border-yora-charcoal bg-yora-sand/40"
                    : "border-yora-charcoal/10 hover:border-yora-charcoal/30",
                )}
              >
                <span className="block text-sm font-medium">
                  {getPaymentMethodLabel(item)}
                </span>
                <span className="mt-1 block text-xs text-yora-muted">
                  {item === "PIX"
                    ? "Aprovação em segundos via QR Code"
                    : "Visa, Mastercard, Elo e outras bandeiras"}
                </span>
              </button>
            ))}
          </div>
        )}

        {method === "PIX" && canRetryPayment && (
          <div className="space-y-4">
            <p className="text-sm text-yora-muted">
              Gere o QR Code PIX para concluir o pagamento. O código expira em
              10 minutos.
            </p>
            <Button
              type="button"
              onClick={handleCreatePixPayment}
              disabled={submitting}
            >
              {submitting
                ? "Gerando PIX..."
                : payment
                  ? "Gerar novo PIX"
                  : "Gerar PIX"}
            </Button>
          </div>
        )}

        {showActivePix && payment?.pix && (
          <div className="space-y-6 border border-yora-charcoal/10 bg-yora-cream p-6">
            {payment.pix.qrCodeBase64 ? (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${payment.pix.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="h-56 w-56 border border-yora-charcoal/10 bg-white p-3"
                />
              </div>
            ) : null}

            <div>
              <p className="text-xs tracking-[0.35em] text-yora-muted uppercase">
                PIX Copia e Cola
              </p>
              <p className="mt-3 break-all rounded border border-yora-charcoal/10 bg-white p-3 text-xs">
                {payment.pix.copyPaste}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={handleCopyPix}
              >
                {copied ? "Copiado!" : "Copiar código PIX"}
              </Button>
            </div>

            {payment.pix.expiresAt && (
              <PaymentCountdown
                expiresAt={payment.pix.expiresAt}
                label="PIX expira em"
              />
            )}

            <p className="text-sm text-yora-muted">
              Assim que o pagamento for confirmado, você será redirecionado
              automaticamente.
            </p>

            {canSimulate && payment.status === "PENDING" && (
              <div className="flex flex-wrap gap-3 border-t border-yora-charcoal/10 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => handleSimulate("APPROVED")}
                >
                  Simular aprovação (sandbox)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => handleSimulate("REJECTED")}
                >
                  Simular recusa (sandbox)
                </Button>
              </div>
            )}
          </div>
        )}

        {canShowCardForm && publicKey && (
          <div className="space-y-4">
            {!sdkReady || !cardFormReady ? (
              <p className="text-sm text-yora-muted">
                Carregando formulário de cartão...
              </p>
            ) : null}
            <div id="cardPaymentBrick_container" className="min-h-[320px]" />
          </div>
        )}

        {method === "CREDIT_CARD" && !publicKey && (
          <div className="space-y-4">
            <p className="text-sm text-yora-muted">
              Mercado Pago não configurado. Use o modo simulado para testes.
            </p>
            <Button
              type="button"
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true);
                try {
                  const created = await createPayment({
                    orderNumber,
                    paymentMethod: "CREDIT_CARD",
                    token: "simulated",
                    paymentMethodId: "visa",
                  });
                  setPayment(created);
                  if (created.status === "APPROVED") {
                    clearPendingPaymentOrder(orderNumber);
                    router.push(
                      `/pedido/sucesso?pedido=${encodeURIComponent(orderNumber)}`,
                    );
                  }
                } catch (err) {
                  setError(
                    err instanceof PaymentsApiError
                      ? err.message
                      : "Erro ao processar pagamento simulado.",
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              Pagar com cartão (simulado)
            </Button>
          </div>
        )}

        {payment?.paymentMethod === "CREDIT_CARD" &&
          payment.status === "REJECTED" && (
            <p className="text-sm text-red-700">
              Pagamento recusado. Selecione um método e tente novamente.
            </p>
          )}

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm text-yora-muted hover:text-yora-charcoal"
          >
            Voltar à loja
          </Link>
        </div>
      </div>
    </>
  );
}
