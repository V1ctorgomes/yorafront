"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CollectionCard } from "@/components/home/CollectionCard";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types";

const VISIBLE_COUNT = 3;

interface CollectionsCarouselProps {
  collections: Collection[];
}

export function CollectionsCarousel({ collections }: CollectionsCarouselProps) {
  const [page, setPage] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const maxPage = Math.max(0, collections.length - VISIBLE_COUNT);
  const canGoPrev = page > 0;
  const canGoNext = page < maxPage;
  const visible = collections.slice(page, page + VISIBLE_COUNT);
  const showNav = collections.length > VISIBLE_COUNT;

  useEffect(() => {
    setPage((current) => Math.min(current, maxPage));
  }, [maxPage]);

  const changePage = useCallback(
    (nextPage: number) => {
      if (isTransitioning || nextPage === page) return;
      if (nextPage < 0 || nextPage > maxPage) return;

      setHoveredIndex(null);
      setIsTransitioning(true);

      window.setTimeout(() => {
        setPage(nextPage);
        setIsTransitioning(false);
      }, 280);
    },
    [isTransitioning, maxPage, page],
  );

  if (collections.length === 0) return null;

  return (
    <div className="relative">
      {showNav && (
        <button
          type="button"
          onClick={() => changePage(page - 1)}
          onMouseEnter={() => setHoveredIndex(0)}
          onMouseLeave={() => setHoveredIndex(null)}
          disabled={!canGoPrev || isTransitioning}
          className={cn(
            "absolute top-1/2 -left-4 z-10 -translate-y-1/2 p-2 transition-colors",
            canGoPrev
              ? "text-yora-charcoal/70 hover:text-yora-charcoal"
              : "cursor-not-allowed text-yora-charcoal/20",
          )}
          aria-label="Coleções anteriores"
        >
          <ChevronLeft className="h-7 w-7" strokeWidth={1.5} />
        </button>
      )}

      <div
        className={cn(
          "flex gap-5 transition-all duration-300 ease-out",
          isTransitioning && "scale-[0.98] opacity-0",
        )}
      >
        {visible.map((collection, index) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            variant="carousel"
            isExpanded={hoveredIndex === index}
            isDimmed={hoveredIndex !== null && hoveredIndex !== index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              "min-w-0 transition-[flex-grow,flex-shrink] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              hoveredIndex === null && "flex-1",
              hoveredIndex === index && "flex-[1.75]",
              hoveredIndex !== null &&
                hoveredIndex !== index &&
                "flex-[0.65]",
            )}
          />
        ))}
      </div>

      {showNav && (
        <button
          type="button"
          onClick={() => changePage(page + 1)}
          onMouseEnter={() => setHoveredIndex(visible.length - 1)}
          onMouseLeave={() => setHoveredIndex(null)}
          disabled={!canGoNext || isTransitioning}
          className={cn(
            "absolute top-1/2 -right-4 z-10 -translate-y-1/2 p-2 transition-colors",
            canGoNext
              ? "text-yora-charcoal/70 hover:text-yora-charcoal"
              : "cursor-not-allowed text-yora-charcoal/20",
          )}
          aria-label="Próximas coleções"
        >
          <ChevronRight className="h-7 w-7" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
