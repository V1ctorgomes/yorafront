import { CategoryCard } from "@/components/home/CategoryCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { fetchActiveCategories } from "@/lib/api/categories";

export async function CategoriesSection() {
  const categories = await fetchActiveCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <SectionTitle
        title="Compre por categoria"
        subtitle="Encontre a peça ideal para cada momento do seu dia."
      />
      <div className="flex gap-5 md:gap-6 lg:gap-8">
        {categories.map((category) => (
          <div key={category.id} className="min-w-0 flex-1">
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </section>
  );
}
