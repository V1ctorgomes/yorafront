import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/colecoes/${collection.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden"
    >
      <Image
        src={collection.image}
        alt={collection.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-yora-charcoal/70 via-yora-charcoal/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <h3 className="font-display text-2xl text-yora-cream md:text-3xl">
          {collection.name}
        </h3>
        <span className="mt-2 inline-block text-xs tracking-widest text-yora-cream/80 uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Explorar →
        </span>
      </div>
    </Link>
  );
}
