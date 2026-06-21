import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function BrandStory() {
  return (
    <section className="bg-yora-sand">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24 lg:px-8">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80"
            alt="Mulher vestindo peças Yora"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="md:pl-8 lg:pl-16">
          <p className="text-xs tracking-[0.35em] text-yora-taupe uppercase">
            Nossa essência
          </p>
          <h2 className="mt-4 font-display text-3xl leading-snug text-yora-charcoal md:text-4xl lg:text-5xl">
            Movimento com presença, todos os dias
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-yora-muted md:text-base">
            A Yora nasce da interseção entre performance e estilo de vida. Cada
            drop é pensado em edições limitadas — tecidos premium, modelagens
            que abraçam o corpo e uma estética que acompanha você do studio à
            rua.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-yora-muted md:text-base">
            Inspirada na energia de quem treina com intenção e vive com
            propósito, nossa marca traduz bem-estar em peças atemporais.
          </p>
          <div className="mt-8">
            <Button href="/sobre" variant="outline">
              Conheça a Yora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
