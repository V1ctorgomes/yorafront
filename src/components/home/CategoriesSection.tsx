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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
