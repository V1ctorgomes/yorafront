import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types";

interface CollectionCardProps {
  collection: Collection;
  variant?: "banner" | "carousel";
  isExpanded?: boolean;
  isDimmed?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

export function CollectionCard({
  collection,
  variant = "banner",
  isExpanded = false,
  isDimmed = false,
  onMouseEnter,
  onMouseLeave,
  className,
}: CollectionCardProps) {
  const isCarousel = variant === "carousel";

  return (
    <Link
      href={`/colecao/${collection.slug}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "group relative block overflow-hidden bg-yora-sand",
        isCarousel
          ? "aspect-[3/4] h-[min(520px,62vh)] transition-[flex-grow,flex-shrink,filter,box-shadow] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:aspect-auto md:h-[min(560px,68vh)]"
          : "aspect-[16/10] md:aspect-[21/9]",
        isDimmed && "brightness-[0.92]",
        isExpanded && "brightness-100 shadow-xl ring-1 ring-yora-charcoal/10",
        className,
      )}
    >
      <Image
        src={collection.bannerImageUrl}
        alt={collection.name}
        fill
        className={cn(
          "object-cover ease-out",
          isCarousel
            ? "transition-transform duration-[910ms]"
            : "transition-transform duration-700",
          isExpanded ? "scale-110" : "group-hover:scale-105",
        )}
        sizes={
          isCarousel
            ? "(max-width: 768px) 90vw, 33vw"
            : "(max-width: 768px) 100vw, 50vw"
        }
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-yora-charcoal/80 via-yora-charcoal/25 to-transparent transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)]",
          isCarousel ? "duration-[650ms]" : "duration-500",
          isExpanded && "from-yora-charcoal/85 via-yora-charcoal/35",
        )}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 p-5 md:p-7",
          isCarousel
            ? "transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            : "transition-all duration-500",
          isExpanded && "pb-7 md:pb-9",
        )}
      >
        <p
          className={cn(
            "text-xs tracking-[0.35em] text-yora-cream/80 uppercase",
            isCarousel
              ? "transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "transition-all duration-500",
            isExpanded && "tracking-[0.45em]",
          )}
        >
          Coleção
        </p>
        <h3
          className={cn(
            "mt-2 font-display text-yora-cream",
            isCarousel
              ? "transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "transition-all duration-500",
            isCarousel
              ? "text-2xl md:text-3xl"
              : "text-3xl md:text-4xl",
            isExpanded && isCarousel && "text-3xl md:text-[2.75rem]",
          )}
        >
          {collection.name}
        </h3>
        {collection.description && isCarousel && (
          <p
            className={cn(
              "mt-2 line-clamp-2 text-sm leading-relaxed text-yora-cream/85 transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              isExpanded
                ? "max-h-24 opacity-100"
                : "max-h-0 overflow-hidden opacity-0",
            )}
          >
            {collection.description}
          </p>
        )}
        <span
          className={cn(
            "mt-3 inline-block text-xs tracking-widest text-yora-cream/90 uppercase",
            isCarousel
              ? "transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "transition-all duration-500",
            isExpanded || !isCarousel
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          Ver coleção →
        </span>
      </div>
    </Link>
  );
}
