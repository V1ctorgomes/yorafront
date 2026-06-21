import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { Banner } from "@/types";

interface HeroBannerProps {
  banner: Banner;
}

export function HeroBanner({ banner }: HeroBannerProps) {
  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden md:h-[85vh]">
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        priority
        className="object-cover object-center"
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
        <p className="mt-4 max-w-md text-sm leading-relaxed text-yora-cream/90 md:text-base">
          {banner.subtitle}
        </p>
        <div className="mt-8">
          <Button href={banner.buttonLink} variant="outline" size="lg" className="border-yora-cream text-yora-cream hover:bg-yora-cream hover:text-yora-charcoal">
            {banner.buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
