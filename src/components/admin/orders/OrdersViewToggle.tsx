"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrdersViewMode = "kanban" | "list";

interface OrdersViewToggleProps {
  value: OrdersViewMode;
  onChange: (value: OrdersViewMode) => void;
}

export function OrdersViewToggle({ value, onChange }: OrdersViewToggleProps) {
  return (
    <div className="inline-flex border border-yora-charcoal/15 bg-yora-cream p-1">
      <button
        type="button"
        onClick={() => onChange("kanban")}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 text-sm transition-colors",
          value === "kanban"
            ? "bg-yora-charcoal text-yora-cream"
            : "text-yora-muted hover:text-yora-charcoal",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Kanban
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 text-sm transition-colors",
          value === "list"
            ? "bg-yora-charcoal text-yora-cream"
            : "text-yora-muted hover:text-yora-charcoal",
        )}
      >
        <List className="h-4 w-4" />
        Lista
      </button>
    </div>
  );
}
