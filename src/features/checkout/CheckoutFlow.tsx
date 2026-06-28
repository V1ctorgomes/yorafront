"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import {
  CHECKOUT_STEPS,
  SHIPPING_OPTIONS,
  getShippingOption,
  inputClassName,
  labelClassName,
} from "@/features/checkout/constants";
import { CheckoutAccessModal } from "@/features/checkout/CheckoutAccessModal";
import { CheckoutAddressStep } from "@/features/checkout/CheckoutAddressStep";
import {
  type AddressStepMode,
} from "@/features/checkout/checkout-address-utils";
import {
  clearCheckoutGuestMode,
  hasCheckoutGuestMode,
} from "@/features/checkout/checkout-session";
import { useCart } from "@/features/cart/cart-context";
import { CheckoutApiError, submitCheckout } from "@/lib/api/checkout";
import { createCustomerAddress, fetchCustomerProfile, MeApiError } from "@/lib/api/me";
import { isCustomerAuthenticated } from "@/lib/auth";
import { cn, formatPrice } from "@/lib/utils";
import type {
  CheckoutAddress,
  CheckoutCustomer,
  CheckoutPayload,
  ShippingMethod,
} from "@/types";

const initialCustomer: CheckoutCustomer = {
  name: "",
  email: "",
  phone: "",
};

const initialAddress: CheckoutAddress = {
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  country: "BR",
};

export function CheckoutFlow() {
  const router = useRouter();
  const { cart, loading, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [skipIdentification, setSkipIdentification] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [customer, setCustomer] = useState(initialCustomer);
  const [address, setAddress] = useState(initialAddress);
  const [addressStepValid, setAddressStepValid] = useState(false);
  const [addressMode, setAddressMode] = useState<AddressStepMode>("new");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("pac");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isCustomerAuthenticated()) {
      setSkipIdentification(true);
      setStep(2);
      setProfileLoading(true);

      fetchCustomerProfile()
        .then((profile) => {
          setCustomer({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
          });
        })
        .catch(() => {
          setError("Não foi possível carregar seus dados. Tente novamente.");
        })
        .finally(() => {
          setProfileLoading(false);
          setCheckoutReady(true);
        });

      return;
    }

    if (hasCheckoutGuestMode()) {
      setSkipIdentification(false);
      setStep(1);
      setCheckoutReady(true);
      return;
    }

    setAccessModalOpen(true);
  }, []);

  const visibleSteps = skipIdentification
    ? CHECKOUT_STEPS.filter((item) => item.id !== 1)
    : CHECKOUT_STEPS;

  const minStep = skipIdentification ? 2 : 1;

  const selectedShipping = getShippingOption(shippingMethod);
  const shippingPrice = selectedShipping?.price ?? 0;
  const orderTotal = cart.subtotal + shippingPrice;

  const canAdvance = useMemo(() => {
    if (step === 1) {
      return (
        customer.name.trim().length >= 2 &&
        customer.email.includes("@") &&
        customer.phone.trim().length >= 8
      );
    }

    if (step === 2) {
      return addressStepValid;
    }

    if (step === 3) {
      return Boolean(shippingMethod);
    }

    return true;
  }, [step, customer, addressStepValid, shippingMethod]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (step < 4) {
      if (canAdvance) {
        setError(null);

        if (step === 2 && skipIdentification && addressMode === "new") {
          setSubmitting(true);
          try {
            await createCustomerAddress({
              recipient: customer.name.trim(),
              zipCode: address.zipCode.trim(),
              street: address.street.trim(),
              number: address.number.trim(),
              complement: address.complement?.trim() || undefined,
              district: address.district.trim(),
              city: address.city.trim(),
              state: address.state.trim(),
              country: address.country?.trim() || "BR",
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
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      address: {
        zipCode: address.zipCode.trim(),
        street: address.street.trim(),
        number: address.number.trim(),
        complement: address.complement?.trim() || undefined,
        district: address.district.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        country: address.country?.trim() || "BR",
      },
      shippingMethod,
    };

    setSubmitting(true);
    setError(null);

    try {
      const order = await submitCheckout(payload);
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

  if (loading || (isCustomerAuthenticated() && profileLoading) || !checkoutReady) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <p className="text-sm text-yora-muted">Carregando checkout...</p>
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

  if (accessModalOpen) {
    return (
      <CheckoutAccessModal
        open
        allowClose
        onClose={() => router.push("/carrinho")}
        onGuestContinue={() => {
          setCheckoutGuestMode();
          setAccessModalOpen(false);
          setSkipIdentification(false);
          setStep(1);
          setCheckoutReady(true);
        }}
      />
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
            <CheckoutAddressStep
              loggedIn={skipIdentification}
              address={address}
              onAddressChange={setAddress}
              onModeChange={setAddressMode}
              onValidChange={setAddressStepValid}
            />
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
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((option) => (
                  <label
                    key={option.method}
                    className={cn(
                      "flex cursor-pointer items-start gap-4 border p-4 transition-colors",
                      shippingMethod === option.method
                        ? "border-yora-charcoal bg-yora-sand/40"
                        : "border-yora-charcoal/10 hover:border-yora-charcoal/30",
                    )}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={option.method}
                      checked={shippingMethod === option.method}
                      onChange={() => setShippingMethod(option.method)}
                      className="mt-1"
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-yora-charcoal">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm text-yora-muted">
                        {option.estimatedDays}
                      </span>
                    </span>
                    <span className="text-sm font-medium">
                      {option.price === 0
                        ? "Grátis"
                        : formatPrice(option.price)}
                    </span>
                  </label>
                ))}
              </div>
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
                  {selectedShipping?.label} —{" "}
                  {shippingPrice === 0
                    ? "Grátis"
                    : formatPrice(shippingPrice)}
                </p>
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
            <div className="flex justify-between">
              <span className="text-yora-muted">Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yora-muted">Frete</span>
              <span>
                {shippingPrice === 0 ? "Grátis" : formatPrice(shippingPrice)}
              </span>
            </div>
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
