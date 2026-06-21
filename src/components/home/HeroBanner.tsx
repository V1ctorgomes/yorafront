"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types";

const SLIDE_DURATION_MS = 9000;
const CONTENT_EXIT_MS = 550;
const SLIDE_ANIMATION_MS = 1400;

type SlideDirection = "next" | "prev";
type ContentPhase = "visible" | "exiting" | "entering";

function getSlideDirection(
  from: number,
  to: number,
  total: number,
): SlideDirection {
  if (from === to) return "next";

  const forward = (to - from + total) % total;
  const backward = (from - to + total) % total;

  return forward <= backward ? "next" : "prev";
}

interface AnimatedBannerTitleProps {
  text: string;
}

function AnimatedBannerTitle({ text }: AnimatedBannerTitleProps) {
  return (
    <h1 className="max-w-xl font-display text-4xl leading-tight text-yora-cream md:text-6xl lg:text-7xl">
      {text.split("").map((char, index) => (
        <span
          key={`${text}-${index}-${char}`}
          className="animate-banner-char inline-block"
          style={{ animationDelay: `${120 + index * 35}ms` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h1>
  );
}

interface HeroBannerContentProps {
  banner: Banner;
  phase: ContentPhase;
}

function HeroBannerContent({ banner, phase }: HeroBannerContentProps) {
  const isExiting = phase === "exiting";

  return (
    <div
      className={cn(
        "relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 md:px-6 md:pb-24 lg:px-8",
        isExiting && "animate-banner-content-out",
      )}
    >
      <p
        className={cn(
          "mb-3 text-xs tracking-[0.35em] text-yora-cream/80 uppercase",
          !isExiting && "animate-banner-fade-up",
        )}
        style={{ animationDelay: "80ms" }}
      >
        Drop exclusivo
      </p>
      {!isExiting && <AnimatedBannerTitle text={banner.title} />}
      {isExiting && (
        <h1 className="max-w-xl font-display text-4xl leading-tight text-yora-cream md:text-6xl lg:text-7xl">
          {banner.title}
        </h1>
      )}
      {banner.subtitle && (
        <p
          className={cn(
            "mt-4 max-w-md text-sm leading-relaxed text-yora-cream/90 md:text-base",
            !isExiting && "animate-banner-fade-up",
          )}
          style={{
            animationDelay: `${120 + banner.title.length * 35 + 120}ms`,
          }}
        >
          {banner.subtitle}
        </p>
      )}
      {banner.buttonText && banner.buttonLink && (
        <div
          className={cn("mt-8", !isExiting && "animate-banner-fade-up")}
          style={{
            animationDelay: `${120 + banner.title.length * 35 + (banner.subtitle ? 220 : 120)}ms`,
          }}
        >
          <Button
            href={banner.buttonLink}
            variant="banner"
            size="lg"
          >
            {banner.buttonText}
          </Button>
        </div>
      )}
    </div>
  );
}

interface HeroBannerCarouselProps {
  banners: Banner[];
}

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<SlideDirection>("next");
  const [contentPhase, setContentPhase] = useState<ContentPhase>("entering");
  const [isAnimating, setIsAnimating] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeIndexRef = useRef(activeIndex);

  activeIndexRef.current = activeIndex;

  const total = banners.length;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  const transitionTo = useCallback(
    (index: number, slideDirection: SlideDirection) => {
      if (total <= 1 || isAnimating) return;

      const nextIndex = (index + total) % total;
      if (nextIndex === activeIndex) return;

      clearTimers();
      setIsAnimating(true);
      setDirection(slideDirection);
      setContentPhase("exiting");

      schedule(() => {
        setPreviousIndex(activeIndex);
        setActiveIndex(nextIndex);
        setContentPhase("entering");
        setProgressKey((key) => key + 1);
      }, CONTENT_EXIT_MS);

      schedule(() => {
        setPreviousIndex(null);
        setIsAnimating(false);
        setContentPhase("visible");
      }, CONTENT_EXIT_MS + SLIDE_ANIMATION_MS);
    },
    [activeIndex, clearTimers, isAnimating, schedule, total],
  );

  const goTo = useCallback(
    (index: number, slideDirection: SlideDirection) => {
      transitionTo(index, slideDirection);
    },
    [transitionTo],
  );

  useEffect(() => {
    if (total <= 1) return;

    const timer = setTimeout(() => {
      const current = activeIndexRef.current;
      transitionTo((current + 1) % total, "next");
    }, SLIDE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [progressKey, total, transitionTo]);

  useEffect(() => {
    setContentPhase("entering");
    const id = setTimeout(() => setContentPhase("visible"), 50);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  if (total === 0) return null;

  const activeBanner = banners[activeIndex];

  return (
    <section className="relative">
      <div className="relative h-[70vh] min-h-[480px] w-full overflow-hidden md:h-[85vh]">
        {banners.map((banner, index) => {
          const isActive = index === activeIndex;
          const isLeaving = isAnimating && index === previousIndex;
          const isEntering = isAnimating && isActive && previousIndex !== null;
          const isIdleActive = isActive && !isAnimating;
          const desktopImage = banner.imageUrl;
          const mobileImage = banner.mobileImageUrl ?? banner.imageUrl;

          if (!isActive && !isLeaving) return null;

          return (
            <div
              key={banner.id}
              className={cn(
                "absolute inset-0",
                isLeaving && direction === "next" && "animate-banner-slide-out-next z-10",
                isLeaving && direction === "prev" && "animate-banner-slide-out-prev z-10",
                isEntering && direction === "next" && "animate-banner-slide-in-next z-20",
                isEntering && direction === "prev" && "animate-banner-slide-in-prev z-20",
                isIdleActive && "z-10 opacity-100",
              )}
              aria-hidden={!isActive}
            >
              <div
                className={cn(
                  "relative h-full w-full",
                  isIdleActive && "animate-banner-image-zoom",
                )}
              >
                <Image
                  src={desktopImage}
                  alt={banner.title}
                  fill
                  priority={index === 0}
                  className="hidden object-cover object-center md:block"
                  sizes="100vw"
                />
                <Image
                  src={mobileImage}
                  alt={banner.title}
                  fill
                  priority={index === 0}
                  className="object-cover object-center md:hidden"
                  sizes="100vw"
                />
              </div>
            </div>
          );
        })}

        <div className="absolute inset-0 z-20 bg-gradient-to-r from-yora-charcoal/60 via-yora-charcoal/30 to-transparent transition-opacity duration-700" />

        <div className="relative z-30 h-full">
          <HeroBannerContent
            key={`${activeBanner.id}-${progressKey}`}
            banner={activeBanner}
            phase={contentPhase}
          />
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1, "prev")}
            className="absolute top-1/2 left-4 z-40 -translate-y-1/2 p-2 text-yora-cream/80 transition-colors hover:text-yora-cream"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1, "next")}
            className="absolute top-1/2 right-4 z-40 -translate-y-1/2 p-2 text-yora-cream/80 transition-colors hover:text-yora-cream"
            aria-label="Próximo banner"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-8 left-1/2 z-40 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() =>
                  goTo(index, getSlideDirection(activeIndex, index, total))
                }
                className={cn(
                  "relative h-2 overflow-hidden rounded-full transition-all duration-500",
                  index === activeIndex
                    ? "w-8 bg-yora-cream/30"
                    : "w-2 bg-yora-cream/40 hover:bg-yora-cream/70",
                )}
                aria-label={`Ir para banner ${index + 1}`}
              >
                {index === activeIndex && !isAnimating && (
                  <span
                    key={progressKey}
                    className="animate-banner-dot-progress absolute inset-0 origin-left rounded-full bg-yora-cream"
                    style={{ animationDuration: `${SLIDE_DURATION_MS}ms` }}
                  />
                )}
              </button>
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
