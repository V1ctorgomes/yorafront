"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  CHECKOUT_STEPS,
  inputClassName,
  labelClassName,
} from "@/features/checkout/constants";
import { CheckoutAccessModal } from "@/features/checkout/CheckoutAccessModal";
import { CheckoutAddressStep } from "@/features/checkout/CheckoutAddressStep";
import { CheckoutShippingStep } from "@/features/checkout/CheckoutShippingStep";
import {
  type AddressStepMode,
} from "@/features/checkout/checkout-address-utils";
import {
  clearCheckoutGuestMode,
  hasCheckoutGuestMode,
  rememberPendingPaymentOrder,
  setCheckoutGuestMode,
} from "@/features/checkout/checkout-session";
import { useCart } from "@/features/cart/cart-context";
import { CheckoutApiError, submitCheckout } from "@/lib/api/checkout";
import { createCustomerAddress, fetchCustomerProfile, MeApiError } from "@/lib/api/me";
import { validatePromotion } from "@/lib/api/promotions";
import { isCustomerAuthenticated, clearCustomerTokens } from "@/lib/auth";
import { formatCpfInput, isValidCpf } from "@/lib/cpf";
import { cn, formatPrice } from "@/lib/utils";
import type {
  CheckoutAddress,
  CheckoutCustomer,
  CheckoutPayload,
  PromotionValidationResult,
  ShippingQuote,
} from "@/types";

const initialCustomer: CheckoutCustomer = {
  name: "",
  cpf: "",
  email: "",
  phone: "",
};

const initialAddress: CheckoutAddress = {
  recipientName: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  country: "BR",
  reference: "",
};

