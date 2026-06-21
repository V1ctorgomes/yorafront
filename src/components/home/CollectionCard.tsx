import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/colecao/${collection.slug}`}
      className="group relative block aspect-[16/10] overflow-hidden bg-yora-sand md:aspect-[21/9]"
    >
      <Image
        src={collection.bannerImageUrl}
        alt={collection.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-yora-charcoal/75 via-yora-charcoal/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="text-xs tracking-[0.35em] text-yora-cream/80 uppercase">
          Coleção
        </p>
        <h3 className="mt-2 font-display text-3xl text-yora-cream md:text-4xl">
          {collection.name}
        </h3>
        <span className="mt-3 inline-block text-xs tracking-widest text-yora-cream/80 uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Ver coleção →
        </span>
      </div>
    </Link>
  );
}
