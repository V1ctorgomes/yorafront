import { CollectionCard } from "@/components/home/CollectionCard";
import { CollectionsCarousel } from "@/components/home/CollectionsCarousel";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { fetchActiveCollections } from "@/lib/api/collections";

export async function CollectionsSection() {
  const collections = await fetchActiveCollections({ featured: true });

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <SectionTitle
        title="Coleções"
        subtitle="Drops e lançamentos exclusivos da Yora."
      />

      <div className="grid gap-4 md:hidden">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>

      <div className="hidden md:block">
        <CollectionsCarousel collections={collections} />
      </div>
    </section>
  );
}
