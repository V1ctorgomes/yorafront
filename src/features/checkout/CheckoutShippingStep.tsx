"use client";

import { useEffect, useRef, useState } from "react";
import { calculateShipping, ShippingApiError } from "@/lib/api/shipping";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem, ShippingQuote } from "@/types";

interface CheckoutShippingStepProps {
  zipCode: string;
  cartItems: CartItem[];
  selectedMethodId: string | null;
  onSelect: (quote: ShippingQuote) => void;
  onLoadingChange?: (loading: boolean) => void;
}

function formatDeadline(days: number) {
  if (days <= 1) {
    return "Disponível em 1 dia útil";
  }

  return `${days} dias úteis`;
}

export function CheckoutShippingStep({
  zipCode,
  cartItems,
  selectedMethodId,
  onSelect,
  onLoadingChange,
}: CheckoutShippingStepProps) {
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedMethodIdRef = useRef(selectedMethodId);
  selectedMethodIdRef.current = selectedMethodId;

  useEffect(() => {
    const normalizedZip = zipCode.replace(/\D/g, "");

    if (normalizedZip.length !== 8 || cartItems.length === 0) {
      setQuotes([]);
      setLoading(false);
      setError("Informe um CEP válido no passo anterior.");
      onLoadingChange?.(false);
      return;
    }

    let cancelled = false;

    async function loadQuotes() {
      setLoading(true);
      setError(null);
      onLoadingChange?.(true);

      try {
        const result = await calculateShipping(
          normalizedZip,
          cartItems.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          })),
        );

        if (cancelled) return;

        setQuotes(result);

        if (result.length > 0) {
          const currentStillValid = result.some(
            (quote) =>
              quote.shippingMethodId === selectedMethodIdRef.current,
          );

          if (!currentStillValid) {
            onSelect(result[0]);
          }
        }
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof ShippingApiError
            ? err.message
            : "Não foi possível calcular o frete.";
        setQuotes([]);
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
    }

    loadQuotes();

    return () => {
      cancelled = true;
    };
  }, [zipCode, cartItems, onLoadingChange]);

  if (loading) {
    return (
      <p className="text-sm text-yora-muted">Calculando opções de entrega...</p>
    );
  }

  if (error) {
    return (
      <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (quotes.length === 0) {
    return (
      <p className="text-sm text-yora-muted">
        Nenhuma opção de frete disponível para este CEP.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {quotes.map((quote) => (
        <label
          key={quote.shippingMethodId}
          className={cn(
            "flex cursor-pointer items-start gap-4 border p-4 transition-colors",
            selectedMethodId === quote.shippingMethodId
              ? "border-yora-charcoal bg-yora-sand/40"
              : "border-yora-charcoal/10 hover:border-yora-charcoal/30",
          )}
        >
          <input
            type="radio"
            name="shippingMethodId"
            value={quote.shippingMethodId}
            checked={selectedMethodId === quote.shippingMethodId}
            onChange={() => onSelect(quote)}
            className="mt-1"
          />
          <span className="flex-1">
            <span className="block text-sm font-medium text-yora-charcoal">
              {quote.service}
            </span>
            <span className="mt-1 block text-xs text-yora-muted">
              {quote.provider}
            </span>
            <span className="mt-1 block text-sm text-yora-muted">
              {formatDeadline(quote.deadline)}
            </span>
          </span>
          <span className="text-sm font-medium">
            {quote.price === 0 ? "Grátis" : formatPrice(quote.price)}
          </span>
        </label>
      ))}
    </div>
  );
}
