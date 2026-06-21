import { cn } from "@/lib/utils";
import type { ProductBadge } from "@/types";

interface BadgeProps {
  type: ProductBadge;
  className?: string;
}

const badgeConfig: Record<
  ProductBadge,
  { label: string; className: string }
> = {
  new: {
    label: "Novo",
    className: "bg-yora-charcoal text-yora-cream",
  },
  sale: {
    label: "Promoção",
    className: "bg-yora-rose text-yora-cream",
  },
  "sold-out": {
    label: "Esgotado",
    className: "bg-yora-muted/20 text-yora-muted",
  },
};

export function Badge({ type, className }: BadgeProps) {
  const config = badgeConfig[type];

  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
