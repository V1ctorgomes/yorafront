import Link from "next/link";
import { CollectionCard } from "@/components/home/CollectionCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { fetchActiveCollections } from "@/lib/api/collections";

export default async function ColecoesPage() {
  const collections = await fetchActiveCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <SectionTitle
        title="Coleções"
        subtitle="Explore os drops e lançamentos da YORA."
      />

      {collections.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-16 text-center">
          <p className="font-display text-2xl text-yora-charcoal">
            Nenhuma coleção disponível
          </p>
          <p className="mt-3 text-sm text-yora-muted">
            Volte em breve para conferir novos lançamentos.
          </p>
          <Link
            href="/novidades"
            className="mt-6 inline-block text-sm text-yora-charcoal underline underline-offset-4"
          >
            Ver novidades
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}
