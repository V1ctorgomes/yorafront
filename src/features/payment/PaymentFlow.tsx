"use client";

import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckoutApiError, fetchOrder } from "@/lib/api/checkout";
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

const inputClassName =
  "w-full border border-yora-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-yora-charcoal";

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale: string }) => {
      cardForm: (options: Record<string, unknown>) => {
        getCardFormData: () => {
          token: string;
          paymentMethodId: string;
          issuerId: string;
          installments: string;
        };
      };
    };
  }
}

function PixCountdown({ expiresAt }: { expiresAt: string }) {
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
      Expira em: <span className="font-medium text-yora-charcoal">{remaining}</span>
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
  const cardFormRef = useRef<ReturnType<
    NonNullable<Window["MercadoPago"]>["prototype"]["cardForm"]
  > | null>(null);

  const publicKey =
    config?.publicKey ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ||
    "";

  const canSimulate =
    config !== null &&
    (!config.enabled || config.environment === "sandbox");

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

      if (orderData.status === "PAID") {
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
    if (
      method !== "CREDIT_CARD" ||
      !sdkReady ||
      !publicKey ||
      !order ||
      payment
    ) {
      return;
    }

    if (!window.MercadoPago) {
      return;
    }

    const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
    cardFormRef.current = mp.cardForm({
      amount: String(order.total),
      iframe: true,
      form: {
        id: "payment-card-form",
        cardNumber: {
          id: "form-checkout__cardNumber",
          placeholder: "Número do cartão",
        },
        expirationDate: {
          id: "form-checkout__expirationDate",
          placeholder: "MM/AA",
        },
        securityCode: {
          id: "form-checkout__securityCode",
          placeholder: "CVV",
        },
        cardholderName: {
          id: "form-checkout__cardholderName",
          placeholder: "Nome no cartão",
        },
        issuer: {
          id: "form-checkout__issuer",
          placeholder: "Banco emissor",
        },
        installments: {
          id: "form-checkout__installments",
          placeholder: "Parcelas",
        },
        identificationType: {
          id: "form-checkout__identificationType",
          placeholder: "Tipo de documento",
        },
        identificationNumber: {
          id: "form-checkout__identificationNumber",
          placeholder: "Número do documento",
        },
        cardholderEmail: {
          id: "form-checkout__cardholderEmail",
          placeholder: "E-mail",
        },
      },
      callbacks: {
        onFormMounted: (mountError: Error | null) => {
          if (mountError) {
            setError("Não foi possível carregar o formulário de cartão.");
          }
        },
        onSubmit: async (event: Event) => {
          event.preventDefault();
          if (!cardFormRef.current) return;

          setSubmitting(true);
          setError(null);

          try {
            const cardData = cardFormRef.current.getCardFormData();
            const created = await createPayment({
              orderNumber,
              paymentMethod: "CREDIT_CARD",
              token: cardData.token,
              paymentMethodId: cardData.paymentMethodId,
              installments: Number(cardData.installments) || 1,
              issuerId: cardData.issuerId || undefined,
            });

            setPayment(created);

            if (created.status === "APPROVED") {
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
          } finally {
            setSubmitting(false);
          }
        },
      },
    });

    return () => {
      cardFormRef.current = null;
    };
  }, [method, sdkReady, publicKey, order, payment, orderNumber, router]);

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

  const showMethodSelection = useMemo(
    () => !payment || payment.status === "REJECTED",
    [payment],
  );

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
          <p className="mt-3 text-sm text-red-700">
            Este pedido foi cancelado e não aceita novos pagamentos.
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

        {method === "PIX" && !payment && (
          <div className="space-y-4">
            <p className="text-sm text-yora-muted">
              Gere o QR Code PIX para concluir o pagamento. O código expira em
              30 minutos.
            </p>
            <Button
              type="button"
              onClick={handleCreatePixPayment}
              disabled={submitting}
            >
              {submitting ? "Gerando PIX..." : "Gerar PIX"}
            </Button>
          </div>
        )}

        {payment?.paymentMethod === "PIX" &&
          payment.status === "PENDING" &&
          payment.pix && (
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
              <PixCountdown expiresAt={payment.pix.expiresAt} />
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

        {method === "CREDIT_CARD" && !payment && publicKey && (
          <form id="payment-card-form" className="space-y-4">
            <div id="form-checkout__cardNumber" className={inputClassName} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div id="form-checkout__expirationDate" className={inputClassName} />
              <div id="form-checkout__securityCode" className={inputClassName} />
            </div>
            <div id="form-checkout__cardholderName" className={inputClassName} />
            <div id="form-checkout__issuer" className={inputClassName} />
            <div id="form-checkout__installments" className={inputClassName} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                id="form-checkout__identificationType"
                className={inputClassName}
              />
              <div
                id="form-checkout__identificationNumber"
                className={inputClassName}
              />
            </div>
            <div id="form-checkout__cardholderEmail" className={inputClassName} />
            <Button type="submit" disabled={submitting || !sdkReady}>
              {submitting ? "Processando..." : "Pagar com cartão"}
            </Button>
          </form>
        )}

        {method === "CREDIT_CARD" && !payment && !publicKey && (
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