export function CheckoutFlow() {
  const router = useRouter();
  const { cart, loading, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [skipIdentification, setSkipIdentification] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [customer, setCustomer] = useState(initialCustomer);
  const [address, setAddress] = useState(initialAddress);
  const [addressStepValid, setAddressStepValid] = useState(false);
  const [addressMode, setAddressMode] = useState<AddressStepMode>("new");
  const [selectedShipping, setSelectedShipping] = useState<ShippingQuote | null>(
    null,
  );
  const [shippingLoading, setShippingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [cpfPending, setCpfPending] = useState(false);
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotionCode, setAppliedPromotionCode] = useState("");
  const [promotionPreview, setPromotionPreview] =
    useState<PromotionValidationResult | null>(null);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionMessage, setPromotionMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapCheckoutSession() {
      if (isCustomerAuthenticated()) {
        setSkipIdentification(true);
        setStep(2);
        setProfileLoading(true);

        try {
          const profile = await fetchCustomerProfile();
          if (cancelled) return;

          setCustomerId(profile.id);
          setCpfPending(profile.cpfPending);
          setCustomer({
            name: profile.name,
            cpf: profile.cpf ?? "",
            email: profile.email,
            phone: profile.phone,
          });
        } catch {
          if (cancelled) return;

          clearCustomerTokens();
          setSkipIdentification(false);
          setStep(1);
          setCpfPending(false);
          setCustomer(initialCustomer);

          if (!hasCheckoutGuestMode()) {
            setAccessModalOpen(true);
          }
        } finally {
          if (!cancelled) {
            setProfileLoading(false);
            setSessionResolved(true);
          }
        }

        return;
      }

      if (hasCheckoutGuestMode()) {
        setSkipIdentification(false);
        setStep(1);
        setSessionResolved(true);
        return;
      }

      setAccessModalOpen(true);
      setSessionResolved(true);
    }

    void bootstrapCheckoutSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleSteps = skipIdentification
    ? CHECKOUT_STEPS.filter((item) => item.id !== 1)
    : CHECKOUT_STEPS;

  const minStep = skipIdentification ? 2 : 1;

  const shippingPrice = selectedShipping?.price ?? 0;
  const discountAmount =
    promotionPreview?.valid ? promotionPreview.discountAmount : 0;
  const effectiveShippingPrice = promotionPreview?.valid
    ? promotionPreview.shippingPrice
    : shippingPrice;
  const orderTotal = promotionPreview?.valid
    ? promotionPreview.total
    : cart.subtotal + shippingPrice;

  useEffect(() => {
    if (!selectedShipping || cart.items.length === 0) {
      setPromotionPreview(null);
      setPromotionMessage(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPromotionLoading(true);
      try {
        const result = await validatePromotion({
          code: appliedPromotionCode.trim() || undefined,
          customerId: customerId ?? undefined,
          cartItems: cart.items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          })),
          shippingPrice: selectedShipping.price,
        });

        if (cancelled) return;

        setPromotionPreview(result);

        if (appliedPromotionCode.trim()) {
          setPromotionMessage(
            result.valid
              ? `Cupom ${appliedPromotionCode.trim().toUpperCase()} aplicado`
              : (result.reason ?? "Cupom inválido"),
          );
        } else if (result.valid && result.promotion?.applicationType === "AUTOMATIC") {
          setPromotionMessage(result.promotion.name);
        } else {
          setPromotionMessage(null);
        }
      } catch {
        if (!cancelled) {
          setPromotionPreview(null);
          setPromotionMessage("Não foi possível validar o cupom");
        }
      } finally {
        if (!cancelled) {
          setPromotionLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    selectedShipping,
    cart.items,
    appliedPromotionCode,
    customerId,
    cart.subtotal,
  ]);

  function handleApplyCoupon() {
    setAppliedPromotionCode(promotionCode.trim().toUpperCase());
    setPromotionMessage(null);
  }

  const canAdvance = useMemo(() => {
    if (step === 1) {
      return (
        customer.name.trim().length >= 2 &&
        isValidCpf(customer.cpf) &&
        customer.email.includes("@") &&
        customer.phone.trim().length >= 8
      );
    }

    if (step === 2) {
      const cpfReady = !cpfPending || isValidCpf(customer.cpf);
      return addressStepValid && cpfReady;
    }

    if (step === 3) {
      return Boolean(selectedShipping) && !shippingLoading;
    }

    return true;
  }, [step, customer, cpfPending, addressStepValid, selectedShipping, shippingLoading]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (step < 4) {
      if (canAdvance) {
        setError(null);

        if (step === 2 && skipIdentification && addressMode === "new") {
          setSubmitting(true);
          try {
            await createCustomerAddress({
              recipient: address.recipientName.trim(),
              zipCode: address.zipCode.trim(),
              street: address.street.trim(),
              number: address.number.trim(),
              complement: address.complement?.trim() || undefined,
              district: address.district.trim(),
              city: address.city.trim(),
              state: address.state.trim(),
              country: address.country?.trim() || "BR",
              reference: address.reference?.trim() || undefined,
            });
          } catch (err) {
            const message =
              err instanceof MeApiError
                ? err.message
                : "Não foi possível salvar o endereço. Tente novamente.";
            setError(message);
            setSubmitting(false);
            return;
          }
          setSubmitting(false);
        }

        setStep((current) => current + 1);
      }
      return;
    }

    const payload: CheckoutPayload = {
      customer: {
        name: customer.name.trim(),
        cpf: customer.cpf.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      address: {
        recipientName: address.recipientName.trim(),
        zipCode: address.zipCode.trim(),
        street: address.street.trim(),
        number: address.number.trim(),
        complement: address.complement?.trim() || undefined,
        district: address.district.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        country: address.country?.trim() || "BR",
        reference: address.reference?.trim() || undefined,
      },
      shippingMethodId: selectedShipping!.shippingMethodId,
      ...(appliedPromotionCode.trim()
        ? { promotionCode: appliedPromotionCode.trim().toUpperCase() }
        : {}),
    };

    if (
      appliedPromotionCode.trim() &&
      promotionPreview &&
      !promotionPreview.valid
    ) {
      setError(promotionPreview.reason ?? "Cupom inválido");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await submitCheckout(payload);
      rememberPendingPaymentOrder(order.orderNumber);
      clearCheckoutGuestMode();
      await clearCart();
      router.push(`/pagamento/${encodeURIComponent(order.orderNumber)}`);
    } catch (err) {
      const message =
        err instanceof CheckoutApiError
          ? err.message
          : "Não foi possível finalizar o pedido. Tente novamente.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!sessionResolved || (skipIdentification && profileLoading)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <p className="text-sm text-yora-muted">Carregando checkout...</p>
      </div>
    );
  }

  if (accessModalOpen) {
    return (
      <CheckoutAccessModal
        open
        allowClose
        onClose={() => router.push("/carrinho")}
        onGuestContinue={() => {
          setAccessModalOpen(false);
          setSkipIdentification(false);
          setStep(1);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <p className="text-sm text-yora-muted">Carregando carrinho...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
        <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-12 text-center">
          <p className="font-display text-2xl text-yora-charcoal">
            Seu carrinho está vazio
          </p>
          <p className="mt-3 text-sm text-yora-muted">
            Adicione produtos antes de finalizar a compra.
          </p>
          <Button href="/" className="mt-6">
            Continuar comprando
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="mb-10">
        <h1 className="font-display text-4xl text-yora-charcoal">Checkout</h1>
        <p className="mt-2 text-sm text-yora-muted">
          Finalize seu pedido em poucos passos.
        </p>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        {visibleSteps.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "rounded-full border px-4 py-2 text-xs tracking-widest uppercase",
              step === item.id
                ? "border-yora-charcoal bg-yora-charcoal text-yora-cream"
                : step > item.id
                  ? "border-yora-taupe text-yora-taupe"
                  : "border-yora-charcoal/15 text-yora-muted",
            )}
          >
            {index + 1}. {item.label}
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && !skipIdentification && (
            <section className="space-y-5">
              <div>
                <h2 className="font-display text-2xl text-yora-charcoal">
                  Identificação
                </h2>
                <p className="mt-2 text-sm text-yora-muted">
                  Informe seus dados para acompanhar o pedido.
                </p>
              </div>
              <div>
                <label className={labelClassName}>Nome *</label>
                <input
                  className={inputClassName}
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className={labelClassName}>CPF *</label>
                <input
                  className={inputClassName}
                  placeholder="000.000.000-00"
                  value={customer.cpf}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      cpf: formatCpfInput(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className={labelClassName}>E-mail *</label>
                <input
                  type="email"
                  className={inputClassName}
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className={labelClassName}>Telefone *</label>
                <input
                  type="tel"
                  className={inputClassName}
                  placeholder="(11) 99999-9999"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  required
                />
              </div>
            </section>
          )}

          {step === 2 && (
            <>
              {skipIdentification && cpfPending && (
                <section className="space-y-3 rounded border border-amber-200 bg-amber-50 p-4">
                  <div>
                    <h3 className="font-medium text-yora-charcoal">
                      Informe seu CPF
                    </h3>
                    <p className="mt-1 text-sm text-yora-muted">
                      Precisamos do CPF para emissão de etiquetas e documentos
                      fiscais.
                    </p>
                  </div>
                  <div>
                    <label className={labelClassName}>CPF *</label>
                    <input
                      className={inputClassName}
                      placeholder="000.000.000-00"
                      value={customer.cpf}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          cpf: formatCpfInput(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </section>
              )}
              <CheckoutAddressStep
                loggedIn={skipIdentification}
                address={address}
                onAddressChange={setAddress}
                onModeChange={setAddressMode}
                onValidChange={setAddressStepValid}
              />
            </>
          )}

          {step === 3 && (
            <section className="space-y-5">
              <div>
                <h2 className="font-display text-2xl text-yora-charcoal">
                  Entrega
                </h2>
                <p className="mt-2 text-sm text-yora-muted">
                  Escolha como deseja receber seu pedido.
                </p>
              </div>
              <CheckoutShippingStep
                zipCode={address.zipCode}
                cartItems={cart.items}
                selectedMethodId={selectedShipping?.shippingMethodId ?? null}
                onSelect={setSelectedShipping}
                onLoadingChange={setShippingLoading}
              />
            </section>
          )}

          {step === 4 && (
            <section className="space-y-6">
              <div>
                <h2 className="font-display text-2xl text-yora-charcoal">
                  Resumo do pedido
                </h2>
                <p className="mt-2 text-sm text-yora-muted">
                  Revise os dados antes de confirmar a compra.
                </p>
              </div>

              <div className="border border-yora-charcoal/10 bg-yora-cream p-5 text-sm">
                <h3 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
                  Cliente
                </h3>
                <p className="mt-3">{customer.name}</p>
                <p className="text-yora-muted">{customer.email}</p>
                <p className="text-yora-muted">{customer.phone}</p>
              </div>

              <div className="border border-yora-charcoal/10 bg-yora-cream p-5 text-sm">
                <h3 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
                  Endereço
                </h3>
                <p className="mt-3">
                  {address.street}, {address.number}
                  {address.complement ? ` - ${address.complement}` : ""}
                </p>
                <p className="text-yora-muted">
                  {address.district}, {address.city} - {address.state}
                </p>
                <p className="text-yora-muted">CEP {address.zipCode}</p>
              </div>

              <div className="border border-yora-charcoal/10 bg-yora-cream p-5 text-sm">
                <h3 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
                  Entrega
                </h3>
                <p className="mt-3">
                  {selectedShipping?.service} —{" "}
                  {effectiveShippingPrice === 0
                    ? "Grátis"
                    : formatPrice(effectiveShippingPrice)}
                </p>
                {selectedShipping && (
                  <p className="mt-1 text-yora-muted">
                    Prazo estimado:{" "}
                    {selectedShipping.deadline <= 1
                      ? "1 dia útil"
                      : `${selectedShipping.deadline} dias úteis`}
                  </p>
                )}
              </div>
            </section>
          )}

          {error && (
            <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {step > minStep && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError(null);
                  setStep((current) => current - 1);
                }}
                disabled={submitting}
              >
                Voltar
              </Button>
            )}
            <Button type="submit" disabled={!canAdvance || submitting}>
              {step === 4
                ? submitting
                  ? "Finalizando..."
                  : "Finalizar Pedido"
                : submitting
                  ? "Salvando..."
                  : "Continuar"}
            </Button>
            <Link
              href="/carrinho"
              className="inline-flex items-center px-2 text-sm text-yora-muted hover:text-yora-charcoal"
            >
              Voltar ao carrinho
            </Link>
          </div>
        </form>

        <aside className="h-fit border border-yora-charcoal/10 bg-yora-cream p-6">
          <h2 className="text-xs tracking-[0.35em] text-yora-muted uppercase">
            Seu pedido
          </h2>
          <div className="mt-5 space-y-4">
            {cart.items.map((item) => (
              <div key={item.productVariantId} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-yora-sand">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{item.productName}</p>
                  <p className="text-yora-muted">
                    {item.color} / {item.size}
                  </p>
                  <p className="text-yora-muted">
                    {item.quantity}x {formatPrice(item.unitPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t border-yora-charcoal/10 pt-4 text-sm">
            {step >= 3 && selectedShipping && (
              <div className="space-y-2 pb-3">
                <label className={labelClassName}>Cupom de desconto</label>
                <div className="flex gap-2">
                  <input
                    className={inputClassName}
                    value={promotionCode}
                    onChange={(e) =>
                      setPromotionCode(e.target.value.toUpperCase())
                    }
                    placeholder="Ex: WELCOME10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={promotionLoading || !promotionCode.trim()}
                  >
                    Aplicar
                  </Button>
                </div>
                {promotionLoading && (
                  <p className="text-xs text-yora-muted">Validando cupom...</p>
                )}
                {promotionMessage && (
                  <p
                    className={cn(
                      "text-xs",
                      promotionPreview?.valid
                        ? "text-green-700"
                        : "text-red-600",
                    )}
                  >
                    {promotionMessage}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-yora-muted">Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yora-muted">Frete</span>
              <span>
                {effectiveShippingPrice === 0
                  ? "Grátis"
                  : formatPrice(effectiveShippingPrice)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>
                  Desconto
                  {promotionPreview?.promotion?.code
                    ? ` (${promotionPreview.promotion.code})`
                    : promotionPreview?.promotion?.name
                      ? ` (${promotionPreview.promotion.name})`
                      : ""}
                </span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-yora-charcoal/10 pt-3 text-base font-medium">
              <span>Total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
