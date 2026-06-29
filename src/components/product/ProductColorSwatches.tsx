"use client";

import { getSwatchHex, isLightSwatch } from "@/lib/product-colors";
import { cn } from "@/lib/utils";

interface ProductColorSwatchesProps {
  colors: string[];
  selectedColor: string | null;
  onSelect: (color: string) => void;
  className?: string;
}

export function ProductColorSwatches({
  colors,
  selectedColor,
  onSelect,
  className,
}: ProductColorSwatchesProps) {
  if (colors.length < 2) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2.5", className)}
      role="listbox"
      aria-label="Cores disponíveis"
    >
      {colors.map((color) => {
        const hex = getSwatchHex(color);
        const isSelected = selectedColor === color;
        const isLight = isLightSwatch(color);

        return (
          <button
            key={color}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-label={`Cor ${color}`}
            title={color}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect(color);
            }}
            className={cn(
              "h-5 w-5 shrink-0 rounded-full transition-transform hover:scale-110",
              isLight ? "border border-yora-charcoal/20" : "border border-transparent",
              isSelected
                ? "ring-2 ring-yora-charcoal ring-offset-2 ring-offset-white"
                : "ring-1 ring-transparent",
            )}
            style={{ backgroundColor: hex }}
          />
        );
      })}
    </div>
  );
}
