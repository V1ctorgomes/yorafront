"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types";

interface HeroBannerProps {
  banner: Banner;
  priority?: boolean;
}

export function HeroBanner({ banner, priority = false }: HeroBannerProps) {
  const desktopImage = banner.imageUrl;
  const mobileImage = banner.mobileImageUrl ?? banner.imageUrl;

  return (
    <div className="relative h-[70vh] min-h-[480px] w-full overflow-hidden md:h-[85vh]">
      <Image
        src={desktopImage}
        alt={banner.title}
        fill
        priority={priority}
        className="hidden object-cover object-center md:block"
        sizes="100vw"
      />
      <Image
        src={mobileImage}
        alt={banner.title}
        fill
        priority={priority}
        className="object-cover object-center md:hidden"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-yora-charcoal/60 via-yora-charcoal/30 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 md:px-6 md:pb-24 lg:px-8">
        <p className="mb-3 text-xs tracking-[0.35em] text-yora-cream/80 uppercase">
          Drop exclusivo
        </p>
        <h1 className="max-w-xl font-display text-4xl leading-tight text-yora-cream md:text-6xl lg:text-7xl">
          {banner.title}
        </h1>
        {banner.subtitle && (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-yora-cream/90 md:text-base">
            {banner.subtitle}
          </p>
        )}
        {banner.buttonText && banner.buttonLink && (
          <div className="mt-8">
            <Button
              href={banner.buttonLink}
              variant="outline"
              size="lg"
              className="border-yora-cream text-yora-cream hover:bg-yora-cream hover:text-yora-charcoal"
            >
              {banner.buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface HeroBannerCarouselProps {
  banners: Banner[];
}

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = banners.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, 8000);

    return () => clearInterval(timer);
  }, [total]);

  if (total === 0) return null;

  return (
    <section className="relative">
      <HeroBanner banner={banners[activeIndex]} priority={activeIndex === 0} />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 p-2 text-yora-cream/80 transition-colors hover:text-yora-cream"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 p-2 text-yora-cream/80 transition-colors hover:text-yora-cream"
            aria-label="Próximo banner"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  index === activeIndex
                    ? "bg-yora-cream"
                    : "bg-yora-cream/40 hover:bg-yora-cream/70",
                )}
                aria-label={`Ir para banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function HeroBannerEmpty() {
  return (
    <section className="relative flex h-[50vh] min-h-[360px] items-center justify-center bg-gradient-to-br from-yora-sand to-yora-cream">
      <div className="mx-auto max-w-lg px-6 text-center">
        <p className="text-xs tracking-[0.35em] text-yora-taupe uppercase">
          Yora
        </p>
        <h1 className="mt-4 font-display text-3xl text-yora-charcoal md:text-5xl">
          Novidades em breve
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-yora-muted">
          Estamos preparando algo especial. Enquanto isso, explore nossas
          coleções e produtos em destaque.
        </p>
      </div>
    </section>
  );
}
