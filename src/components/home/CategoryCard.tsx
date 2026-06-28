import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categoria/${category.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden bg-yora-sand"
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-yora-sand to-yora-taupe/30" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-yora-charcoal/70 via-yora-charcoal/10 to-transparent transition-all duration-500 group-hover:from-yora-charcoal/90 group-hover:backdrop-blur-[2px]" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <h3 className="font-display text-2xl text-yora-cream md:text-3xl">
          {category.name}
        </h3>
        <span className="mt-2 inline-block text-xs tracking-widest text-yora-cream/80 uppercase opacity-100 md:opacity-0 transition-all duration-300 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0">
          Explorar →
        </span>
      </div>
    </Link>
  );
}
