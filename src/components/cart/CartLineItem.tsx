"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";

interface CartLineItemProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  compact?: boolean;
}

export function CartLineItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  compact = false,
}: CartLineItemProps) {
  const canIncrease =
    item.maxStock === undefined || item.quantity < item.maxStock;

  return (
    <article className={compact ? "flex gap-3" : "flex gap-4 border-b border-yora-charcoal/10 pb-6"}>
      <Link
        href={`/produto/${item.productSlug}`}
        className={`relative shrink-0 overflow-hidden bg-yora-sand ${
          compact ? "h-20 w-16" : "h-28 w-24"
        }`}
      >
        <Image
          src={item.imageUrl}
          alt={item.productName}
          fill
          className="object-cover"
          sizes={compact ? "64px" : "96px"}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/produto/${item.productSlug}`}
          className="text-sm tracking-wide text-yora-charcoal transition-colors hover:text-yora-taupe"
        >
          {item.productName}
        </Link>
        <p className="mt-1 text-xs text-yora-muted">
          {item.color} · {item.size}
        </p>
        <p className="mt-2 text-sm font-medium text-yora-charcoal">
          {formatPrice(item.unitPrice)}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center border border-yora-charcoal/15">
            <button
              type="button"
              onClick={onDecrease}
              className="p-2 text-yora-charcoal hover:bg-yora-sand"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={!canIncrease}
              className="p-2 text-yora-charcoal hover:bg-yora-sand disabled:opacity-40"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!compact && (
              <p className="text-sm font-medium text-yora-charcoal">
                {formatPrice(item.subtotal)}
              </p>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-yora-muted transition-colors hover:text-red-600"
              aria-label="Remover item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
