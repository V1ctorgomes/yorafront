import { fetchActiveCategories } from "@/lib/api/categories";
import { Header } from "@/components/layout/Header";

export async function HeaderWrapper() {
  const categories = await fetchActiveCategories();
  return <Header categories={categories} />;
}
